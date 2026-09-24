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

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.brandName !== undefined) dataToUpdate.brandName = body.brandName;
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.aboutBrand !== undefined) dataToUpdate.aboutBrand = body.aboutBrand;
    if (body.products !== undefined) dataToUpdate.products = body.products;
    if (body.instagram !== undefined) dataToUpdate.instagram = body.instagram;
    if (body.facebook !== undefined) dataToUpdate.facebook = body.facebook;
    if (body.tiktok !== undefined) dataToUpdate.tiktok = body.tiktok;
    if (body.website !== undefined) dataToUpdate.website = body.website;
    if (body.otherSocial !== undefined) dataToUpdate.otherSocial = body.otherSocial;
    if (body.contactName !== undefined) dataToUpdate.contactName = body.contactName;
    if (body.contactEmail !== undefined) dataToUpdate.contactEmail = body.contactEmail;
    if (body.contactPhone !== undefined) dataToUpdate.contactPhone = body.contactPhone;
    if (body.taxId !== undefined) dataToUpdate.taxId = body.taxId;
    if (body.nationalId !== undefined) dataToUpdate.nationalId = body.nationalId;

    await prisma.brand.update({
      where: { id },
      data: dataToUpdate,
    });

    // Save and upsert brand documents if provided
    if (Array.isArray(body.documents) && body.documents.length > 0) {
      for (const doc of body.documents) {
        if (!doc.documentType || !doc.fileUrl) continue;

        const existingDoc = await prisma.brandDocument.findFirst({
          where: {
            brandId: id,
            documentType: doc.documentType,
          },
        });

        if (existingDoc) {
          await prisma.brandDocument.update({
            where: { id: existingDoc.id },
            data: {
              fileName: doc.fileName || `${doc.documentType}.png`,
              fileUrl: doc.fileUrl,
              fileSize: doc.fileSize || 0,
              status: doc.status || "UPLOADED",
            },
          });
        } else {
          await prisma.brandDocument.create({
            data: {
              brandId: id,
              documentType: doc.documentType,
              fileName: doc.fileName || `${doc.documentType}.png`,
              fileUrl: doc.fileUrl,
              fileSize: doc.fileSize || 0,
              status: doc.status || "UPLOADED",
            },
          });
        }
      }
    }

    const updatedBrand = await prisma.brand.findUnique({
      where: { id },
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
