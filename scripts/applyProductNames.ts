/**
 * Gives all 152 products proper, unique names (based on the client's product
 * document + the colour/style of each design) and regenerates their URLs
 * (slug) from the new name. Safe pre-launch; old slugs are replaced.
 *
 * USAGE (PowerShell, project root)
 *   $env:DRY_RUN="1"; npm run apply:names     # preview
 *   Remove-Item Env:DRY_RUN; npm run apply:names
 * Old names/slugs are saved to backup-names-<date>.json first.
 * Prices are NOT touched (use export:sheet / import:sheet for prices).
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === "1";

const D = "Personalized Executive Gift Set";
const NAMES: Record<string, string[]> = {
  "01": [
    "Blush Beige Diary, Card Holder & Pen", "Slate Grey Diary, Card Holder & Pen", "Midnight Navy Wave Diary, Card Holder & Pen",
    "Classic White Diary, Card Holder & Pen", "Sand Linen Diary, Card Holder & Pen", "Charcoal Check Diary, Card Holder & Pen",
    "Olive Brown Check Diary, Card Holder & Pen", "Plum Check Diary, Card Holder & Pen", "Ocean Blue Diary, Card Holder & Pen",
    "Onyx Black Buckle Diary, Card Holder & Pen", "Burnt Orange Diary, Card Holder & Pen", "Stone Grey Buckle Diary, Card Holder & Pen",
    "Jet Black Diary & Pen", "Snow White Diary & Pen", "Wood Grain Diary & Bamboo Pen", "Royal Blue Diary & Pen",
    "Two-Tone Grey Diary & Pen", "Ash Grey Diary & Pen", "Grey Diary, Pen & Keychain Gift Box", "Blue Flap Diary, Pen & Keychain",
    "Navy & Slate Diary & Pen", "Tangerine Two-Tone Diary & Pen", "Grey & Aqua Diary & Pen", "Chocolate & Blush Diary",
    "Light Grey Pocket Diary with Pen Holder", "Natural Wood & Brown Diary", "Green & Mustard Diary", "Rust Orange Pocket Diary",
    "Navy Flap Diary", "Black Pocket Diary", "Black Diary, Pen & Travel Bottle",
  ].map((n) => `${D} – ${n}`),
  "02": ["Navy", "Tan", "Grey", "Black", "Olive", "Chocolate Brown"].map((c) => `Personalised Passport Cover – ${c}`),
  "03": ["Beige Nude", "Black", "Multicolour Collection I", "Multicolour Collection II", "Multicolour Collection III", "Multicolour Collection IV"]
    .map((c) => `Personalized Passport Cover, Glamorous Fold – ${c}`),
  "04": ["Tan", "Navy", "Chestnut Brown", "Grey", "Black"].map((c) => `Travel Wallet Organiser – ${c}`),
  "05": ["Forest Green", "Chocolate Brown", "Tan"].map((c) => `Personalized Zippered Mobile Pouch – ${c}`),
  "06": ["Tan", "Forest Green", "Navy", "Multicolour Set", "Coffee Brown", "Black"].map((c) => `Personalised Stationery Pouch – ${c}`),
  "07": ["Tan", "Grey", "Navy", "Chocolate Brown"].map((c) => `Personalised Multipurpose Toiletry Pouch – ${c}`),
  "08": ["Forest Green", "Tan Brown", "Navy", "Espresso Brown", "Black", "Slate Grey"].map((c) => `Personalised Women's Wallet – ${c}`),
  "09": ["Forest Green", "Navy", "Tan Brown", "Black", "Chestnut Brown", "Slate Grey"].map((c) => `Personalised Vegan Leather Clutch – ${c}`),
  "10": ["Chestnut Brown", "Black", "Navy", "Forest Green", "Tan Brown", "Slate Grey"].map((c) => `Personalised Vegan Leather Clutch with Mobile Pocket – ${c}`),
  "11": ["Chocolate Brown", "Black", "Tan", "Navy", "Steel Grey", "Forest Green"].map((c) => `Personalized Vegan Leather Men's Wallet – ${c}`),
  "12": ["Espresso Brown", "Black", "Tan"].map((c) => `Personalized Men's Compact Leather Wallet – ${c}`),
  "13": ["Navy", "Forest Green", "Blush Pink", "Sky Blue", "Maroon", "Beige", "Burnt Orange", "Black"].map((c) => `Men's Croc Leather Wallet – ${c}`),
  "14": ["Brown Diamond Emboss", "Maroon Weave", "Black Weave"].map((c) => `Personalized Men's Textured Leather Wallet – ${c}`),
  "15": [
    "Rustic Orange Crystal Twist Pen", "Black & Gold Crystal Twist Pen", "Crimson Crystal Twist Pen", "Royal Blue Crystal Twist Pen",
    "Matte Black Slim Pen", "Charcoal Matte Pen", "Sunset Orange Matte Pen", "Espresso Matte Pen", "Golden Textured Pen",
    "Silver Textured Executive Pen", "Black Rose Gold Stylus Pen", "Black Ribbed Stylus Pen", "Black Sleek Roller Pen",
    "Black & Gold Ornate Pen", "Black Gold Grid Pen", "Black Grip Stylus Pen", "Classic Black Fountain Pen", "Silver & Gold Slim Pen",
    "Black Carved Clip Pen", "Black & Gold Crown Pen", "Matte Black Executive Pen", "Golden Wood Grain Pen", "Black & Gold Signature Pen",
    "Silver Knurled Roller Pen", "Gunmetal Silver Pen", "Silver Filigree Pen", "Black & Gold Twist Pen", "Black Gold Band Pen", "Black Classic Ballpoint Pen",
  ].map((n) => `Personalized ${n}`),
  "16": ["Chestnut Brown with Bow Charm", "Chestnut Brown with Love Charm", "Black with Butterfly Charm", "Grey with Horseshoe Charm", "Navy with Bow Charm", "Forest Green with Butterfly Charm"]
    .map((c) => `Personalized Women's Passport Cover & Wallet Combo – ${c}`),
  "17": ["Chestnut Brown with Bow Charm", "Chestnut Brown with Love Charm", "Black with Butterfly Charm", "Grey with Horseshoe Charm", "Navy with Heart Charm", "Forest Green with Butterfly Charm"]
    .map((c) => `Personalized Women's Passport Cover & Envelope Clutch Combo – ${c}`),
  "18": ["Brown Luxe Travel Set", "Brown Envelope Clutch with Love Charm", "Black Luxe Travel Set", "Grey Passport Cover with Liberty Charm", "Navy Passport Cover with Bow Charm", "Green Passport Cover with Fairy Charm"]
    .map((c) => `Personalized Women's ${c}`),
  "19": ["Forest Green", "Tan Brown", "Chocolate Brown with Camera Charm", "Navy", "Black with Crown Charm", "Black with Liberty Charm"]
    .map((c) => `Personalized Men's Travel Combo – ${c}`),
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

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

async function run() {
  await connectWithRetry();
  const products = await prisma.product.findMany({ where: { sku: { startsWith: "HG-" } }, select: { id: true, sku: true, name: true, slug: true } });
  const plan: { id: number; sku: string; oldName: string; oldSlug: string; name: string; slug: string }[] = [];
  const unmatched: string[] = [];
  const usedSlugs = new Set<string>();

  for (const p of products) {
    const m = /^HG-(\d{2})-(\d{2})/.exec(p.sku || "");
    const name = m ? NAMES[m[1]]?.[parseInt(m[2], 10) - 1] : undefined;
    if (!name) { unmatched.push(p.sku || String(p.id)); continue; }
    let slug = slugify(name);
    if (usedSlugs.has(slug)) slug = `${slug}-${m![2]}`;
    usedSlugs.add(slug);
    plan.push({ id: p.id as any, sku: p.sku!, oldName: p.name, oldSlug: p.slug, name, slug });
  }

  // names must be unique
  const seen = new Map<string, string>();
  for (const x of plan) { if (seen.has(x.name)) console.log(`DUPLICATE NAME: ${x.sku} and ${seen.get(x.name)} -> ${x.name}`); seen.set(x.name, x.sku); }

  console.log(`Matched ${plan.length} products, unmatched ${unmatched.length}${unmatched.length ? ": " + unmatched.join(", ") : ""}`);
  plan.slice().sort((a, b) => a.sku.localeCompare(b.sku)).forEach((x) => console.log(`${x.sku}  ${x.name}`));
  if (DRY_RUN) { console.log("\nDRY RUN — nothing written."); return; }

  const backup = path.join(process.cwd(), `backup-names-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(backup, JSON.stringify(plan.map(({ id, sku, oldName, oldSlug }) => ({ id, sku, name: oldName, slug: oldSlug })), null, 2));
  console.log(`Backup: ${backup}`);

  // clear slugs first to avoid unique clashes mid-run
  for (const x of plan) await prisma.product.update({ where: { id: x.id as any }, data: { slug: `tmp-${x.id}-${Date.now()}` } });
  for (const x of plan) await prisma.product.update({ where: { id: x.id as any }, data: { name: x.name, slug: x.slug } });
  console.log(`Done — renamed ${plan.length} products.`);
}

run().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
