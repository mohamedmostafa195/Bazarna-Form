import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Search by ObjectId or slug
    let event = null;
    if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
      event = await prisma.event.findUnique({
        where: { id },
        include: { packages: true, questions: true },
      });
    }

    if (!event) {
      event = await prisma.event.findUnique({
        where: { slug: id },
        include: { packages: true, questions: true },
      });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch event" },
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

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        highlights: typeof body.highlights === "string" ? body.highlights : JSON.stringify(body.highlights || []),
        coverImage: body.coverImage,
        location: body.location,
        googleMapsUrl: body.googleMapsUrl,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        startTime: body.startTime,
        endTime: body.endTime,
        status: body.status,
        capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
        termsAndConditions: body.termsAndConditions,
        tcVersion: body.tcVersion,
        paymentInstructions: body.paymentInstructions,
        bankName: body.bankName,
        accountName: body.accountName,
        accountNumber: body.accountNumber,
        instapayHandle: body.instapayHandle,
      },
      include: {
        packages: true,
        questions: true,
      },
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update event" },
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

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error: any) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
