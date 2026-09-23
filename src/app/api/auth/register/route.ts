import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandName, category, contactName, email, password, contactPhone } = body;

    if (!email || !password || !brandName || !contactName) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
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
