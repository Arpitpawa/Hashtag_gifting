import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── CREATE ADMIN USER ──
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "hashtaggiftsupport@gmail.com" },
    update: {},
    create: {
      name: "Hashtag Admin",
      email: "hashtaggiftsupport@gmail.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "7665909909",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ── CREATE CATEGORIES ──
  const categories = [
    {
      name: "Birthday gifts",
      slug: "birthday-gifts",
      description: "Celebrate birthdays with personalized gifts",
    },
    {
      name: "Anniversary gifts",
      slug: "anniversary-gifts",
      description: "Mark special milestones with love",
    },
    {
      name: "Personalized mugs",
      slug: "personalized-mugs",
      description: "Custom mugs for every occasion",
    },
    {
      name: "Photo frames",
      slug: "photo-frames",
      description: "Preserve memories in beautiful frames",
    },
    {
      name: "LED name lamps",
      slug: "led-name-lamps",
      description: "Illuminate names with LED lamps",
    },
    {
      name: "Gift hampers",
      slug: "gift-hampers",
      description: "Curated gift hampers for all occasions",
    },
    {
      name: "Cushion covers",
      slug: "cushion-covers",
      description: "Personalized cushions with photos",
    },
    {
      name: "Couple gifts",
      slug: "couple-gifts",
      description: "Romantic gifts for couples",
    },
    {
      name: "Wedding gifts",
      slug: "wedding-gifts",
      description: "Celebrate the big day",
    },
    {
      name: "Bulk gifting",
      slug: "bulk-gifting",
      description: "Corporate and bulk orders",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created:", categories.length);

  // ── GET CATEGORY IDs ──
  const mugCategory = await prisma.category.findUnique({
    where: { slug: "personalized-mugs" },
  });
  const frameCategory = await prisma.category.findUnique({
    where: { slug: "photo-frames" },
  });
  const bDayCategory = await prisma.category.findUnique({
    where: { slug: "birthday-gifts" },
  });
  const hamperCategory = await prisma.category.findUnique({
    where: { slug: "gift-hampers" },
  });

  // ── CREATE SAMPLE PRODUCTS ──
  const products = [
    {
      name: "Personalized photo mug",
      slug: "personalized-photo-mug",
      description:
        "A beautiful custom mug printed with your favorite photo and name. Perfect for birthdays, anniversaries and gifting loved ones.",
      price: 39900, // Rs. 399
      comparePrice: 59900, // Rs. 599
      images: [
        "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
      ],
      categoryId: mugCategory?.id,
      stock: 50,
      badge: "Best seller",
      customizable: true,
      customizationFields: [
        {
          type: "text",
          label: "Enter name",
          maxLength: 20,
          required: true,
          placeholder: "e.g. Priya",
        },
        { type: "image", label: "Upload photo", required: true },
        {
          type: "textarea",
          label: "Add message",
          maxLength: 100,
          required: false,
          placeholder: "e.g. Happy Birthday!",
        },
      ],
      tags: ["mug", "personalized", "birthday", "custom"],
      status: "ACTIVE" as const,
    },
    {
      name: "Custom LED name lamp",
      slug: "custom-led-name-lamp",
      description:
        "A stunning LED lamp with your name or message illuminated. Creates a magical ambiance and makes a unique personalized gift.",
      price: 89900,
      comparePrice: 129900,
      images: [
        "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
      ],
      categoryId: frameCategory?.id,
      stock: 30,
      badge: "New",
      customizable: true,
      customizationFields: [
        {
          type: "text",
          label: "Enter name or word",
          maxLength: 15,
          required: true,
          placeholder: "e.g. Love",
        },
      ],
      tags: ["lamp", "led", "personalized", "anniversary"],
      status: "ACTIVE" as const,
    },
    {
      name: "Birthday explosion box",
      slug: "birthday-explosion-box",
      description:
        "A magical explosion box filled with photos, messages and surprises. The perfect birthday gift that unfolds layer by layer.",
      price: 149900,
      comparePrice: 199900,
      images: [
        "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
      ],
      categoryId: bDayCategory?.id,
      stock: 20,
      badge: "Best seller",
      customizable: true,
      customizationFields: [
        {
          type: "text",
          label: "Recipient name",
          maxLength: 20,
          required: true,
        },
        { type: "image", label: "Upload 6 photos", required: true },
        {
          type: "textarea",
          label: "Your message",
          maxLength: 200,
          required: false,
        },
      ],
      tags: ["explosion box", "birthday", "surprise", "personalized"],
      status: "ACTIVE" as const,
    },
    {
      name: "Premium gift hamper",
      slug: "premium-gift-hamper",
      description:
        "A beautifully curated gift hamper with premium items. Perfect for all occasions — birthdays, anniversaries and corporate gifting.",
      price: 249900,
      comparePrice: 349900,
      images: [
        "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
      ],
      categoryId: hamperCategory?.id,
      stock: 15,
      badge: "Premium",
      customizable: false,
      tags: ["hamper", "premium", "gifting", "corporate"],
      status: "ACTIVE" as const,
    },
    {
      name: "Personalized photo frame",
      slug: "personalized-photo-frame",
      description:
        "A stunning wooden photo frame personalized with names and dates. Preserve your most precious memories in style.",
      price: 59900,
      comparePrice: 89900,
      images: [
        "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
      ],
      categoryId: frameCategory?.id,
      stock: 40,
      badge: null,
      customizable: true,
      customizationFields: [
        { type: "text", label: "Name 1", maxLength: 15, required: true },
        { type: "text", label: "Name 2", maxLength: 15, required: true },
        { type: "image", label: "Upload photo", required: true },
        {
          type: "textarea",
          label: "Special date or message",
          maxLength: 50,
          required: false,
        },
      ],
      tags: ["frame", "photo", "personalized", "anniversary"],
      status: "ACTIVE" as const,
    },
    {
      name: "Custom cushion cover",
      slug: "custom-cushion-cover",
      description:
        "A soft, high-quality cushion cover printed with your favorite photo. A cozy and personal gift for your loved ones.",
      price: 49900,
      comparePrice: 69900,
      images: [
        "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
      ],
      categoryId: bDayCategory?.id,
      stock: 35,
      badge: null,
      customizable: true,
      customizationFields: [
        { type: "image", label: "Upload photo", required: true },
        { type: "text", label: "Add text", maxLength: 30, required: false },
      ],
      tags: ["cushion", "photo", "personalized", "home decor"],
      status: "ACTIVE" as const,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log("✅ Products created:", products.length);

  // ── CREATE SAMPLE COUPONS ──
  const coupons = [
    {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minAmount: 200,
      isActive: true,
      usageLimit: 100,
    },
    {
      code: "FLAT50",
      type: "FLAT",
      value: 50,
      minAmount: 500,
      isActive: true,
      usageLimit: 50,
    },
    {
      code: "HASHTAG20",
      type: "PERCENT",
      value: 20,
      minAmount: 1000,
      isActive: true,
      usageLimit: 200,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }
  console.log("✅ Coupons created:", coupons.length);

  // ── CREATE SAMPLE BANNER ──
  await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Make every moment special",
      image:
        "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
      linkUrl: "/shop",
      position: "hero",
      isActive: true,
      sortOrder: 1,
    },
  });
  console.log("✅ Banner created");

  console.log("\n🎉 Seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin login:");
  console.log("  Email:    hashtaggiftsupport@gmail.com");
  console.log("  Password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
