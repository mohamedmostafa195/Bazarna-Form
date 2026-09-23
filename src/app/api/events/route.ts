import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        packages: true,
        questions: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      highlights,
      coverImage,
      location,
      googleMapsUrl,
      startDate,
      endDate,
      startTime,
      endTime,
      regOpenDate,
      regCloseDate,
      status,
      capacity,
      termsAndConditions,
      tcVersion,
      paymentInstructions,
      bankName,
      accountName,
      accountNumber,
      instapayHandle,
      packages,
      questions,
    } = body;

    if (!name || !description || !location) {
      return NextResponse.json(
        { error: "Event name, description, and location are required" },
        { status: 400 }
      );
    }

    const cleanSlug =
      (slug || name)
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      `-${Date.now().toString().slice(-4)}`;

    const newEvent = await prisma.event.create({
      data: {
        name,
        slug: cleanSlug,
        description,
        highlights: typeof highlights === "string" ? highlights : JSON.stringify(highlights || []),
        coverImage: coverImage || "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80",
        location,
        googleMapsUrl: googleMapsUrl || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 86400000),
        startTime: startTime || "11:00 AM",
        endTime: endTime || "11:00 PM",
        regOpenDate: regOpenDate ? new Date(regOpenDate) : new Date(),
        regCloseDate: regCloseDate ? new Date(regCloseDate) : new Date(Date.now() + 86400000 * 7),
        status: status || "REGISTRATION_OPEN",
        capacity: Number(capacity) || 100,
        termsAndConditions: termsAndConditions || "Standard Bazarna event terms and regulations apply.",
        tcVersion: tcVersion || "1.0",
        paymentInstructions: paymentInstructions || null,
        bankName: bankName || "Commercial International Bank (CIB)",
        accountName: accountName || "BAZARNA SOCIETY FOR EVENTS SAE",
        accountNumber: accountNumber || "100075173867",
        instapayHandle: instapayHandle || "bazarnasociety@cib",
        packages: {
          create: (packages || []).map((pkg: any) => ({
            name: pkg.name,
            price: Number(pkg.price) || 0,
            description: pkg.description || "",
            includedItems: pkg.includedItems || "",
            image: pkg.image || null,
            totalQty: Number(pkg.totalQty) || 30,
            remainingQty: Number(pkg.remainingQty !== undefined ? pkg.remainingQty : pkg.totalQty) || 30,
            isActive: pkg.isActive !== false,
          })),
        },
        questions: {
          create: (questions || []).map((q: any, idx: number) => ({
            questionText: q.questionText,
            questionType: q.questionType || "TEXT",
            isRequired: !!q.isRequired,
            orderIndex: Number(q.orderIndex !== undefined ? q.orderIndex : idx + 1),
          })),
        },
      },
      include: {
        packages: true,
        questions: true,
      },
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
