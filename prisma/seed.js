const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean old records
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.applicationAnswer.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.eventQuestion.deleteMany({});
  await prisma.eventPackage.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.brandDocument.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Admin & Demo Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@bazarna.com",
      passwordHash: "demo_hash_admin",
      name: "Ahmed Operations",
      phone: "+20 100 000 0001",
      role: "SUPER_ADMIN",
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      email: "finance@bazarna.com",
      passwordHash: "demo_hash_finance",
      name: "Dina Finance",
      phone: "+20 100 000 0002",
      role: "FINANCE",
    },
  });

  const brandUser = await prisma.user.create({
    data: {
      email: "farida@cairothreads.eg",
      passwordHash: "demo_hash_brand",
      name: "Farida Mansour",
      phone: "+20 100 123 4567",
      role: "BRAND",
    },
  });

  // 2. Create Brand Profile
  const brand = await prisma.brand.create({
    data: {
      userId: brandUser.id,
      brandName: "Cairo Threads",
      category: "Fashion Wear",
      aboutBrand: "Contemporary Egyptian streetwear brand blending authentic heritage typography with modern oversized cuts and premium Egyptian cotton.",
      products: "Oversized t-shirts, embroidered hoodies, linen cargo pants, caps",
      instagram: "https://instagram.com/cairothreads",
      facebook: "https://facebook.com/cairothreadseg",
      tiktok: "https://tiktok.com/@cairothreads",
      website: "https://cairothreads.eg",
      contactName: "Farida Mansour",
      contactEmail: "farida@cairothreads.eg",
      contactPhone: "+20 100 123 4567",
      taxId: "492-819-204",
      nationalId: "29804150102938",
      documents: {
        create: [
          {
            documentType: "TAX_ID_CARD",
            fileUrl: "https://placehold.co/800x600/f4f8ed/8ebf42.png?text=Tax+ID+Card+-+Cairo+Threads",
            fileName: "cairo_threads_tax_card.pdf",
            fileSize: 1048576,
            status: "APPROVED",
          },
          {
            documentType: "NATIONAL_ID",
            fileUrl: "https://placehold.co/800x600/fefce8/eab308.png?text=National+ID+-+Farida+Mansour",
            fileName: "farida_mansour_national_id.jpg",
            fileSize: 2097152,
            status: "APPROVED",
          },
        ],
      },
    },
  });

  // 3. Create Events
  const event1 = await prisma.event.create({
    data: {
      name: "B.youth Summer Outlet Market at Downtown Katameya | Friday 18th of September",
      slug: "byouth-summer-outlet-downtown",
      description: "Join Egypt's premier creative youth pop-up market! B.youth gathers over 50+ cutting-edge local Egyptian fashion, jewelry, and lifestyle brands for an energetic 1-day shopping festival at Downtown Katameya Mall.",
      highlights: JSON.stringify([
        "50+ Curated Egyptian Youth Fashion & Lifestyle Brands",
        "Dedicated Influencer & PR Gifting Suite for participating brands",
        "Prime High-Footfall Central Courtyard at Downtown Katameya",
        "Live Acoustic & DJ Sets throughout the day",
      ]),
      coverImage: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80",
      location: "Downtown Katameya Mall, New Cairo, Egypt",
      googleMapsUrl: "https://maps.google.com/?q=Downtown+Katameya+Mall+New+Cairo",
      startDate: new Date("2026-09-18T11:00:00.000Z"),
      endDate: new Date("2026-09-18T23:00:00.000Z"),
      startTime: "11:00 AM",
      endTime: "11:00 PM",
      regOpenDate: new Date("2026-08-01T00:00:00.000Z"),
      regCloseDate: new Date("2026-09-14T23:59:59.000Z"),
      status: "REGISTRATION_OPEN",
      capacity: 65,
      termsAndConditions: "Booking confirmation is strictly conditional upon full payment receipt upload and administrative verification. Set-up starts strictly at 9:00 AM.",
      tcVersion: "2026.1",
      bankName: "Commercial International Bank (CIB)",
      accountName: "BAZARNA SOCIETY FOR EVENTS SAE",
      accountNumber: "100075173867",
      instapayHandle: "bazarnasociety@cib",
      packages: {
        create: [
          {
            name: "5x3 Space - (3 Racks Included)",
            price: 34211,
            description: "Our largest premier fashion booth space. Ideal for established brands with extensive collections.",
            includedItems: "5x3m Designated Area, 3 Heavy-Duty Clothes Racks, 2 Director Chairs, 170cm Wooden Front Table, 1 Electricity Plug",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
            totalQty: 15,
            remainingQty: 6,
            isActive: true,
          },
          {
            name: "Table Package (Wooden Front 190cm)",
            price: 15789,
            description: "Perfect for jewelry, skincare, cosmetics, curated scents, sunglasses, and compact accessories.",
            includedItems: "190cm Premium Wooden Table with Front Skirting, 2 High Stool Chairs, Electricity Plug",
            image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=800&q=80",
            totalQty: 30,
            remainingQty: 14,
            isActive: true,
          },
        ],
      },
      questions: {
        create: [
          {
            questionText: "How many staff members will attend your booth on the event day?",
            questionType: "NUMBER",
            isRequired: true,
            orderIndex: 1,
          },
          {
            questionText: "Do you require high-voltage electricity for special equipment?",
            questionType: "YES_NO",
            isRequired: true,
            orderIndex: 2,
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully with event:", event1.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
