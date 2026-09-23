import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, brand });
  } catch (error: any) {
    console.error("GET /api/brands/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        brandName: body.brandName,
        category: body.category,
        aboutBrand: body.aboutBrand,
        products: body.products,
        instagram: body.instagram,
        facebook: body.facebook,
        tiktok: body.tiktok,
        website: body.website,
        otherSocial: body.otherSocial,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        taxId: body.taxId,
        nationalId: body.nationalId,
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json({ success: true, brand: updatedBrand });
  } catch (error: any) {
    console.error("PUT /api/brands/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update brand" },
      { status: 500 }
    );
  }
}
