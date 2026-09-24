import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    let application = null;
    if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
      application = await prisma.application.findUnique({
        where: { id },
        include: {
          brand: { include: { documents: true } },
          event: { include: { packages: true } },
          package: true,
          payment: true,
          answers: true,
        },
      });
    }

    if (!application) {
      application = await prisma.application.findUnique({
        where: { applicationCode: id },
        include: {
          brand: { include: { documents: true } },
          event: { include: { packages: true } },
          package: true,
          payment: true,
          answers: true,
        },
      });
    }

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      appStatus,
      paymentStatus,
      assignedBooth,
      adminNote,
      adminName = "Admin",
      receiptFileUrl,
      receiptFileName,
    } = body;

    const dataToUpdate: any = {};
    if (appStatus) dataToUpdate.appStatus = appStatus;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (assignedBooth !== undefined) dataToUpdate.assignedBooth = assignedBooth;

    const updated = await prisma.application.update({
      where: { id },
      data: dataToUpdate,
      include: {
        brand: {
          include: {
            documents: true,
          },
        },
        event: true,
        package: true,
        payment: true,
        answers: true,
      },
    });

    // Update payment record if status, receipt, or adminNote provided
    if (paymentStatus || adminNote || receiptFileUrl) {
      const paymentUpdateData: any = {};
      if (paymentStatus) {
        paymentUpdateData.paymentStatus = paymentStatus;
        if (paymentStatus === "PAID") {
          paymentUpdateData.verifiedAt = new Date();
        }
      }
      if (receiptFileUrl) {
        paymentUpdateData.receiptFileUrl = receiptFileUrl;
        paymentUpdateData.receiptFileName = receiptFileName || "receipt.jpg";
        paymentUpdateData.uploadedAt = new Date();
      }
      if (adminNote) paymentUpdateData.adminNote = adminNote;

      await prisma.payment.updateMany({
        where: { applicationId: id },
        data: paymentUpdateData,
      });
    }

    // Create Audit Log
    let logAction = `Updated application ${updated.applicationCode}`;
    if (appStatus) logAction = `Changed status to ${appStatus} for ${updated.applicationCode}`;
    if (paymentStatus) logAction = `Verified payment as ${paymentStatus} for ${updated.applicationCode}`;

    await prisma.auditLog.create({
      data: {
        adminName,
        action: logAction,
        targetType: "APPLICATION",
        targetId: id,
        details: adminNote || `Updated status to ${appStatus || paymentStatus}`,
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error("PATCH /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Find the application first
    let app = null;
    if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
      app = await prisma.application.findUnique({ where: { id } });
    }
    if (!app) {
      app = await prisma.application.findUnique({ where: { applicationCode: id } });
    }

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Delete related payment and answers
    await prisma.payment.deleteMany({ where: { applicationId: app.id } });
    await prisma.applicationAnswer.deleteMany({ where: { applicationId: app.id } });

    // Restore package inventory if needed
    if (app.packageId) {
      await prisma.eventPackage.update({
        where: { id: app.packageId },
        data: { remainingQty: { increment: 1 } },
      }).catch(() => null);
    }

    // Delete application
    await prisma.application.delete({ where: { id: app.id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminName: "Admin Operations",
        action: `Deleted application ${app.applicationCode}`,
        targetType: "APPLICATION",
        targetId: app.id,
        details: `Application ${app.applicationCode} was permanently deleted.`,
      },
    });

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete application" },
      { status: 500 }
    );
  }
}
