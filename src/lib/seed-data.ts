import { BazarnaEvent, BrandProfile, EventApplication, AuditLogEntry, AppNotification } from "./types";

export const INITIAL_EVENTS: BazarnaEvent[] = [
  {
    id: "evt-byouth-summer-2026",
    name: "B.youth Summer Outlet Market at Downtown Katameya | Friday 18th of September",
    slug: "byouth-summer-outlet-downtown",
    description:
      "Join Egypt's premier creative youth pop-up market! B.youth gathers over 50+ cutting-edge local Egyptian fashion, jewelry, and lifestyle brands for an energetic 1-day shopping festival at Downtown Katameya Mall. Brands receive extensive media coverage, curated influencer gifting suites, and access to thousands of prime retail shoppers.",
    highlights: [
      "50+ Curated Egyptian Youth Fashion & Lifestyle Brands",
      "Dedicated Influencer & PR Gifting Suite for participating brands",
      "Prime High-Footfall Central Courtyard at Downtown Katameya",
      "Live Acoustic & DJ Sets throughout the day",
      "Official Bazarna marketing campaign reaching 250k+ fashion enthusiasts",
    ],
    coverImage: "/images/bazarna-symbol.png",
    location: "Downtown Katameya Mall, New Cairo, Egypt",
    googleMapsUrl: "https://maps.google.com/?q=Downtown+Katameya+Mall+New+Cairo",
    startDate: "2026-09-18T11:00:00.000Z",
    endDate: "2026-09-18T23:00:00.000Z",
    startTime: "11:00 AM",
    endTime: "11:00 PM",
    regOpenDate: "2026-08-01T00:00:00.000Z",
    regCloseDate: "2026-09-14T23:59:59.000Z",
    status: "REGISTRATION_OPEN",
    capacity: 65,
    termsAndConditions: `### BAZARNA SOCIETY — TERMS & CONDITIONS OF PARTICIPATION
**Event**: B.youth Summer Outlet Market at Downtown Katameya
**Date**: Friday 18th of September 2026 | 11:00 AM – 11:00 PM

1. **Brand Selection & Commitment**:
   - Booking confirmation is strictly conditional upon full payment receipt upload and administrative verification.
   - Booth spaces cannot be sub-leased, shared, or transferred without prior written approval from Bazarna management.

2. **Display & Setup Regulations**:
   - Set-up starts strictly at 9:00 AM and must be completed by 10:30 AM before doors open to the public.
   - All display fixtures, racks, and tables must remain within your designated booth boundaries.
   - Dismantling before 11:00 PM is strictly prohibited to maintain an exceptional attendee experience.

3. **PR Campaign & Gifting (If opted-in)**:
   - Brands confirming PR participation commit to providing selected gifted items to accredited fashion bloggers and content creators as arranged by the Bazarna PR team without additional compensation.

4. **Cancellation & Refund Policy**:
   - Cancellations made 14+ days before the event receive a 50% refund.
   - Cancellations within 14 days of the event are non-refundable due to logistics and space allocation commitments.

5. **Security & Liability**:
   - Bazarna Society provides overall venue security; however, each brand remains solely responsible for the safety of their merchandise and personal belongings.`,
    tcVersion: "2026.1",
    paymentInstructions:
      "Please transfer the full package amount to our CIB bank account or via Instapay. Make sure to upload a clear screenshot or photo of the payment receipt to finalize your application.",
    bankName: "Commercial International Bank (CIB)",
    accountName: "BAZARNA SOCIETY FOR EVENTS SAE",
    accountNumber: "100075173867",
    instapayHandle: "bazarnasociety@cib",
    packages: [
      {
        id: "pkg-rack-5x3",
        eventId: "evt-byouth-summer-2026",
        name: "5x3 Space - (3 Racks Included)",
        price: 34211,
        description:
          "Our largest premier fashion booth space. Ideal for established brands with extensive collections.",
        includedItems:
          "5x3m Designated Area, 3 Heavy-Duty Clothes Racks, 2 Director Chairs, 170cm Wooden Front Table, 1 Dedicated Electricity Plug (220V), 3 Exhibitor Badges",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
        totalQty: 15,
        remainingQty: 6,
        isActive: true,
      },
      {
        id: "pkg-rack-4x3",
        eventId: "evt-byouth-summer-2026",
        name: "4x3 Space - (3 Racks Included)",
        price: 28500,
        description:
          "Spacious corner and avenue locations providing excellent walk-in room for shoppers.",
        includedItems:
          "4x3m Designated Area, 3 Clothes Racks, 2 Chairs, 150cm Display Table, 1 Electricity Plug, 2 Exhibitor Badges",
        image:
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
        totalQty: 20,
        remainingQty: 9,
        isActive: true,
      },
      {
        id: "pkg-rack-3x3",
        eventId: "evt-byouth-summer-2026",
        name: "3x3 Space - (2 Racks Included)",
        price: 22000,
        description:
          "A classic balanced setup for boutique clothing lines, footwear, and coordinated apparel.",
        includedItems:
          "3x3m Designated Area, 2 Clothes Racks, 2 Chairs, 120cm Wooden Table, 1 Electricity Plug, 2 Exhibitor Badges",
        image:
          "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
        totalQty: 25,
        remainingQty: 11,
        isActive: true,
      },
      {
        id: "pkg-table-190",
        eventId: "evt-byouth-summer-2026",
        name: "Table Package (Wooden Front 190cm)",
        price: 15789,
        description:
          "Perfect for jewelry, skincare, cosmetics, curated scents, sunglasses, and compact accessories.",
        includedItems:
          "190cm Premium Wooden Table with Front Skirting, 2 High Stool Chairs, Electricity Plug, 2 Exhibitor Badges",
        image:
          "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=800&q=80",
        totalQty: 30,
        remainingQty: 14,
        isActive: true,
      },
      {
        id: "pkg-cart-lifestyle",
        eventId: "evt-byouth-summer-2026",
        name: "Artisan Cart Package",
        price: 18500,
        description:
          "Charming vintage-styled wooden cart with overhead canopy and built-in display shelves.",
        includedItems:
          "Wooden Display Cart (200x90cm), Overhead Canvas Canopy, 2 Stools, Electricity Plug, Spotlighting",
        image:
          "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
        totalQty: 8,
        remainingQty: 0, // SOLD OUT demo
        isActive: true,
      },
    ],
    questions: [
      {
        id: "q-2",
        eventId: "evt-byouth-summer-2026",
        questionText:
          "Do you need additional high-voltage electricity for special equipment (e.g. industrial garment steamer, neon signage)?",
        questionType: "YES_NO",
        isRequired: true,
        orderIndex: 1,
      },
      {
        id: "q-3",
        eventId: "evt-byouth-summer-2026",
        questionText:
          "Describe your booth visual theme or special backdrop requirements (if any):",
        questionType: "TEXT",
        isRequired: false,
        orderIndex: 2,
      },
    ],
  },
  {
    id: "evt-pop-up-west-2026",
    name: "Bazarna Pop-Up Society West — Palm Hills Street 88",
    slug: "bazarna-pop-up-society-west",
    description:
      "Bringing our signature curated bazaar experience to West Cairo. A weekend open-air fashion and lifestyle market catering to the Sheikh Zayed and 6th of October community with upscale dining and premium retail.",
    highlights: [
      "Exclusive Palm Hills Street 88 open-air promenade",
      "Affluent West Cairo demographic",
      "Two-day weekend market experience",
      "Curated home decor, fashion, and artisanal food sections",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80",
    location: "Street 88, Palm Hills, 6th of October City",
    googleMapsUrl: "https://maps.google.com/?q=Palm+Hills+Street+88+October",
    startDate: "2026-10-24T12:00:00.000Z",
    endDate: "2026-10-25T23:00:00.000Z",
    startTime: "12:00 PM",
    endTime: "11:00 PM",
    regOpenDate: "2026-09-25T00:00:00.000Z",
    regCloseDate: "2026-10-18T23:59:59.000Z",
    status: "UPCOMING",
    capacity: 50,
    termsAndConditions: "Standard Bazarna Pop-Up Society Autumn terms apply.",
    tcVersion: "2026.2",
    paymentInstructions: "Transfer to CIB account 100075173867.",
    bankName: "Commercial International Bank (CIB)",
    accountName: "BAZARNA SOCIETY FOR EVENTS SAE",
    accountNumber: "100075173867",
    instapayHandle: "bazarnasociety@cib",
    packages: [
      {
        id: "pkg-west-tent-3x3",
        eventId: "evt-pop-up-west-2026",
        name: "Separate Tent (3x3 + Table)",
        price: 26000,
        description: "Full private branded tent in the main walkway.",
        includedItems: "3x3 White Pagoda Tent, 150cm Table, 2 Chairs, Lighting, 1 Power Socket",
        totalQty: 20,
        remainingQty: 20,
        isActive: true,
      },
      {
        id: "pkg-west-table-150",
        eventId: "evt-pop-up-west-2026",
        name: "Promenade Table Package",
        price: 14500,
        description: "Front-row table on the landscaped promenade.",
        includedItems: "150x75cm Wooden Table, 2 Chairs, Power Socket",
        totalQty: 30,
        remainingQty: 30,
        isActive: true,
      },
    ],
    questions: [],
  },
  {
    id: "evt-winter-market-2026",
    name: "Bazarna Winter Festival Market — Downtown Katameya",
    slug: "bazarna-winter-market-downtown",
    description:
      "Celebrate the festive winter season with Bazarna. Featuring warm holiday ambience, hot cocoa stations, curated seasonal collections, knitwear, and holiday gifting.",
    highlights: [
      "Annual Winter Festival flagship event",
      "Festive holiday decor and festive lighting installations",
      "Heavy holiday shopping footfall",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=1600&q=80",
    location: "Downtown Katameya Mall, New Cairo",
    googleMapsUrl: "https://maps.google.com/?q=Downtown+Katameya+Mall",
    startDate: "2026-11-20T11:00:00.000Z",
    endDate: "2026-11-21T23:00:00.000Z",
    startTime: "11:00 AM",
    endTime: "11:00 PM",
    regOpenDate: "2026-10-15T00:00:00.000Z",
    regCloseDate: "2026-11-10T23:59:59.000Z",
    status: "DRAFT",
    capacity: 70,
    termsAndConditions: "Winter 2026 standard terms apply.",
    tcVersion: "2026.3",
    bankName: "Commercial International Bank (CIB)",
    accountName: "BAZARNA SOCIETY FOR EVENTS SAE",
    accountNumber: "100075173867",
    packages: [],
    questions: [],
  },
];

export const INITIAL_BRANDS: BrandProfile[] = [
  {
    id: "brd-cairo-threads",
    userId: "usr-cairo-threads",
    brandName: "Cairo Threads",
    category: "Fashion Wear",
    aboutBrand:
      "Contemporary Egyptian streetwear brand blending authentic heritage typography with modern oversized cuts and premium Egyptian cotton.",
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
    documents: [
      {
        id: "doc-1",
        brandId: "brd-cairo-threads",
        documentType: "TAX_ID_CARD",
        fileUrl: "https://placehold.co/800x600/f4f8ed/8ebf42.png?text=Tax+ID+Card+-+Cairo+Threads",
        fileName: "cairo_threads_tax_card.pdf",
        fileSize: 1048576,
        status: "APPROVED",
        uploadedAt: "2026-08-10T10:00:00.000Z",
        updatedAt: "2026-08-11T14:30:00.000Z",
      },
      {
        id: "doc-2",
        brandId: "brd-cairo-threads",
        documentType: "NATIONAL_ID",
        fileUrl: "https://placehold.co/800x600/fefce8/eab308.png?text=National+ID+-+Farida+Mansour",
        fileName: "farida_mansour_national_id.jpg",
        fileSize: 2097152,
        status: "APPROVED",
        uploadedAt: "2026-08-10T10:05:00.000Z",
        updatedAt: "2026-08-11T14:30:00.000Z",
      },
    ],
    createdAt: "2026-08-10T09:00:00.000Z",
    updatedAt: "2026-08-15T12:00:00.000Z",
  },
  {
    id: "brd-nilotic-living",
    userId: "usr-nilotic-living",
    brandName: "Nilotic Living",
    category: "Home Accessories",
    aboutBrand:
      "Handcrafted home accessories, scented soy candles in hand-carved alabaster jars, and natural palm-leaf woven planters made by artisans across Upper Egypt.",
    products: "Alabaster candles, woven palm planters, ceramic tableware, hand-dyed cushions",
    instagram: "https://instagram.com/niloticliving",
    facebook: "https://facebook.com/niloticliving",
    website: "https://niloticliving.com",
    contactName: "Karim El-Gammal",
    contactEmail: "karim@nilotic.eg",
    contactPhone: "+20 102 987 6543",
    taxId: "618-294-019",
    nationalId: "29107220104829",
    documents: [
      {
        id: "doc-3",
        brandId: "brd-nilotic-living",
        documentType: "TAX_ID_CARD",
        fileUrl: "https://placehold.co/800x600/fdf2f8/ec4899.png?text=Tax+ID+Card+-+Nilotic+Living",
        fileName: "nilotic_tax_id_card.pdf",
        fileSize: 1450000,
        status: "APPROVED",
        uploadedAt: "2026-08-12T11:00:00.000Z",
        updatedAt: "2026-08-13T10:00:00.000Z",
      },
    ],
    createdAt: "2026-08-12T10:00:00.000Z",
    updatedAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "brd-kemet-studio",
    userId: "usr-kemet-studio",
    brandName: "Kemet Studio Jewelry",
    category: "Accessories",
    aboutBrand:
      "Architectural demi-fine jewelry in 18k gold vermeil and sterling silver, inspired by Ancient Egyptian geometry and contemporary brutalism.",
    products: "Lotus ear cuffs, hieroglyph signet rings, papyrus choker necklaces",
    instagram: "https://instagram.com/kemetstudio",
    tiktok: "https://tiktok.com/@kemetstudio",
    contactName: "Nouran Shaker",
    contactEmail: "nouran@kemetstudio.com",
    contactPhone: "+20 114 555 1290",
    taxId: "774-123-990",
    nationalId: "29612050101742",
    documents: [],
    createdAt: "2026-08-18T14:00:00.000Z",
    updatedAt: "2026-08-18T14:00:00.000Z",
  },
];

export const INITIAL_APPLICATIONS: EventApplication[] = [
  {
    id: "app-1",
    applicationCode: "BY-2026-000123",
    brandId: "brd-cairo-threads",
    brand: INITIAL_BRANDS[0],
    eventId: "evt-byouth-summer-2026",
    packageId: "pkg-rack-5x3",
    package: INITIAL_EVENTS[0].packages[0],
    prParticipation: true,
    notes: "We will bring a neon sign logo. Would prefer a booth facing the main DJ walkway if possible.",
    assignedBooth: "Booth A-04",
    appStatus: "APPROVED",
    paymentStatus: "PAID",
    tcAccepted: true,
    tcAcceptedAt: "2026-08-15T10:30:00.000Z",
    tcVersion: "2026.1",
    payment: {
      id: "pay-1",
      applicationId: "app-1",
      amount: 34211,
      currency: "EGP",
      method: "BANK_TRANSFER",
      receiptFileUrl:
        "https://placehold.co/800x1200/f0f9ff/0ea5e9.png?text=CIB+Bank+Transfer+Receipt+-+34,211+EGP",
      receiptFileName: "cib_transfer_cairothreads_34211.jpg",
      paymentStatus: "PAID",
      adminNote: "Verified with CIB statement reference #CIB-99214.",
      uploadedAt: "2026-08-15T11:00:00.000Z",
      verifiedAt: "2026-08-16T12:00:00.000Z",
    },
    answers: [
      {
        id: "ans-1",
        applicationId: "app-1",
        questionId: "q-1",
        answerText: "3 staff members",
      },
      {
        id: "ans-2",
        applicationId: "app-1",
        questionId: "q-2",
        answerText: "Yes",
      },
      {
        id: "ans-3",
        applicationId: "app-1",
        questionId: "q-3",
        answerText: "Industrial minimalist vibe with exposed concrete display pedestals and our neon brand sign.",
      },
    ],
    createdAt: "2026-08-15T10:30:00.000Z",
    updatedAt: "2026-08-16T12:00:00.000Z",
  },
  {
    id: "app-2",
    applicationCode: "BY-2026-000124",
    brandId: "brd-nilotic-living",
    brand: INITIAL_BRANDS[1],
    eventId: "evt-byouth-summer-2026",
    packageId: "pkg-table-190",
    package: INITIAL_EVENTS[0].packages[3],
    prParticipation: false,
    notes: "We have glass candle vessels, please ensure we are not next to direct open flame or heaters.",
    assignedBooth: undefined,
    appStatus: "UNDER_REVIEW",
    paymentStatus: "RECEIPT_UPLOADED",
    tcAccepted: true,
    tcAcceptedAt: "2026-08-20T14:15:00.000Z",
    tcVersion: "2026.1",
    payment: {
      id: "pay-2",
      applicationId: "app-2",
      amount: 15789,
      currency: "EGP",
      method: "INSTAPAY",
      receiptFileUrl:
        "https://placehold.co/800x1200/fefce8/eab308.png?text=Instapay+Receipt+-+15,789+EGP",
      receiptFileName: "instapay_receipt_nilotic.png",
      paymentStatus: "RECEIPT_UPLOADED",
      adminNote: undefined,
      uploadedAt: "2026-08-20T14:20:00.000Z",
    },
    answers: [
      {
        id: "ans-4",
        applicationId: "app-2",
        questionId: "q-1",
        answerText: "2 staff members",
      },
      {
        id: "ans-5",
        applicationId: "app-2",
        questionId: "q-2",
        answerText: "No",
      },
    ],
    createdAt: "2026-08-20T14:15:00.000Z",
    updatedAt: "2026-08-20T14:20:00.000Z",
  },
  {
    id: "app-3",
    applicationCode: "BY-2026-000125",
    brandId: "brd-kemet-studio",
    brand: INITIAL_BRANDS[2],
    eventId: "evt-byouth-summer-2026",
    packageId: "pkg-rack-3x3",
    package: INITIAL_EVENTS[0].packages[2],
    prParticipation: true,
    notes: "Will bring lockable jewelry display cases.",
    assignedBooth: undefined,
    appStatus: "SUBMITTED",
    paymentStatus: "PENDING",
    tcAccepted: true,
    tcAcceptedAt: "2026-08-22T09:00:00.000Z",
    tcVersion: "2026.1",
    payment: {
      id: "pay-3",
      applicationId: "app-3",
      amount: 22000,
      currency: "EGP",
      method: "BANK_TRANSFER",
      paymentStatus: "PENDING",
    },
    answers: [
      {
        id: "ans-6",
        applicationId: "app-3",
        questionId: "q-1",
        answerText: "2 staff members",
      },
      {
        id: "ans-7",
        applicationId: "app-3",
        questionId: "q-2",
        answerText: "No",
      },
    ],
    createdAt: "2026-08-22T09:00:00.000Z",
    updatedAt: "2026-08-22T09:00:00.000Z",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    adminName: "Ahmed Operations",
    action: "Approved Application BY-2026-000123 (Cairo Threads)",
    targetType: "APPLICATION",
    targetId: "BY-2026-000123",
    details: "Brand documents verified and brand profile approved for B.youth Summer Outlet.",
    timestamp: "2026-08-16T11:45:00.000Z",
  },
  {
    id: "log-2",
    adminName: "Dina Finance",
    action: "Verified Bank Transfer for BY-2026-000123 (34,211 EGP)",
    targetType: "PAYMENT",
    targetId: "BY-2026-000123",
    details: "CIB transaction reference confirmed against company bank statement.",
    timestamp: "2026-08-16T12:00:00.000Z",
  },
  {
    id: "log-3",
    adminName: "Tamer Logistics",
    action: "Assigned Booth A-04 to BY-2026-000123",
    targetType: "APPLICATION",
    targetId: "BY-2026-000123",
    details: "Assigned 5x3 prime courtyard booth facing the main soundstage.",
    timestamp: "2026-08-16T12:15:00.000Z",
  },
  {
    id: "log-4",
    adminName: "Ahmed Operations",
    action: "Published Event: B.youth Summer Outlet Market",
    targetType: "EVENT",
    targetId: "evt-byouth-summer-2026",
    details: "Event status transitioned from UPCOMING to REGISTRATION_OPEN with 5 packages.",
    timestamp: "2026-08-01T08:00:00.000Z",
  },
];
