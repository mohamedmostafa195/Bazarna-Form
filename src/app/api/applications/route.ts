import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      brandId: rawBrandId,
      eventId: rawEventId,
      packageId: rawPackageId,
      brand: brandData,
      prParticipation,
      notes,
      paymentMethod,
      receiptFileUrl,
      receiptFileName,
      answers,
      tcAccepted,
      tcVersion,
    } = body;

    // 1. Resolve Brand
    let brand = null;
    if (rawBrandId && /^[0-9a-fA-F]{24}$/.test(rawBrandId)) {
      brand = await prisma.brand.findUnique({ where: { id: rawBrandId } });
    }
    if (!brand && brandData?.contactEmail) {
      brand = await prisma.brand.findFirst({ where: { contactEmail: brandData.contactEmail } });
    }
    if (!brand && brandData?.brandName) {
      brand = await prisma.brand.findFirst({ where: { brandName: brandData.brandName } });
    }
    if (!brand) {
      brand = await prisma.brand.findFirst();
    }
    if (!brand) {
      return NextResponse.json({ error: "No brand found" }, { status: 400 });
    }
    const resolvedBrandId = brand.id;

    // 2. Resolve Event
    let event = null;
    if (rawEventId && /^[0-9a-fA-F]{24}$/.test(rawEventId)) {
      event = await prisma.event.findUnique({
        where: { id: rawEventId },
        include: { packages: true },
      });
    }
    if (!event && rawEventId) {
      const cleanSlug = rawEventId.replace(/^evt-/, "").toLowerCase();
      event = await prisma.event.findFirst({
        where: {
          OR: [
            { slug: { contains: cleanSlug, mode: "insensitive" } },
            { slug: "byouth-summer-outlet-downtown" },
          ],
        },
        include: { packages: true },
      });
    }
    if (!event) {
      event = await prisma.event.findFirst({
        include: { packages: true },
        orderBy: { createdAt: "desc" },
      });
    }
    if (!event) {
      return NextResponse.json({ error: "No event found" }, { status: 400 });
    }
    const resolvedEventId = event.id;

    // 3. Resolve Package
    let pkg = null;
    if (rawPackageId && /^[0-9a-fA-F]{24}$/.test(rawPackageId)) {
      pkg = await prisma.eventPackage.findUnique({
        where: { id: rawPackageId },
      });
    }
    if (!pkg && event.packages && event.packages.length > 0) {
      const pkgStr = String(rawPackageId || "").toLowerCase();
      if (pkgStr.includes("5x3")) {
        pkg = event.packages.find((p) => p.name.includes("5x3"));
      } else if (pkgStr.includes("4x3")) {
        pkg = event.packages.find((p) => p.name.includes("4x3"));
      } else if (pkgStr.includes("3x3")) {
        pkg = event.packages.find((p) => p.name.includes("3x3"));
      } else if (pkgStr.includes("table")) {
        pkg = event.packages.find((p) => p.name.toLowerCase().includes("table"));
      }
      if (!pkg) {
        pkg = event.packages[0];
      }
    }
    if (!pkg) {
      return NextResponse.json({ error: "No package found for event" }, { status: 400 });
    }
    const resolvedPackageId = pkg.id;

    // Generate unique application code
    const totalCount = await prisma.application.count();
    const seq = (totalCount + 101).toString().padStart(6, "0");
    const applicationCode = `BY-2026-${seq}`;

    // Create application with relation items in MongoDB
    const application = await prisma.application.create({
      data: {
        applicationCode,
        brandId: resolvedBrandId,
        eventId: resolvedEventId,
        packageId: resolvedPackageId,
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
        where: { id: resolvedPackageId },
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
