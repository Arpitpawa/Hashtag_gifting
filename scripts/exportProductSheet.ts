/**
 * Exports every product to products-sheet.csv so names and prices can be
 * filled in (Excel / Google Sheets), then loaded back with import:sheet.
 *
 * Columns: sku, type, name, price_rs, compare_price_rs, stock, status
 *   - name / prices are the CURRENT values — edit the ones you want to change.
 *   - price_rs / compare_price_rs are in RUPEES (e.g. 999). Leave compare blank
 *     for "no strike-through price".
 *
 * USAGE (PowerShell, project root):   npm run export:sheet
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TYPE: Record<string, string> = {
  "01": "Diary & Pen Combo", "02": "Passport Cover (Type 1)", "03": "Passport Cover (Type 2)", "04": "Travel Wallet Organiser",
  "05": "Mobile Pouch", "06": "Stationery Pouch", "07": "Multipurpose / Toiletry Pouch", "08": "Women's Wallet",
  "09": "Vegan Leather Clutch", "10": "Clutch with Mobile Pocket", "11": "Men's Vegan Leather Wallet", "12": "Men's Wallet (Type 2)",
  "13": "Men's Croc Wallet", "14": "Men's Wallet (Type 4)", "15": "Pen", "16": "Women's Combo (Type 1)",
  "17": "Women's Combo (Type 2)", "18": "Women's Combo (Type 3)", "19": "Men's Combo",
};

const csv = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

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
  const products = await prisma.product.findMany({
    where: { deletedAt: null, sku: { startsWith: "HG-" } },
    orderBy: { sku: "asc" },
    select: { sku: true, name: true, price: true, comparePrice: true, stock: true, status: true },
  });

  const rows = [["sku", "type", "name", "price_rs", "compare_price_rs", "stock", "status"]];
  for (const p of products) {
    const num = /^HG-(\d{2})-/.exec(p.sku ?? "")?.[1] ?? "";
    rows.push([
      p.sku ?? "", TYPE[num] ?? "", p.name,
      String(p.price / 100), p.comparePrice ? String(p.comparePrice / 100) : "",
      String(p.stock), p.status,
    ]);
  }
  const file = path.join(process.cwd(), "products-sheet.csv");
  // BOM so Excel shows ₹ / accents correctly
  fs.writeFileSync(file, "﻿" + rows.map((r) => r.map(csv).join(",")).join("\r\n"));
  console.log(`Wrote ${products.length} products to products-sheet.csv`);
}

run().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
