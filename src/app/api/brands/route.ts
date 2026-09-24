import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        documents: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, brands });
  } catch (error: any) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
