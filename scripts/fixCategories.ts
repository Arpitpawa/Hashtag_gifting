/**
 * One-shot category clean-up + precise product assignment.
 *
 *  1. NAVBAR TIDY-UP (nothing is deleted):
 *     - Product-type categories (Men's/Women's/Travel Wallets, Passport Covers,
 *       Clutches, Pens, Diary & Pen Combos) are moved under "Personalized Gifts"
 *       so its dropdown shows real products instead of mugs/frames.
 *     - Duplicate helper categories made earlier (Wallets, Clutches & Pouches,
 *       Diaries & Pens, For Him, For Her, Shop by Occasion, extra pouch
 *       sub-categories) are hidden from the menu (still reachable by URL).
 *  2. PRODUCT ASSIGNMENT: every product's category list is rebuilt from exact
 *     rules (product type + recipient + occasion) — replacing the over-broad
 *     keyword matching from the earlier run, which put products in categories
 *     they don't belong to (e.g. men's wallets under "Women's Wallets").
 *     A product's primary category is left as it is.
 *
 * The navbar hides an EMPTY product-type sub-category (mugs, frames, ...)
 * automatically, but always keeps relationship / occasion ones.
 *
 * USAGE (PowerShell, project root)
 *   $env:DRY_RUN="1"; npm run fix:categories
 *   Remove-Item Env:DRY_RUN; npm run fix:categories
 * Old join rows are saved to backup-categories-fix-<date>.json first.
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === "1";

async function connectWithRetry() {
  for (let i = 1; i <= 8; i++) {
    try { await prisma.$queryRaw`SELECT 1`; return; }
    catch (e) {
      if (i === 8) throw e;
      console.log(`DB not reachable yet (attempt ${i}/8) — waiting for Neon to wake up...`);
      await new Promise((r) => setTimeout(r, 8000));
    }
  }
}

// ── SKU groups (HG-<NN>-<design>) ───────────────────────────────────────────
const MEN    = ["11", "12", "13", "14", "19"];               // men's wallets + men's combos
const WOMEN  = ["05", "08", "09", "10", "16", "17", "18"];   // mobile pouch, women's wallets, clutches, women's combos
const UNISEX = ["01", "02", "03", "04", "06", "07", "15"];   // diary-pen combo, passport covers, travel wallet, pouches, pens
const ALL    = [...MEN, ...WOMEN, ...UNISEX];
const HIM    = [...MEN, ...UNISEX];
const HER    = [...WOMEN, ...UNISEX];
const TRAVEL = ["02", "03", "04", "07"];
const DESK   = ["01", "06", "15"];
const CORP   = ["01", "06", "11", "12", "13", "14", "15", "19"];

// category slug -> SKU numbers that belong in it
const RULES: Record<string, string[]> = {
  // whole catalogue
  "personalized-gifts": ALL,
  // product types
  "stationery": DESK,
  "pouches": ["05", "06", "07"],
  "mobile-pouches": ["05"],
  "stationery-pouches": ["06"],
  "toiletry-bags": ["07"],
  "mens-wallets": ["11", "12", "13", "14"],
  "womens-wallets": ["08"],
  "travel-wallets": ["04"],
  "clutches": ["09", "10"],
  "passport-covers": ["02", "03", "04"],
  "pens": ["15"],
  "diary-pen-combos": ["01"],
  "gift-combos": ["01", "16", "17", "18", "19"],
  "mens-combos": ["19"],
  "womens-combos": ["16", "17", "18"],
  "custom-hampers": ["01", "16", "17", "18", "19"],
  // recipients
  "gifts-for-him": HIM, "gifts-for-boyfriend": HIM, "gifts-for-husband": HIM, "gifts-for-brother": HIM, "gifts-for-father": HIM,
  "gifts-for-her": HER, "gifts-for-girlfriend": HER, "gifts-for-wife": HER, "gifts-for-sister": HER, "gifts-for-mother": HER,
  "gifts-for-friends": ALL,
  "gifts-for-couple": TRAVEL, "couple-gifts": TRAVEL,
  "gifts-for-newly-married-couple": ["01", ...TRAVEL],
  "gifts-for-fiance": ["01", "02", "03", "04"],
  // occasions / special days
  "birthday-gifts": ALL, "birthday-gifts-for-him": HIM, "birthday-gifts-for-her": HER,
  "anniversary-gifts": ALL, "anniversary-gifts-for-husband": HIM, "anniversary-gifts-for-wife": HER,
  "valentines-day": ALL, "friendship-day": ALL, "raksha-bandhan": ALL,
  "womens-day": HER, "mothers-day": HER, "mothers-day-gifts": HER,
  "fathers-day": HIM,
  // bulk / corporate
  "corporate-gifts": CORP,
  "employee-hampers": ["01", "19"],
};
// helper categories created earlier — mirror the real ones (they're hidden anyway)
const ALIASES: Record<string, string> = {
  "for-him": "gifts-for-him", "for-boyfriend": "gifts-for-boyfriend", "for-husband": "gifts-for-husband",
  "for-brother": "gifts-for-brother", "for-father": "gifts-for-father",
  "for-her": "gifts-for-her", "for-girlfriend": "gifts-for-girlfriend", "for-wife": "gifts-for-wife",
  "for-sister": "gifts-for-sister", "for-mother": "gifts-for-mother",
  "wallets": "__wallets", "diaries-pens": "__diaries", "clutches-pouches": "__cp",
  "multipurpose-pouches": "__multi",
  "valentines-day-gifts": "valentines-day", "raksha-bandhan-gifts": "raksha-bandhan",
  "fathers-day-gifts": "fathers-day", "travel-gifts": "__travel", "wedding-gifts": "__travel",
  "diwali-gifts": "__all", "new-year-gifts": "__all", "teachers-day-gifts": "__desk", "graduation-gifts": "__desk",
};
const VIRTUAL: Record<string, string[]> = {
  __wallets: ["04", "08", "11", "12", "13", "14"], __diaries: ["01", "15"], __cp: ["05", "06", "07", "09", "10"],
  __mobile: ["05"], __stat: ["06"], __multi: ["07"], __travel: ["01", ...TRAVEL], __all: ALL, __desk: DESK,
};

// ── navbar layout ───────────────────────────────────────────────────────────
// moved under Personalized Gifts (slug -> nav order)
// Laid out in the same order as the product folders (01 Diary combo ... 19 Combo Mens).
// Missing categories are created automatically. Combos (16-19) live under "Gift Combos".
const UNDER_PERSONALIZED: Record<string, { order: number; name: string }> = {
  "diary-pen-combos": { order: 1, name: "Diary & Pen Combos" },        // 01
  "passport-covers": { order: 2, name: "Passport Covers" },            // 02, 03
  "travel-wallets": { order: 3, name: "Travel Wallet Organisers" },    // 04
  "mobile-pouches": { order: 4, name: "Mobile Pouches" },              // 05
  "stationery-pouches": { order: 5, name: "Stationery Pouches" },      // 06
  "toiletry-bags": { order: 6, name: "Toiletry Bags" },                // 07
  "womens-wallets": { order: 7, name: "Women's Wallets" },             // 08
  "clutches": { order: 8, name: "Clutches" },                          // 09, 10
  "mens-wallets": { order: 9, name: "Men's Wallets" },                 // 11-14
  "pens": { order: 10, name: "Pens" },                                 // 15
  "stationery": { order: 11, name: "Stationery" },                     // 01, 06, 15
};
const HIDE_FROM_NAV = [
  "wallets", "clutches-pouches", "diaries-pens", "pouches", "multipurpose-pouches",
  "for-him", "for-her", "occasions",
];

async function run() {
  await connectWithRetry();
  console.log(DRY_RUN ? "DRY RUN — nothing will be written\n" : "LIVE RUN\n");

  const cats = await prisma.category.findMany({ select: { id: true, name: true, slug: true, parentId: true } });
  const bySlug = new Map(cats.map((c) => [c.slug, c]));
  const byId = new Map(cats.map((c) => [c.id, c]));

  // 1. navbar layout
  const pg = bySlug.get("personalized-gifts");
  if (!pg) throw new Error('Category "personalized-gifts" not found');
  for (const [slug, { order, name }] of Object.entries(UNDER_PERSONALIZED)) {
    let c = bySlug.get(slug);
    if (!c) {
      console.log(`${DRY_RUN ? "would create" : "creating"} category "${name}" (${slug}) under Personalized Gifts`);
      if (DRY_RUN) { c = { id: -(bySlug.size + 1), name, slug, parentId: pg.id }; }
      else c = await prisma.category.create({ data: { name, slug, parentId: pg.id, showInNav: true, navOrder: order }, select: { id: true, name: true, slug: true, parentId: true } });
      bySlug.set(slug, c); byId.set(c.id, c); cats.push(c);
      continue;
    }
    console.log(`${DRY_RUN ? "would place" : "placing"} "${c.name}" under Personalized Gifts (order ${order})`);
    if (!DRY_RUN) await prisma.category.update({ where: { id: c.id }, data: { parentId: pg.id, showInNav: true, navOrder: order } });
    c.parentId = pg.id;
  }
  for (const slug of HIDE_FROM_NAV) {
    const c = bySlug.get(slug);
    if (!c) continue;
    console.log(`${DRY_RUN ? "would hide" : "hiding"} from menu: ${c.name} (${slug})`);
    if (!DRY_RUN) await prisma.category.update({ where: { id: c.id }, data: { showInNav: false } });
  }

  // 2. rebuild product ↔ category rows
  const rules: Record<string, string[]> = { ...RULES };
  for (const [alias, target] of Object.entries(ALIASES)) rules[alias] = VIRTUAL[target] ?? RULES[target];

  const ancestors = (id: number) => {
    const ids: number[] = [];
    let c = byId.get(id);
    while (c) { ids.push(c.id); c = c.parentId ? byId.get(c.parentId) : undefined; }
    return ids;
  };

  const products = await prisma.product.findMany({
    where: { deletedAt: null, sku: { startsWith: "HG-" } },
    select: { id: true, sku: true, productCategories: { select: { categoryId: true } } },
  });

  const wanted = new Map<number, Set<number>>(); // productId -> categoryIds
  const perCat = new Map<number, number>();
  const missing = new Set<string>();
  for (const p of products) {
    const num = /^HG-(\d{2})-/.exec(p.sku ?? "")?.[1];
    if (!num) continue;
    const set = new Set<number>();
    for (const [slug, nums] of Object.entries(rules)) {
      if (!nums.includes(num)) continue;
      const c = bySlug.get(slug);
      if (!c) { missing.add(slug); continue; }
      ancestors(c.id).forEach((id) => set.add(id));
    }
    wanted.set(p.id, set);
    set.forEach((id) => perCat.set(id, (perCat.get(id) ?? 0) + 1));
  }

  if (!DRY_RUN) {
    const backup = `backup-categories-fix-${new Date().toISOString().slice(0, 10)}.json`;
    fs.writeFileSync(path.join(process.cwd(), backup), JSON.stringify(
      products.map((p) => ({ sku: p.sku, categoryIds: p.productCategories.map((x) => x.categoryId) })), null, 2));
    console.log(`\nBackup written: ${backup}`);

    const ids = products.map((p) => p.id);
    const rows = [...wanted.entries()].flatMap(([productId, set]) => [...set].map((categoryId) => ({ productId, categoryId })));
    await prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId: { in: ids } } });
      for (let i = 0; i < rows.length; i += 500) await tx.productCategory.createMany({ data: rows.slice(i, i + 500) });
    }, { timeout: 60_000 });
    console.log(`Rebuilt ${rows.length} product-category rows for ${products.length} products`);
  }

  console.log("\nProducts per category:");
  for (const c of cats) {
    if (perCat.get(c.id)) console.log(`  ${c.name.padEnd(34)} ${String(perCat.get(c.id)).padStart(3)}   (${c.slug})`);
  }
  const empty = cats.filter((c) => !perCat.get(c.id)).map((c) => c.name);
  console.log(`\nCategories with no products: ${empty.join(", ") || "none"}`);
  if (missing.size) console.log(`Not in your DB (skipped): ${[...missing].join(", ")}`);
  if (DRY_RUN) console.log("\nDry run done. Remove DRY_RUN and run again to apply.");
}

run().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
