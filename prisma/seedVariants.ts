/**
 * seedVariants.ts
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seedVariants.ts
 * OR add to package.json scripts and run: npx prisma db seed (after updating seed config)
 *
 * This adds 4 test products with realistic variants:
 *  1. Personalised Ceramic Mug      — Color variants (White, Black, Pink, Blue)
 *  2. LED Name Lamp                 — Size variants  (Small, Medium, Large)
 *  3. Cushion Cover                 — Color + Size   (two groups)
 *  4. Photo Frame                   — Material       (Wood, Metal, Acrylic)
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ── Real product images from Confetti CDN ─────────────────────────────────────
const IMGS = {
  // Mugs
  mugWhite:  "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
  mugBlack:  "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
  mugPink:   "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
  mugBlue:   "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",

  // Lamps
  lampSm:    "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
  lampMd:    "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
  lampLg:    "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",

  // Cushion
  cushionWhite: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
  cushionPink:  "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
  cushionBlue:  "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",

  // Frame
  frameWood:    "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
  frameMetal:   "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
  frameAcrylic: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
};

async function main() {
  console.log("🌱 Seeding variant products...");

  // ── Look up category IDs ───────────────────────────────────────────────────
  const cats = await prisma.category.findMany({
    where: {
      slug: {
        in: [
          "birthday-mugs",
          "birthday-gifts-for-him",
          "birthday-gifts-for-her",
          "led-name-lamps",
          "cushion-covers",
          "photo-frames",
          "gifts-for-her",
          "couple-gifts",
        ],
      },
    },
    select: { id: true, slug: true },
  });

  const C: Record<string, number> = {};
  cats.forEach((c: any) => (C[c.slug] = c.id));

  console.log("Found categories:", Object.keys(C));

  // ── 1. PERSONALISED CERAMIC MUG — Color variants ───────────────────────────
  const mug = await prisma.product.upsert({
    where:  { slug: "personalised-ceramic-mug-color" },
    update: {},
    create: {
      name:        "Personalised Ceramic Mug",
      slug:        "personalised-ceramic-mug-color",
      description: "A premium 330ml ceramic mug with your name and photo printed in full colour. Microwave and dishwasher safe. Available in 4 stunning colours — pick your favourite!",
      price:       49900,   // Rs. 499 base
      comparePrice:79900,   // Rs. 799
      images:      [IMGS.mugWhite, IMGS.mugBlack, IMGS.mugPink, IMGS.mugBlue],
      categoryId:  C["birthday-mugs"] ?? C["birthday-gifts-for-him"],
      stock:       0,       // 0 because stock is per-variant
      badge:       "Best seller",
      customizable: true,
      customizationFields: [
        { type: "text",     label: "Enter name",    maxLength: 20,  required: true,  placeholder: "e.g. Rahul" },
        { type: "image",    label: "Upload photo",  required: false },
        { type: "textarea", label: "Add message",   maxLength: 100, required: false, placeholder: "e.g. Happy Birthday!" },
      ],
      tags:   ["mug", "ceramic", "personalised", "birthday", "color"],
      status: "ACTIVE",
    },
  });

  // Delete existing variants and re-create
  await prisma.productVariant.deleteMany({ where: { productId: mug.id } });
  await prisma.productVariant.createMany({
    data: [
      { productId: mug.id, groupName: "Color", optionName: "White",  price: 49900,  comparePrice: 79900, stock: 45, images: [IMGS.mugWhite], isDefault: true,  sortOrder: 0 },
      { productId: mug.id, groupName: "Color", optionName: "Black",  price: 49900,  comparePrice: 79900, stock: 30, images: [IMGS.mugBlack], isDefault: false, sortOrder: 1 },
      { productId: mug.id, groupName: "Color", optionName: "Pink",   price: 54900,  comparePrice: 79900, stock: 25, images: [IMGS.mugPink],  isDefault: false, sortOrder: 2 },
      { productId: mug.id, groupName: "Color", optionName: "Blue",   price: 54900,  comparePrice: 79900, stock: 3,  images: [IMGS.mugBlue],  isDefault: false, sortOrder: 3 }, // low stock
    ],
  });
  console.log("✅ Mug with Color variants created");

  // ── 2. LED NAME LAMP — Size variants ──────────────────────────────────────
  const lamp = await prisma.product.upsert({
    where:  { slug: "led-name-lamp-size-variants" },
    update: {},
    create: {
      name:        "LED Name Lamp",
      slug:        "led-name-lamp-size-variants",
      description: "A warm glowing LED lamp with your name or a special message cut in acrylic. Perfect bedside or desk decor. Choose the size that fits your space.",
      price:       89900,
      comparePrice:129900,
      images:      [IMGS.lampSm, IMGS.lampMd, IMGS.lampLg],
      categoryId:  C["led-name-lamps"] ?? C["birthday-gifts-for-him"],
      stock:       0,
      badge:       "Trending",
      customizable: true,
      customizationFields: [
        { type: "text", label: "Name / message to display", maxLength: 15, required: true, placeholder: "e.g. Priya" },
      ],
      tags:   ["lamp", "led", "personalised", "birthday", "size"],
      status: "ACTIVE",
    },
  });

  await prisma.productVariant.deleteMany({ where: { productId: lamp.id } });
  await prisma.productVariant.createMany({
    data: [
      { productId: lamp.id, groupName: "Size", optionName: "Small  (6 inch)",  price: 89900,  comparePrice: 129900, stock: 40, images: [IMGS.lampSm], isDefault: true,  sortOrder: 0, sku: "LAMP-SM" },
      { productId: lamp.id, groupName: "Size", optionName: "Medium (10 inch)", price: 129900, comparePrice: 179900, stock: 25, images: [IMGS.lampMd], isDefault: false, sortOrder: 1, sku: "LAMP-MD" },
      { productId: lamp.id, groupName: "Size", optionName: "Large  (14 inch)", price: 179900, comparePrice: 249900, stock: 0,  images: [IMGS.lampLg], isDefault: false, sortOrder: 2, sku: "LAMP-LG" }, // OOS
    ],
  });
  console.log("✅ LED Lamp with Size variants created");

  // ── 3. CUSHION COVER — Color + Size (two groups) ──────────────────────────
  const cushion = await prisma.product.upsert({
    where:  { slug: "personalised-cushion-color-size" },
    update: {},
    create: {
      name:        "Personalised Photo Cushion",
      slug:        "personalised-cushion-color-size",
      description: "A soft, plush cushion cover printed with your favourite photo or message. Comes with an inner pillow. Choose your colour and size.",
      price:       59900,
      comparePrice:89900,
      images:      [IMGS.cushionWhite, IMGS.cushionPink, IMGS.cushionBlue],
      categoryId:  C["cushion-covers"] ?? C["birthday-gifts-for-her"],
      stock:       0,
      badge:       "New",
      customizable: true,
      customizationFields: [
        { type: "image",    label: "Upload photo",  required: true  },
        { type: "textarea", label: "Add message",   maxLength: 80,  required: false, placeholder: "e.g. Always in my heart" },
      ],
      tags:   ["cushion", "photo", "personalised", "birthday", "colour", "size"],
      status: "ACTIVE",
    },
  });

  await prisma.productVariant.deleteMany({ where: { productId: cushion.id } });
  await prisma.productVariant.createMany({
    data: [
      // Color group
      { productId: cushion.id, groupName: "Color", optionName: "White", price: null, stock: 50, images: [IMGS.cushionWhite], isDefault: true,  sortOrder: 0 },
      { productId: cushion.id, groupName: "Color", optionName: "Pink",  price: null, stock: 30, images: [IMGS.cushionPink],  isDefault: false, sortOrder: 1 },
      { productId: cushion.id, groupName: "Color", optionName: "Blue",  price: null, stock: 20, images: [IMGS.cushionBlue],  isDefault: false, sortOrder: 2 },
      // Size group
      { productId: cushion.id, groupName: "Size", optionName: "12×12 inch", price: 59900,  comparePrice: 89900,  stock: 60, isDefault: true,  sortOrder: 0, sku: "CUSH-SM" },
      { productId: cushion.id, groupName: "Size", optionName: "16×16 inch", price: 79900,  comparePrice: 109900, stock: 35, isDefault: false, sortOrder: 1, sku: "CUSH-MD" },
      { productId: cushion.id, groupName: "Size", optionName: "20×20 inch", price: 109900, comparePrice: 149900, stock: 15, isDefault: false, sortOrder: 2, sku: "CUSH-LG" },
    ],
  });
  console.log("✅ Cushion with Color + Size variants created");

  // ── 4. PHOTO FRAME — Material variants ────────────────────────────────────
  const frame = await prisma.product.upsert({
    where:  { slug: "personalised-photo-frame-material" },
    update: {},
    create: {
      name:        "Personalised Photo Frame",
      slug:        "personalised-photo-frame-material",
      description: "A beautifully crafted photo frame with your name engraved and space for your favourite memory. Choose from three premium materials — natural wood, brushed metal, or crystal-clear acrylic.",
      price:       69900,
      comparePrice:99900,
      images:      [IMGS.frameWood, IMGS.frameMetal, IMGS.frameAcrylic],
      categoryId:  C["photo-frames"] ?? C["gifts-for-her"],
      stock:       0,
      badge:       "Premium",
      customizable: true,
      customizationFields: [
        { type: "text",  label: "Name to engrave", maxLength: 20, required: true,  placeholder: "e.g. Anjali & Rohan" },
        { type: "image", label: "Upload photo",    required: false },
      ],
      tags:   ["frame", "photo", "wood", "metal", "personalised", "anniversary"],
      status: "ACTIVE",
    },
  });

  await prisma.productVariant.deleteMany({ where: { productId: frame.id } });
  await prisma.productVariant.createMany({
    data: [
      { productId: frame.id, groupName: "Material", optionName: "Natural Wood", price: 69900,  comparePrice: 99900,  stock: 35, images: [IMGS.frameWood],    isDefault: true,  sortOrder: 0, sku: "FRAME-WOOD" },
      { productId: frame.id, groupName: "Material", optionName: "Brushed Metal", price: 89900, comparePrice: 129900, stock: 20, images: [IMGS.frameMetal],   isDefault: false, sortOrder: 1, sku: "FRAME-METAL" },
      { productId: frame.id, groupName: "Material", optionName: "Clear Acrylic", price: 79900, comparePrice: 109900, stock: 28, images: [IMGS.frameAcrylic], isDefault: false, sortOrder: 2, sku: "FRAME-ACRYL" },
    ],
  });
  console.log("✅ Photo Frame with Material variants created");

  console.log("\n🎉 Variant seed complete! 4 products added:");
  console.log("  → /product/personalised-ceramic-mug-color");
  console.log("  → /product/led-name-lamp-size-variants");
  console.log("  → /product/personalised-cushion-color-size");
  console.log("  → /product/personalised-photo-frame-material");
}

main()
  .catch((err) => {
    console.error("❌ Variant seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });