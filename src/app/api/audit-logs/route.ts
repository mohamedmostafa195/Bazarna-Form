import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("GET /api/audit-logs error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminName, action, targetType, targetId, details } = body;

    const log = await prisma.auditLog.create({
      data: {
        adminName: adminName || "Admin",
        action,
        targetType,
        targetId: targetId || "",
        details: typeof details === "string" ? details : JSON.stringify(details || {}),
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("POST /api/audit-logs error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create audit log" },
      { status: 500 }
    );
  }
}
