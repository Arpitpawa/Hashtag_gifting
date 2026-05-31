import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── image pool (Confetti CDN) ─────────────────────────────────────────────────
const IMGS = {
  mug1: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
  lamp1:
    "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
  box1: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
  frame1:
    "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
  cushion1:
    "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
  hamper1:
    "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
};

// shorthand for customization fields
const namePhotoMsg = [
  {
    type: "text",
    label: "Enter name",
    maxLength: 20,
    required: true,
    placeholder: "e.g. Rahul",
  },
  { type: "image", label: "Upload photo", required: false },
  {
    type: "textarea",
    label: "Add message",
    maxLength: 100,
    required: false,
    placeholder: "e.g. Happy Birthday!",
  },
];
const nameOnly = [
  {
    type: "text",
    label: "Enter name",
    maxLength: 20,
    required: true,
    placeholder: "e.g. Priya",
  },
];
const photoMsg = [
  { type: "image", label: "Upload photo", required: true },
  { type: "textarea", label: "Add message", maxLength: 100, required: false },
];

async function main() {
  console.log("🌱 Seeding database...");

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
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
  console.log("✅ Admin created");

  // ────────────────────────────────────────────────────────────────────────────
  // PARENT CATEGORIES
  // ────────────────────────────────────────────────────────────────────────────
  const parentDefs = [
    {
      name: "Birthday gifts",
      slug: "birthday-gifts",
      description: "Celebrate birthdays with personalised gifts",
    },
    {
      name: "Anniversary gifts",
      slug: "anniversary-gifts",
      description: "Mark special milestones with love",
    },
    {
      name: "Gifts by relationship",
      slug: "gifts-by-relationship",
      description: "Find the perfect gift for every relationship",
    },
    {
      name: "Gifts by type",
      slug: "gifts-by-type",
      description: "Browse our full range of personalised gift types",
    },
    {
      name: "Mothers day gifts",
      slug: "mothers-day-gifts",
      description: "Celebrate the best mom with a heartfelt gift",
    },
    {
      name: "Style your own gifts",
      slug: "style-your-own-gifts",
      description: "Fully customise your gift from scratch",
    },
    {
      name: "Special days",
      slug: "special-days",
      description: "Gifts for every special occasion",
    },
    {
      name: "Bulk gifting",
      slug: "bulk-gifting",
      description: "Corporate and bulk orders at great prices",
    },
    // legacy slugs kept for backward compat
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
  ];

  for (const cat of parentDefs) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // fetch parent IDs
  const P = {} as Record<string, number>;
  for (const cat of parentDefs) {
    const c = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (c) P[cat.slug] = c.id;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SUB-CATEGORIES (children)
  // ────────────────────────────────────────────────────────────────────────────
  const subDefs = [
    // Birthday sub-categories
    {
      name: "Birthday gifts for him",
      slug: "birthday-gifts-for-him",
      parentSlug: "birthday-gifts",
      description: "Thoughtful birthday gifts for the special man in your life",
    },
    {
      name: "Birthday gifts for her",
      slug: "birthday-gifts-for-her",
      parentSlug: "birthday-gifts",
      description: "Beautiful birthday gifts she will absolutely love",
    },
    {
      name: "Birthday hampers",
      slug: "birthday-hampers",
      parentSlug: "birthday-gifts",
      description: "Curated birthday hampers packed with goodies",
    },
    {
      name: "Birthday frames",
      slug: "birthday-frames",
      parentSlug: "birthday-gifts",
      description: "Personalised photo frames for birthdays",
    },
    {
      name: "Birthday mugs",
      slug: "birthday-mugs",
      parentSlug: "birthday-gifts",
      description: "Custom birthday mugs with names and photos",
    },
    {
      name: "Birthday cards",
      slug: "birthday-cards",
      parentSlug: "birthday-gifts",
      description: "Personalised birthday cards with your message",
    },

    // Anniversary sub-categories
    {
      name: "Anniversary gifts for wife",
      slug: "anniversary-gifts-for-wife",
      parentSlug: "anniversary-gifts",
      description: "Make her feel special on your anniversary",
    },
    {
      name: "Anniversary gifts for husband",
      slug: "anniversary-gifts-for-husband",
      parentSlug: "anniversary-gifts",
      description: "Romantic gifts for the man you love",
    },
    {
      name: "Couple frames",
      slug: "couple-frames",
      parentSlug: "anniversary-gifts",
      description: "Personalised frames for couples",
    },
    {
      name: "Personalized lamps",
      slug: "personalized-lamps",
      parentSlug: "anniversary-gifts",
      description: "Custom LED lamps with names and photos",
    },
    {
      name: "Customized cushions",
      slug: "customized-cushions",
      parentSlug: "anniversary-gifts",
      description: "Photo cushions for couples",
    },
    {
      name: "Anniversary hampers",
      slug: "anniversary-hampers",
      parentSlug: "anniversary-gifts",
      description: "Premium anniversary hamper sets",
    },

    // Gifts by relationship
    {
      name: "Gifts for boyfriend",
      slug: "gifts-for-boyfriend",
      parentSlug: "gifts-by-relationship",
      description: "Surprise your boyfriend with a personalised gift",
    },
    {
      name: "Gifts for girlfriend",
      slug: "gifts-for-girlfriend",
      parentSlug: "gifts-by-relationship",
      description: "Romantic personalised gifts for her",
    },
    {
      name: "Gifts for husband",
      slug: "gifts-for-husband",
      parentSlug: "gifts-by-relationship",
      description: "Thoughtful gifts for your husband",
    },
    {
      name: "Gifts for wife",
      slug: "gifts-for-wife",
      parentSlug: "gifts-by-relationship",
      description: "Make your wife feel special every day",
    },
    {
      name: "Gifts for sister",
      slug: "gifts-for-sister",
      parentSlug: "gifts-by-relationship",
      description: "Unique personalised gifts for your sister",
    },
    {
      name: "Gifts for brother",
      slug: "gifts-for-brother",
      parentSlug: "gifts-by-relationship",
      description: "Cool personalised gifts for your brother",
    },
    {
      name: "Gifts for friends",
      slug: "gifts-for-friends",
      parentSlug: "gifts-by-relationship",
      description: "Celebrate friendship with a personalised touch",
    },
    {
      name: "Gifts for couple",
      slug: "gifts-for-couple",
      parentSlug: "gifts-by-relationship",
      description: "Perfect gifts for couples on any occasion",
    },
    {
      name: "Gifts for her",
      slug: "gifts-for-her",
      parentSlug: "gifts-by-relationship",
      description: "Beautiful personalised gifts for every woman",
    },
    {
      name: "Gifts for him",
      slug: "gifts-for-him",
      parentSlug: "gifts-by-relationship",
      description: "Unique personalised gifts for every man",
    },
    {
      name: "Gifts for father",
      slug: "gifts-for-father",
      parentSlug: "gifts-by-relationship",
      description: "Meaningful gifts for dad on any occasion",
    },
    {
      name: "Gifts for mother",
      slug: "gifts-for-mother",
      parentSlug: "gifts-by-relationship",
      description: "Heartfelt gifts for the best mom",
    },
    {
      name: "Gifts for kids",
      slug: "gifts-for-kids",
      parentSlug: "gifts-by-relationship",
      description: "Fun and personalised gifts for children",
    },
    {
      name: "Gifts for baby shower",
      slug: "gifts-for-baby-shower",
      parentSlug: "gifts-by-relationship",
      description: "Sweet personalised gifts for the new arrival",
    },

    // Gifts by type
    {
      name: "Customized mugs",
      slug: "customized-mugs",
      parentSlug: "gifts-by-type",
      description: "Photo and name printed mugs",
    },
    {
      name: "Name plates",
      slug: "name-plates",
      parentSlug: "gifts-by-type",
      description: "Personalised name plates and door signs",
    },
    {
      name: "Explosion boxes",
      slug: "explosion-boxes",
      parentSlug: "gifts-by-type",
      description: "Surprise explosion boxes with photos",
    },
    {
      name: "Wallet cards",
      slug: "wallet-cards",
      parentSlug: "gifts-by-type",
      description: "Custom metal wallet cards",
    },
    {
      name: "LED lamps",
      slug: "led-lamps",
      parentSlug: "gifts-by-type",
      description: "Personalised LED name lamps",
    },
    {
      name: "Cushions",
      slug: "cushions",
      parentSlug: "gifts-by-type",
      description: "Custom photo printed cushions",
    },

    // Special days
    {
      name: "Valentines day",
      slug: "valentines-day",
      parentSlug: "special-days",
      description: "Express your love with personalised gifts",
    },
    {
      name: "Mothers day",
      slug: "mothers-day",
      parentSlug: "special-days",
      description: "Celebrate mom with a heartfelt surprise",
    },
    {
      name: "Fathers day",
      slug: "fathers-day",
      parentSlug: "special-days",
      description: "Show dad how much he means to you",
    },
    {
      name: "Friendship day",
      slug: "friendship-day",
      parentSlug: "special-days",
      description: "Gift your best friend something special",
    },
    {
      name: "Raksha bandhan",
      slug: "raksha-bandhan",
      parentSlug: "special-days",
      description: "Celebrate the bond between siblings",
    },
    {
      name: "Womens day",
      slug: "womens-day",
      parentSlug: "special-days",
      description: "Celebrate the women in your life",
    },

    // Bulk gifting
    {
      name: "Corporate gifts",
      slug: "corporate-gifts",
      parentSlug: "bulk-gifting",
      description: "Premium corporate gifting solutions",
    },
    {
      name: "Employee hampers",
      slug: "employee-hampers",
      parentSlug: "bulk-gifting",
      description: "Curated hampers for your team",
    },
    {
      name: "Wedding bulk orders",
      slug: "wedding-bulk-orders",
      parentSlug: "bulk-gifting",
      description: "Bulk wedding favours and gifts",
    },
    {
      name: "Event gifting",
      slug: "event-gifting",
      parentSlug: "bulk-gifting",
      description: "Custom gifts for events and conferences",
    },

    // Missing navbar categories — Gifts by relationship
    {
      name: "Gifts for fiance",
      slug: "gifts-for-fiance",
      parentSlug: "gifts-by-relationship",
      description: "Romantic personalised gifts for your fiance",
    },
    {
      name: "Gifts for bridesmaids",
      slug: "gifts-for-bridesmaids",
      parentSlug: "gifts-by-relationship",
      description: "Beautiful thank you gifts for your bridesmaids",
    },
    {
      name: "Gifts for newly married couple",
      slug: "gifts-for-newly-married-couple",
      parentSlug: "gifts-by-relationship",
      description: "Celebrate the start of their beautiful journey",
    },
    {
      name: "Gifts for mom to be",
      slug: "gifts-for-mom-to-be",
      parentSlug: "gifts-by-relationship",
      description: "Celebrate the mom-to-be with a heartfelt gift",
    },
    {
      name: "Gifts for dad to be",
      slug: "gifts-for-dad-to-be",
      parentSlug: "gifts-by-relationship",
      description: "Celebrate the dad-to-be with something special",
    },
    {
      name: "Gifts for parents to be",
      slug: "gifts-for-parents-to-be",
      parentSlug: "gifts-by-relationship",
      description: "Celebrate the growing family with love",
    },

    // Style your own gifts
    {
      name: "Custom mugs",
      slug: "custom-mugs",
      parentSlug: "style-your-own-gifts",
      description: "Design your own personalised mug from scratch",
    },
    {
      name: "Custom frames",
      slug: "custom-frames",
      parentSlug: "style-your-own-gifts",
      description: "Create a personalised photo frame your way",
    },
    {
      name: "Custom LED lamps",
      slug: "custom-led-lamps",
      parentSlug: "style-your-own-gifts",
      description: "Design your own LED name lamp",
    },
    {
      name: "Custom hampers",
      slug: "custom-hampers",
      parentSlug: "style-your-own-gifts",
      description: "Build your own custom gift hamper",
    },
  ];

  for (const sub of subDefs) {
    const parentId = P[sub.parentSlug];
    if (!parentId) {
      console.warn("⚠️ Parent not found:", sub.parentSlug);
      continue;
    }
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId },
      create: {
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        parentId,
      },
    });
  }
  console.log("✅ Sub-categories created:", subDefs.length);

  // fetch all sub-category IDs
  const S = {} as Record<string, number>;
  for (const sub of subDefs) {
    const c = await prisma.category.findUnique({ where: { slug: sub.slug } });
    if (c) S[sub.slug] = c.id;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PRODUCTS — 4-6 per key sub-category
  // ────────────────────────────────────────────────────────────────────────────
  const products = [
    // ── BIRTHDAY GIFTS FOR HIM ───────────────────────────────────────────────
    {
      name: "Personalised birthday mug for him",
      slug: "personalised-birthday-mug-him",
      description:
        "A premium ceramic mug with his name and a bold birthday message. The perfect start to his special day.",
      price: 39900,
      comparePrice: 59900,
      stock: 50,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.mug1, IMGS.frame1],
      categoryId: S["birthday-gifts-for-him"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "birthday", "him", "personalised"],
    },
    {
      name: "Birthday LED lamp for him",
      slug: "birthday-led-lamp-him",
      description:
        "A stunning LED name lamp that glows his name in warm light. Makes for a memorable and unique birthday gift.",
      price: 89900,
      comparePrice: 129900,
      stock: 30,
      badge: "New",
      customizable: true,
      images: [IMGS.lamp1, IMGS.mug1],
      categoryId: S["birthday-gifts-for-him"],
      customizationFields: nameOnly,
      tags: ["lamp", "led", "birthday", "him"],
    },
    {
      name: "Birthday explosion box for him",
      slug: "birthday-explosion-box-him",
      description:
        "A surprise explosion box filled with his photos and your messages. Watch his face light up as it unfolds!",
      price: 149900,
      comparePrice: 199900,
      stock: 20,
      badge: null,
      customizable: true,
      images: [IMGS.box1, IMGS.frame1],
      categoryId: S["birthday-gifts-for-him"],
      customizationFields: photoMsg,
      tags: ["explosion box", "birthday", "him", "surprise"],
    },
    {
      name: "Men's birthday hamper",
      slug: "mens-birthday-hamper",
      description:
        "A thoughtfully curated birthday hamper for him with goodies, personalised keepsakes and sweet surprises.",
      price: 199900,
      comparePrice: 279900,
      stock: 15,
      badge: "Premium",
      customizable: false,
      images: [IMGS.hamper1, IMGS.box1],
      categoryId: S["birthday-gifts-for-him"],
      tags: ["hamper", "birthday", "him"],
    },
    {
      name: "Personalised photo frame for him",
      slug: "personalised-photo-frame-him",
      description:
        "A beautiful wooden frame with his name engraved and a space for your favourite photo together.",
      price: 59900,
      comparePrice: 89900,
      stock: 40,
      badge: null,
      customizable: true,
      images: [IMGS.frame1, IMGS.lamp1],
      categoryId: S["birthday-gifts-for-him"],
      customizationFields: namePhotoMsg,
      tags: ["frame", "photo", "birthday", "him"],
    },

    // ── BIRTHDAY GIFTS FOR HER ───────────────────────────────────────────────
    {
      name: "Personalised birthday mug for her",
      slug: "personalised-birthday-mug-her",
      description:
        "A beautiful floral-print personalised mug with her name. Perfect morning birthday surprise.",
      price: 39900,
      comparePrice: 59900,
      stock: 50,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.mug1, IMGS.cushion1],
      categoryId: S["birthday-gifts-for-her"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "birthday", "her", "personalised"],
    },
    {
      name: "Birthday cushion for her",
      slug: "birthday-cushion-her",
      description:
        "A soft personalised cushion with her photo and a sweet birthday message. Cozy and heartfelt.",
      price: 49900,
      comparePrice: 69900,
      stock: 35,
      badge: null,
      customizable: true,
      images: [IMGS.cushion1, IMGS.mug1],
      categoryId: S["birthday-gifts-for-her"],
      customizationFields: photoMsg,
      tags: ["cushion", "birthday", "her"],
    },
    {
      name: "Birthday hamper for her",
      slug: "birthday-hamper-her",
      description:
        "A beautiful birthday hamper with chocolates, flowers and a personalised keepsake.",
      price: 179900,
      comparePrice: 249900,
      stock: 20,
      badge: "Premium",
      customizable: false,
      images: [IMGS.hamper1, IMGS.box1],
      categoryId: S["birthday-gifts-for-her"],
      tags: ["hamper", "birthday", "her"],
    },
    {
      name: "Birthday photo frame for her",
      slug: "birthday-photo-frame-her",
      description:
        "A gorgeous personalised photo frame with her name in glitter. A gift she'll treasure forever.",
      price: 59900,
      comparePrice: 89900,
      stock: 40,
      badge: null,
      customizable: true,
      images: [IMGS.frame1, IMGS.cushion1],
      categoryId: S["birthday-gifts-for-her"],
      customizationFields: namePhotoMsg,
      tags: ["frame", "birthday", "her"],
    },

    // ── GIFTS FOR HIM ────────────────────────────────────────────────────────
    {
      name: "Personalised mug for him",
      slug: "personalised-mug-for-him",
      description:
        "A bold ceramic mug personalised with his name and a message he will love.",
      price: 39900,
      comparePrice: 59900,
      stock: 60,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.mug1, IMGS.lamp1],
      categoryId: S["gifts-for-him"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "him", "personalised"],
    },
    {
      name: "LED name lamp for him",
      slug: "led-name-lamp-for-him",
      description:
        "A personalised LED lamp that glows his name. A premium and unique gift for any occasion.",
      price: 89900,
      comparePrice: 129900,
      stock: 25,
      badge: null,
      customizable: true,
      images: [IMGS.lamp1, IMGS.frame1],
      categoryId: S["gifts-for-him"],
      customizationFields: nameOnly,
      tags: ["lamp", "led", "him"],
    },
    {
      name: "Personalised wallet card for him",
      slug: "personalised-wallet-card-him",
      description:
        "A premium metal wallet card with a personalised message. Compact, elegant, unforgettable.",
      price: 29900,
      comparePrice: 49900,
      stock: 80,
      badge: "New",
      customizable: true,
      images: [IMGS.frame1, IMGS.mug1],
      categoryId: S["gifts-for-him"],
      customizationFields: [
        {
          type: "text",
          label: "Your message",
          maxLength: 50,
          required: true,
          placeholder: "e.g. You are my hero",
        },
      ],
      tags: ["wallet card", "him", "personalised"],
    },
    {
      name: "Photo explosion box for him",
      slug: "photo-explosion-box-him",
      description:
        "Fill it with memories — a hand-assembled explosion box with his favourite moments.",
      price: 149900,
      comparePrice: 199900,
      stock: 18,
      badge: null,
      customizable: true,
      images: [IMGS.box1, IMGS.hamper1],
      categoryId: S["gifts-for-him"],
      customizationFields: photoMsg,
      tags: ["explosion box", "photo", "him"],
    },

    // ── GIFTS FOR HER ────────────────────────────────────────────────────────
    {
      name: "Personalised mug for her",
      slug: "personalised-mug-for-her",
      description:
        "A pretty personalised mug with her name and favourite quote.",
      price: 39900,
      comparePrice: 59900,
      stock: 60,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.mug1, IMGS.cushion1],
      categoryId: S["gifts-for-her"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "her", "personalised"],
    },
    {
      name: "Personalised cushion for her",
      slug: "personalised-cushion-her",
      description:
        "A soft photo cushion personalised with her favourite picture and a message.",
      price: 49900,
      comparePrice: 69900,
      stock: 45,
      badge: null,
      customizable: true,
      images: [IMGS.cushion1, IMGS.frame1],
      categoryId: S["gifts-for-her"],
      customizationFields: photoMsg,
      tags: ["cushion", "her", "personalised"],
    },
    {
      name: "Photo frame for her",
      slug: "photo-frame-for-her",
      description: "A beautiful wooden photo frame personalised with her name.",
      price: 59900,
      comparePrice: 89900,
      stock: 40,
      badge: null,
      customizable: true,
      images: [IMGS.frame1, IMGS.mug1],
      categoryId: S["gifts-for-her"],
      customizationFields: namePhotoMsg,
      tags: ["frame", "her", "personalised"],
    },

    // ── GIFTS FOR BOYFRIEND ──────────────────────────────────────────────────
    {
      name: "Couple photo frame",
      slug: "couple-photo-frame-boyfriend",
      description:
        "A romantic couple frame personalised with both your names and a special date.",
      price: 69900,
      comparePrice: 99900,
      stock: 35,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.frame1, IMGS.box1],
      categoryId: S["gifts-for-boyfriend"],
      customizationFields: [
        { type: "text", label: "Your name", maxLength: 15, required: true },
        {
          type: "text",
          label: "Partner's name",
          maxLength: 15,
          required: true,
        },
        { type: "image", label: "Couple photo", required: true },
        {
          type: "textarea",
          label: "Your message",
          maxLength: 80,
          required: false,
        },
      ],
      tags: ["couple", "frame", "boyfriend", "personalised"],
    },
    {
      name: "Personalised mug for boyfriend",
      slug: "personalised-mug-boyfriend",
      description:
        "Show him how much you care with a personalised mug featuring both your names.",
      price: 39900,
      comparePrice: 59900,
      stock: 50,
      badge: null,
      customizable: true,
      images: [IMGS.mug1, IMGS.cushion1],
      categoryId: S["gifts-for-boyfriend"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "boyfriend", "personalised"],
    },
    {
      name: "Surprise explosion box for boyfriend",
      slug: "explosion-box-boyfriend",
      description:
        "Packed with your best photos and love notes — an explosion of memories.",
      price: 149900,
      comparePrice: 199900,
      stock: 20,
      badge: "New",
      customizable: true,
      images: [IMGS.box1, IMGS.frame1],
      categoryId: S["gifts-for-boyfriend"],
      customizationFields: photoMsg,
      tags: ["explosion box", "boyfriend", "surprise"],
    },

    // ── GIFTS FOR GIRLFRIEND ─────────────────────────────────────────────────
    {
      name: "Personalised cushion for girlfriend",
      slug: "personalised-cushion-girlfriend",
      description:
        "A cozy cushion with your favourite photo together printed on it.",
      price: 49900,
      comparePrice: 69900,
      stock: 45,
      badge: null,
      customizable: true,
      images: [IMGS.cushion1, IMGS.frame1],
      categoryId: S["gifts-for-girlfriend"],
      customizationFields: photoMsg,
      tags: ["cushion", "girlfriend", "personalised"],
    },
    {
      name: "Romantic explosion box for her",
      slug: "romantic-explosion-box-girlfriend",
      description:
        "A magical box filled with your love letters and favourite moments together.",
      price: 149900,
      comparePrice: 199900,
      stock: 18,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.box1, IMGS.cushion1],
      categoryId: S["gifts-for-girlfriend"],
      customizationFields: photoMsg,
      tags: ["explosion box", "girlfriend", "romantic"],
    },
    {
      name: "Personalised LED lamp for girlfriend",
      slug: "led-lamp-girlfriend",
      description:
        "A pretty LED lamp personalised with her name. Warm, glowing, and totally unique.",
      price: 89900,
      comparePrice: 129900,
      stock: 28,
      badge: null,
      customizable: true,
      images: [IMGS.lamp1, IMGS.mug1],
      categoryId: S["gifts-for-girlfriend"],
      customizationFields: nameOnly,
      tags: ["lamp", "led", "girlfriend"],
    },

    // ── GIFTS FOR WIFE ───────────────────────────────────────────────────────
    {
      name: "Personalised frame for wife",
      slug: "personalised-frame-wife",
      description:
        "A beautiful frame personalised with your love story — names, date and a photo.",
      price: 69900,
      comparePrice: 99900,
      stock: 35,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.frame1, IMGS.cushion1],
      categoryId: S["gifts-for-wife"],
      customizationFields: namePhotoMsg,
      tags: ["frame", "wife", "personalised"],
    },
    {
      name: "Anniversary hamper for wife",
      slug: "anniversary-hamper-wife",
      description:
        "A premium hamper with flowers, chocolates and a personalised keepsake for your wife.",
      price: 249900,
      comparePrice: 349900,
      stock: 12,
      badge: "Premium",
      customizable: false,
      images: [IMGS.hamper1, IMGS.box1],
      categoryId: S["gifts-for-wife"],
      tags: ["hamper", "wife", "anniversary"],
    },

    // ── GIFTS FOR HUSBAND ────────────────────────────────────────────────────
    {
      name: "Personalised mug for husband",
      slug: "personalised-mug-husband",
      description:
        "Start his morning right with a personalised mug that has your photo and a message.",
      price: 39900,
      comparePrice: 59900,
      stock: 55,
      badge: null,
      customizable: true,
      images: [IMGS.mug1, IMGS.lamp1],
      categoryId: S["gifts-for-husband"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "husband", "personalised"],
    },
    {
      name: "LED lamp for husband",
      slug: "led-lamp-husband",
      description:
        "A personalised LED name lamp for his desk — a constant reminder of your love.",
      price: 89900,
      comparePrice: 129900,
      stock: 25,
      badge: "New",
      customizable: true,
      images: [IMGS.lamp1, IMGS.frame1],
      categoryId: S["gifts-for-husband"],
      customizationFields: nameOnly,
      tags: ["lamp", "husband", "personalised"],
    },

    // ── GIFTS FOR SISTER ─────────────────────────────────────────────────────
    {
      name: "Personalised mug for sister",
      slug: "personalised-mug-sister",
      description: "A sweet and funny personalised mug for your sister.",
      price: 39900,
      comparePrice: 59900,
      stock: 50,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.mug1, IMGS.cushion1],
      categoryId: S["gifts-for-sister"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "sister", "personalised"],
    },
    {
      name: "Photo cushion for sister",
      slug: "photo-cushion-sister",
      description:
        "A soft cushion with your favourite sibling photo printed on it.",
      price: 49900,
      comparePrice: 69900,
      stock: 40,
      badge: null,
      customizable: true,
      images: [IMGS.cushion1, IMGS.frame1],
      categoryId: S["gifts-for-sister"],
      customizationFields: photoMsg,
      tags: ["cushion", "sister", "personalised"],
    },

    // ── GIFTS FOR BROTHER ────────────────────────────────────────────────────
    {
      name: "Personalised mug for brother",
      slug: "personalised-mug-brother",
      description:
        "A cool personalised mug for your brother with his name and a fun message.",
      price: 39900,
      comparePrice: 59900,
      stock: 50,
      badge: null,
      customizable: true,
      images: [IMGS.mug1, IMGS.lamp1],
      categoryId: S["gifts-for-brother"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "brother", "personalised"],
    },
    {
      name: "LED name lamp for brother",
      slug: "led-lamp-brother",
      description:
        "A glowing LED name lamp for his room — personalised and totally unique.",
      price: 89900,
      comparePrice: 129900,
      stock: 28,
      badge: "New",
      customizable: true,
      images: [IMGS.lamp1, IMGS.mug1],
      categoryId: S["gifts-for-brother"],
      customizationFields: nameOnly,
      tags: ["lamp", "brother", "personalised"],
    },

    // ── ANNIVERSARY GIFTS FOR WIFE ───────────────────────────────────────────
    {
      name: "Couple explosion box anniversary",
      slug: "couple-explosion-box-anniversary",
      description:
        "An explosion box filled with your best couple memories. The perfect anniversary surprise.",
      price: 169900,
      comparePrice: 229900,
      stock: 15,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.box1, IMGS.frame1],
      categoryId: S["anniversary-gifts-for-wife"],
      customizationFields: photoMsg,
      tags: ["explosion box", "anniversary", "wife", "couple"],
    },
    {
      name: "Personalised LED lamp anniversary",
      slug: "led-lamp-anniversary-wife",
      description:
        "A glowing LED lamp with both your names and the date you fell in love.",
      price: 99900,
      comparePrice: 149900,
      stock: 22,
      badge: null,
      customizable: true,
      images: [IMGS.lamp1, IMGS.cushion1],
      categoryId: S["anniversary-gifts-for-wife"],
      customizationFields: [
        { type: "text", label: "Name 1", maxLength: 12, required: true },
        { type: "text", label: "Name 2", maxLength: 12, required: true },
        {
          type: "text",
          label: "Your date",
          maxLength: 20,
          required: false,
          placeholder: "e.g. 14 Feb 2020",
        },
      ],
      tags: ["lamp", "anniversary", "wife"],
    },

    // ── CUSTOMIZED MUGS ──────────────────────────────────────────────────────
    {
      name: "Classic personalised photo mug",
      slug: "classic-personalised-photo-mug",
      description:
        "Our most popular mug — fully customised with your photo and name on premium ceramic.",
      price: 39900,
      comparePrice: 59900,
      stock: 100,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.mug1, IMGS.frame1],
      categoryId: S["customized-mugs"],
      customizationFields: namePhotoMsg,
      tags: ["mug", "photo", "personalised", "custom"],
    },
    {
      name: "Magic colour-changing mug",
      slug: "magic-colour-changing-mug",
      description:
        "This mug reveals a hidden photo when hot liquid is poured in. Pure magic!",
      price: 59900,
      comparePrice: 89900,
      stock: 40,
      badge: "New",
      customizable: true,
      images: [IMGS.mug1, IMGS.box1],
      categoryId: S["customized-mugs"],
      customizationFields: photoMsg,
      tags: ["mug", "magic", "photo", "custom"],
    },
    {
      name: "Couple mug set",
      slug: "couple-mug-set",
      description:
        "A matching set of two personalised mugs — one for him, one for her.",
      price: 79900,
      comparePrice: 119900,
      stock: 30,
      badge: null,
      customizable: true,
      images: [IMGS.mug1, IMGS.cushion1],
      categoryId: S["customized-mugs"],
      customizationFields: [
        { type: "text", label: "Mug 1 name", maxLength: 15, required: true },
        { type: "text", label: "Mug 2 name", maxLength: 15, required: true },
      ],
      tags: ["mug", "couple", "set", "custom"],
    },

    // ── EXPLOSION BOXES ──────────────────────────────────────────────────────
    {
      name: "Classic explosion box",
      slug: "classic-explosion-box",
      description:
        "A hand-assembled explosion box with 6 compartments for photos, messages and surprises.",
      price: 149900,
      comparePrice: 199900,
      stock: 25,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.box1, IMGS.frame1],
      categoryId: S["explosion-boxes"],
      customizationFields: photoMsg,
      tags: ["explosion box", "surprise", "photo"],
    },
    {
      name: "Premium explosion box",
      slug: "premium-explosion-box",
      description:
        "A premium explosion box with 9 compartments, LED lights and extra surprise layers.",
      price: 199900,
      comparePrice: 279900,
      stock: 15,
      badge: "Premium",
      customizable: true,
      images: [IMGS.box1, IMGS.hamper1],
      categoryId: S["explosion-boxes"],
      customizationFields: photoMsg,
      tags: ["explosion box", "premium", "led", "surprise"],
    },

    // ── LED LAMPS ────────────────────────────────────────────────────────────
    {
      name: "Name LED desk lamp",
      slug: "name-led-desk-lamp",
      description:
        "A stunning LED lamp that glows any name or word in warm white light.",
      price: 89900,
      comparePrice: 129900,
      stock: 35,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.lamp1, IMGS.mug1],
      categoryId: S["led-lamps"],
      customizationFields: nameOnly,
      tags: ["lamp", "led", "name", "desk"],
    },
    {
      name: "Photo LED lamp",
      slug: "photo-led-lamp",
      description:
        "A round LED lamp that projects your photo in warm amber light. Magical!",
      price: 119900,
      comparePrice: 169900,
      stock: 20,
      badge: "New",
      customizable: true,
      images: [IMGS.lamp1, IMGS.frame1],
      categoryId: S["led-lamps"],
      customizationFields: photoMsg,
      tags: ["lamp", "led", "photo"],
    },

    // ── CUSHIONS ─────────────────────────────────────────────────────────────
    {
      name: "Personalised photo cushion",
      slug: "personalised-photo-cushion",
      description:
        "A soft and cozy cushion with your favourite photo printed on both sides.",
      price: 49900,
      comparePrice: 69900,
      stock: 60,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.cushion1, IMGS.mug1],
      categoryId: S["cushions"],
      customizationFields: photoMsg,
      tags: ["cushion", "photo", "personalised"],
    },
    {
      name: "Couple photo cushion",
      slug: "couple-photo-cushion",
      description:
        "A cushion for two — your couple photo printed on premium velvet fabric.",
      price: 59900,
      comparePrice: 89900,
      stock: 45,
      badge: null,
      customizable: true,
      images: [IMGS.cushion1, IMGS.frame1],
      categoryId: S["cushions"],
      customizationFields: photoMsg,
      tags: ["cushion", "couple", "photo"],
    },

    // ── VALENTINES DAY ───────────────────────────────────────────────────────
    {
      name: "Valentine couple frame",
      slug: "valentine-couple-frame",
      description:
        "A romantic heart-shaped frame with both your names and a love quote.",
      price: 79900,
      comparePrice: 119900,
      stock: 30,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.frame1, IMGS.box1],
      categoryId: S["valentines-day"],
      customizationFields: namePhotoMsg,
      tags: ["valentine", "couple", "frame", "love"],
    },
    {
      name: "Valentine explosion box",
      slug: "valentine-explosion-box",
      description:
        "A red and gold explosion box filled with your love story and messages.",
      price: 179900,
      comparePrice: 249900,
      stock: 20,
      badge: "New",
      customizable: true,
      images: [IMGS.box1, IMGS.cushion1],
      categoryId: S["valentines-day"],
      customizationFields: photoMsg,
      tags: ["valentine", "explosion box", "love", "surprise"],
    },
    {
      name: "Valentine photo cushion",
      slug: "valentine-photo-cushion",
      description: "A heart-print cushion personalised with your couple photo.",
      price: 59900,
      comparePrice: 89900,
      stock: 40,
      badge: null,
      customizable: true,
      images: [IMGS.cushion1, IMGS.lamp1],
      categoryId: S["valentines-day"],
      customizationFields: photoMsg,
      tags: ["valentine", "cushion", "photo", "love"],
    },

    // ── CORPORATE GIFTS ──────────────────────────────────────────────────────
    {
      name: "Branded corporate mug",
      slug: "branded-corporate-mug",
      description:
        "Premium ceramic mugs with your company logo and employee names. Minimum 50 pieces.",
      price: 29900,
      comparePrice: 49900,
      stock: 999,
      badge: "Bulk",
      customizable: true,
      images: [IMGS.mug1, IMGS.hamper1],
      categoryId: S["corporate-gifts"],
      customizationFields: [
        { type: "text", label: "Employee name", maxLength: 20, required: true },
        { type: "text", label: "Company name", maxLength: 30, required: true },
      ],
      tags: ["corporate", "mug", "branded", "bulk"],
    },
    {
      name: "Corporate gift hamper",
      slug: "corporate-gift-hamper",
      description:
        "A premium corporate gift hamper with branded items. Bulk pricing available.",
      price: 299900,
      comparePrice: 399900,
      stock: 200,
      badge: "Premium",
      customizable: false,
      images: [IMGS.hamper1, IMGS.box1],
      categoryId: S["corporate-gifts"],
      tags: ["corporate", "hamper", "premium", "bulk"],
    },

    // ── GIFT HAMPERS ─────────────────────────────────────────────────────────
    {
      name: "Premium gift hamper",
      slug: "premium-gift-hamper",
      description:
        "A beautifully curated gift hamper with premium items. Perfect for all occasions.",
      price: 249900,
      comparePrice: 349900,
      stock: 15,
      badge: "Premium",
      customizable: false,
      images: [IMGS.hamper1, IMGS.box1],
      categoryId: P["gift-hampers"],
      tags: ["hamper", "premium", "gifting"],
    },
    {
      name: "Birthday gift hamper",
      slug: "birthday-gift-hamper",
      description:
        "A birthday hamper packed with curated goodies and a personalised card.",
      price: 199900,
      comparePrice: 279900,
      stock: 20,
      badge: null,
      customizable: false,
      images: [IMGS.hamper1, IMGS.mug1],
      categoryId: S["birthday-hampers"],
      tags: ["hamper", "birthday", "gifting"],
    },

    // ── PHOTO FRAMES ─────────────────────────────────────────────────────────
    {
      name: "Personalised photo frame",
      slug: "personalised-photo-frame",
      description:
        "A stunning wooden photo frame personalised with names and dates.",
      price: 59900,
      comparePrice: 89900,
      stock: 40,
      badge: null,
      customizable: true,
      images: [IMGS.frame1, IMGS.lamp1],
      categoryId: P["photo-frames"],
      customizationFields: namePhotoMsg,
      tags: ["frame", "photo", "personalised"],
    },
    {
      name: "Couple anniversary frame",
      slug: "couple-anniversary-frame",
      description:
        "A romantic couple frame with your names, the date you met and a favourite photo.",
      price: 79900,
      comparePrice: 119900,
      stock: 30,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.frame1, IMGS.box1],
      categoryId: S["couple-frames"],
      customizationFields: namePhotoMsg,
      tags: ["frame", "couple", "anniversary"],
    },

    // ── GIFTS FOR FIANCE
    {
      name: "Romantic explosion box for fiance",
      slug: "romantic-explosion-box-fiance",
      description: "A magical explosion box filled with your love story.",
      price: 169900,
      comparePrice: 229900,
      stock: 20,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.box1, IMGS.frame1],
      categoryId: S["gifts-for-fiance"],
      customizationFields: photoMsg,
      tags: ["fiance", "explosion box", "romantic"],
    },
    {
      name: "Personalised LED lamp for fiance",
      slug: "led-lamp-fiance",
      description: "A glowing LED lamp personalised with both your names.",
      price: 99900,
      comparePrice: 149900,
      stock: 25,
      badge: null,
      customizable: true,
      images: [IMGS.lamp1, IMGS.frame1],
      categoryId: S["gifts-for-fiance"],
      customizationFields: nameOnly,
      tags: ["fiance", "led lamp", "personalised"],
    },

    // ── GIFTS FOR BRIDESMAIDS
    {
      name: "Personalised mug for bridesmaid",
      slug: "personalised-mug-bridesmaid",
      description: "A pretty personalised mug for your bridesmaid.",
      price: 39900,
      comparePrice: 59900,
      stock: 50,
      badge: null,
      customizable: true,
      images: [IMGS.mug1, IMGS.cushion1],
      categoryId: S["gifts-for-bridesmaids"],
      customizationFields: namePhotoMsg,
      tags: ["bridesmaid", "mug", "personalised"],
    },

    // ── GIFTS FOR NEWLY MARRIED COUPLE
    {
      name: "Couple frame for newly married",
      slug: "couple-frame-newly-married",
      description:
        "A gorgeous personalised couple frame to commemorate their married life.",
      price: 79900,
      comparePrice: 119900,
      stock: 30,
      badge: "Best seller",
      customizable: true,
      images: [IMGS.frame1, IMGS.box1],
      categoryId: S["gifts-for-newly-married-couple"],
      customizationFields: namePhotoMsg,
      tags: ["newly married", "couple", "frame"],
    },

    // ── GIFTS FOR MOM TO BE
    {
      name: "Personalised mug for mom to be",
      slug: "personalised-mug-mom-to-be",
      description:
        "A sweet personalised mug celebrating the wonderful mom-to-be.",
      price: 39900,
      comparePrice: 59900,
      stock: 40,
      badge: "New",
      customizable: true,
      images: [IMGS.mug1, IMGS.cushion1],
      categoryId: S["gifts-for-mom-to-be"],
      customizationFields: namePhotoMsg,
      tags: ["mom to be", "pregnancy", "mug"],
    },

    // ── GIFTS FOR DAD TO BE
    {
      name: "Personalised mug for dad to be",
      slug: "personalised-mug-dad-to-be",
      description: "A fun personalised mug for the dad-to-be.",
      price: 39900,
      comparePrice: 59900,
      stock: 40,
      badge: "New",
      customizable: true,
      images: [IMGS.mug1, IMGS.lamp1],
      categoryId: S["gifts-for-dad-to-be"],
      customizationFields: namePhotoMsg,
      tags: ["dad to be", "pregnancy", "mug"],
    },

    // ── GIFTS FOR PARENTS TO BE
    {
      name: "Parents to be photo frame",
      slug: "parents-to-be-photo-frame",
      description:
        "A heartwarming frame personalised for the soon-to-be parents.",
      price: 69900,
      comparePrice: 99900,
      stock: 30,
      badge: null,
      customizable: true,
      images: [IMGS.frame1, IMGS.cushion1],
      categoryId: S["gifts-for-parents-to-be"],
      customizationFields: namePhotoMsg,
      tags: ["parents to be", "baby shower", "frame"],
    },

    // ── STYLE YOUR OWN
    {
      name: "Build your own photo mug",
      slug: "build-your-own-photo-mug",
      description:
        "Design your own personalised mug — your photo, name and message.",
      price: 49900,
      comparePrice: 79900,
      stock: 100,
      badge: "New",
      customizable: true,
      images: [IMGS.mug1, IMGS.frame1],
      categoryId: S["custom-mugs"],
      customizationFields: namePhotoMsg,
      tags: ["custom", "mug", "diy"],
    },
    {
      name: "Build your own photo frame",
      slug: "build-your-own-photo-frame",
      description:
        "Create a completely custom photo frame — your photo, your words.",
      price: 69900,
      comparePrice: 99900,
      stock: 50,
      badge: "New",
      customizable: true,
      images: [IMGS.frame1, IMGS.lamp1],
      categoryId: S["custom-frames"],
      customizationFields: namePhotoMsg,
      tags: ["custom", "frame", "diy"],
    },
    {
      name: "Build your own LED lamp",
      slug: "build-your-own-led-lamp",
      description: "Design your own glowing LED lamp.",
      price: 89900,
      comparePrice: 129900,
      stock: 40,
      badge: "New",
      customizable: true,
      images: [IMGS.lamp1, IMGS.frame1],
      categoryId: S["custom-led-lamps"],
      customizationFields: nameOnly,
      tags: ["custom", "led lamp", "diy"],
    },
    {
      name: "Build your own gift hamper",
      slug: "build-your-own-gift-hamper",
      description: "Curate your own premium gift hamper.",
      price: 249900,
      comparePrice: 349900,
      stock: 30,
      badge: "New",
      customizable: false,
      images: [IMGS.hamper1, IMGS.box1],
      categoryId: S["custom-hampers"],
      tags: ["custom", "hamper", "build your own"],
    },
  ];

  for (const p of products) {
    const { categoryId, ...rest } = p;
    if (!categoryId) {
      console.warn("⚠️ No categoryId for:", p.slug);
      continue;
    }
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...rest, categoryId, status: "ACTIVE" },
    });
  }
  console.log("✅ Products created:", products.length);

  // ── COUPONS ───────────────────────────────────────────────────────────────
  for (const coupon of [
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
  ]) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }
  console.log("✅ Coupons seeded");

  // ── BANNER ────────────────────────────────────────────────────────────────
  await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Make every moment special",
      image: IMGS.box1,
      linkUrl: "/shop",
      position: "hero",
      isActive: true,
      sortOrder: 1,
    },
  });
  console.log("✅ Banner seeded");

  console.log("\n🎉 Seeding complete!");
  console.log("Admin: hashtaggiftsupport@gmail.com / admin123");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
