/**
 * Reads products-sheet.csv (from export:sheet) and updates each product's
 * name, price, compare price and stock by SKU. Only rows whose values changed
 * are written. Slugs (URLs) are NOT changed.
 *
 * Checks before writing: price must be a positive number, compare price (if
 * given) must be higher than price, stock a whole number >= 0, name not empty.
 * Bad rows are listed and skipped.
 *
 * USAGE (PowerShell, project root)
 *   $env:DRY_RUN="1"; npm run import:sheet     # preview
 *   Remove-Item Env:DRY_RUN; npm run import:sheet
 * The previous values are saved to backup-products-<date>.json first.
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === "1";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

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
  const file = path.join(process.cwd(), "products-sheet.csv");
  if (!fs.existsSync(file)) { console.error("products-sheet.csv not found in project root (run npm run export:sheet first)"); process.exit(1); }
  const [header, ...rows] = parseCsv(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  const col = (n: string) => header.map((h) => h.trim().toLowerCase()).indexOf(n);
  const I = { sku: col("sku"), name: col("name"), price: col("price_rs"), compare: col("compare_price_rs"), stock: col("stock") };
  if (Object.values(I).some((i) => i < 0)) { console.error("CSV header must contain: sku, name, price_rs, compare_price_rs, stock"); process.exit(1); }

  await connectWithRetry();
  console.log(DRY_RUN ? "DRY RUN — nothing will be written\n" : "LIVE RUN\n");

  const products = await prisma.product.findMany({ where: { sku: { startsWith: "HG-" } }, select: { id: true, sku: true, name: true, price: true, comparePrice: true, stock: true } });
  const bySku = new Map(products.map((p) => [p.sku, p]));

  const updates: { id: number; sku: string; data: { name: string; price: number; comparePrice: number | null; stock: number } }[] = [];
  const bad: string[] = [];
  for (const r of rows) {
    const sku = (r[I.sku] ?? "").trim();
    const p = bySku.get(sku);
    if (!p) { bad.push(`${sku || "(blank)"}: SKU not found`); continue; }

    const name = (r[I.name] ?? "").trim();
    const priceRs = Number((r[I.price] ?? "").replace(/[₹,\s]/g, ""));
    const cmpRaw = (r[I.compare] ?? "").replace(/[₹,\s]/g, "");
    const cmpRs = cmpRaw === "" ? null : Number(cmpRaw);
    const stock = Number((r[I.stock] ?? "").trim());

    if (!name) { bad.push(`${sku}: name is empty`); continue; }
    if (!Number.isFinite(priceRs) || priceRs <= 0) { bad.push(`${sku}: price must be a positive number`); continue; }
    if (cmpRs !== null && (!Number.isFinite(cmpRs) || cmpRs <= priceRs)) { bad.push(`${sku}: compare price must be higher than price (or blank)`); continue; }
    if (!Number.isInteger(stock) || stock < 0) { bad.push(`${sku}: stock must be a whole number >= 0`); continue; }

    const data = { name, price: Math.round(priceRs * 100), comparePrice: cmpRs === null ? null : Math.round(cmpRs * 100), stock };
    if (data.name !== p.name || data.price !== p.price || data.comparePrice !== p.comparePrice || data.stock !== p.stock) {
      updates.push({ id: p.id, sku, data });
    }
  }

  console.log(`${rows.length} rows read, ${updates.length} changed, ${bad.length} problems`);
  updates.slice(0, 15).forEach((u) => console.log(`  ${u.sku}  ${u.data.name}  Rs.${u.data.price / 100}${u.data.comparePrice ? ` (was Rs.${u.data.comparePrice / 100})` : ""}  stock ${u.data.stock}`));
  if (updates.length > 15) console.log(`  ... and ${updates.length - 15} more`);
  if (bad.length) { console.log("\nSkipped:"); bad.forEach((b) => console.log("  " + b)); }

  if (!DRY_RUN && updates.length) {
    const backup = `backup-products-${new Date().toISOString().slice(0, 10)}.json`;
    fs.writeFileSync(path.join(process.cwd(), backup), JSON.stringify(products, null, 2));
    for (const u of updates) await prisma.product.update({ where: { id: u.id }, data: u.data });
    console.log(`\nUpdated ${updates.length} products (backup: ${backup})`);
  }
  if (DRY_RUN) console.log("\nDry run done. Remove DRY_RUN and run again to apply.");
}

run().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
