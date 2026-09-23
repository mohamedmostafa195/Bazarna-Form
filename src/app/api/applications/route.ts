import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    const whereClause: any = {};
    if (brandId && brandId.length === 24) {
      whereClause.brandId = brandId;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        brand: true,
        event: true,
        package: true,
        payment: true,
        answers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      brandId,
      eventId,
      packageId,
      prParticipation,
      notes,
      paymentMethod,
      receiptFileUrl,
      receiptFileName,
      answers,
      tcAccepted,
      tcVersion,
    } = body;

    if (!brandId || !eventId || !packageId) {
      return NextResponse.json(
        { error: "brandId, eventId, and packageId are required" },
        { status: 400 }
      );
    }

    // Generate unique application code
    const totalCount = await prisma.application.count();
    const seq = (totalCount + 101).toString().padStart(6, "0");
    const applicationCode = `BY-2026-${seq}`;

    // Fetch package for pricing info
    const pkg = await prisma.eventPackage.findUnique({
      where: { id: packageId },
    });

    // Create application with relation items in MongoDB
    const application = await prisma.application.create({
      data: {
        applicationCode,
        brandId,
        eventId,
        packageId,
        prParticipation: !!prParticipation,
        notes: notes || "",
        appStatus: "SUBMITTED",
        paymentStatus: receiptFileUrl ? "RECEIPT_UPLOADED" : "PENDING",
        tcAccepted: tcAccepted !== false,
        tcVersion: tcVersion || "1.0",
        payment: {
          create: {
            amount: pkg?.price || 0,
            currency: "EGP",
            method: paymentMethod || "BANK_TRANSFER",
            receiptFileUrl: receiptFileUrl || null,
            receiptFileName: receiptFileName || null,
            paymentStatus: receiptFileUrl ? "RECEIPT_UPLOADED" : "PENDING",
            uploadedAt: receiptFileUrl ? new Date() : null,
          },
        },
        answers: {
          create: (answers || [])
            .filter(
              (ans: any) =>
                ans.questionId &&
                typeof ans.questionId === "string" &&
                ans.questionId.length === 24 &&
                /^[0-9a-fA-F]{24}$/.test(ans.questionId)
            )
            .map((ans: any) => ({
              questionId: ans.questionId,
              answerText: String(ans.answerText || ""),
            })),
        },
      },
      include: {
        brand: true,
        event: true,
        package: true,
        payment: true,
        answers: true,
      },
    });

    // Decrement package remainingQty if > 0
    if (pkg && pkg.remainingQty > 0) {
      await prisma.eventPackage.update({
        where: { id: packageId },
        data: { remainingQty: { decrement: 1 } },
      });
    }

    // Log administrative audit entry
    await prisma.auditLog.create({
      data: {
        adminName: "System",
        action: `Submitted Application ${applicationCode}`,
        targetType: "APPLICATION",
        targetId: application.id,
        details: `Vendor application received for ${application.event?.name || "event"}`,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
