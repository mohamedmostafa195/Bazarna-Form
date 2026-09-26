import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { arePhoneNumbersEqual } from "@/lib/phone-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandName, category, contactName, email, password, contactPhone } = body;

    if (!email || !password || !brandName || !contactName || !contactPhone) {
      return NextResponse.json(
        { error: "Please fill in all required fields including contact phone." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = contactPhone.trim();

    // 1. Strict Unique Email check (both User account and Brand contactEmail)
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    });

    const existingBrandEmail = await prisma.brand.findFirst({
      where: { contactEmail: { equals: cleanEmail, mode: "insensitive" } },
    });

    if (existingUser || existingBrandEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists. / هذا البريد الإلكتروني مسجل بالفعل." },
        { status: 409 }
      );
    }

    // 2. Strict Unique Mobile Number check (both User.phone and Brand.contactPhone)
    const existingUsersWithPhone = await prisma.user.findMany({
      where: { phone: { not: null } },
      select: { phone: true },
    });

    const existingBrandsWithPhone = await prisma.brand.findMany({
      select: { contactPhone: true },
    });

    const isDuplicatePhone =
      existingUsersWithPhone.some((u) => arePhoneNumbersEqual(u.phone, cleanPhone)) ||
      existingBrandsWithPhone.some((b) => arePhoneNumbersEqual(b.contactPhone, cleanPhone));

    if (isDuplicatePhone) {
      return NextResponse.json(
        {
          error:
            "This mobile phone number is already registered to another brand account. / رقم الهاتف المحمول مسجل بالفعل لحساب آخر.",
        },
        { status: 409 }
      );
    }

    // Create user and brand in MongoDB Atlas
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash: password, // For production a bcrypt hash is recommended
        name: contactName,
        phone: contactPhone || null,
        role: "BRAND",
        brand: {
          create: {
            brandName,
            category: category || "Fashion",
            contactName,
            contactEmail: cleanEmail,
            contactPhone: contactPhone || "",
          },
        },
      },
      include: {
        brand: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        brandId: newUser.brand?.id,
        brand: newUser.brand,
      },
    });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to register" },
      { status: 500 }
    );
  }
}
