import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { arePhoneNumbersEqual } from "@/lib/phone-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, newPassword } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Please provide your registered email address. / يرجى إدخال البريد الإلكتروني." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If only email is provided -> "Send Reset Link" flow
    if (!phone && !newPassword) {
      const user = await prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: "insensitive" } },
        include: { brand: true },
      });

      if (!user) {
        // Return 404 or success to prevent email fishing - let's return clear message
        return NextResponse.json(
          { error: "No account found matching this email address. / لا يوجد حساب مسجل بهذا البريد الإلكتروني." },
          { status: 404 }
        );
      }

      // Log the reset request in Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            adminName: user.name || "User Self-Service",
            action: "PASSWORD_RESET_LINK_REQUESTED",
            targetType: "BRAND",
            targetId: user.brand?.id || user.id,
            details: `Password reset link requested for email: ${user.email}`,
          },
        });
      } catch {
        // Audit log optional
      }

      return NextResponse.json({
        success: true,
        message: "Reset link instructions have been sent successfully. / تم إرسال رابط استعادة كلمة المرور بنجاح.",
      });
    }

    // 2. Full reset flow with phone verification & new password
    if (!phone || !newPassword) {
      return NextResponse.json(
        {
          error:
            "Please provide your registered phone number and new password. / يرجى إدخال رقم الهاتف المسجل وكلمة المرور الجديدة.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long. / كلمة المرور يجب ألا تقل عن 6 أحرف.",
        },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
      include: { brand: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "No account found matching this email address. / لم يتم العثور على أي حساب مسجل بهذا البريد الإلكتروني.",
        },
        { status: 404 }
      );
    }

    const userPhone = user.phone || user.brand?.contactPhone;
    const isPhoneMatch = userPhone && arePhoneNumbersEqual(userPhone, cleanPhone);

    if (!isPhoneMatch) {
      return NextResponse.json(
        {
          error:
            "The phone number provided does not match the registered contact number for this account. / رقم الهاتف غير مطابق لرقم الاتصال المسجل لهذا الحساب.",
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPassword,
        updatedAt: new Date(),
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          adminName: user.name || "User Self-Service",
          action: "PASSWORD_RESET",
          targetType: "BRAND",
          targetId: user.brand?.id || user.id,
          details: `Password reset successfully completed for account ${user.email}`,
        },
      });
    } catch {
      // Audit log optional
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. / تم إعادة تعيين كلمة المرور بنجاح.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
