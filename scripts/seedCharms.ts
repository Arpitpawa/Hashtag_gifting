/**
 * Replaces the charm library with the client's real charm photos
 * (public/charms/charm-<n>.jpg). Run it on any environment (local / production):
 *
 *   npm run seed:charms
 *
 * Existing charms with the same number are updated; old default charms (numbers
 * not in this list) are deleted. Orders keep the charm name/number they were
 * placed with, so nothing existing breaks.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const CHARMS: { number: number; name: string }[] = [
  { number: 1,  name: "Vintage Car" },
  { number: 2,  name: "Indian Flag" },
  { number: 3,  name: "CA" },
  { number: 4,  name: "Horse" },
  { number: 5,  name: "Fairy" },
  { number: 6,  name: "Bow" },
  { number: 7,  name: "Love Heart" },
  { number: 8,  name: "Moustache" },
  { number: 9,  name: "Advocate" },
  { number: 10, name: "Bike" },
  { number: 11, name: "Black Moustache" },
  { number: 12, name: "Camera" },
  { number: 13, name: "Doctor" },
  { number: 14, name: "Elephant" },
  { number: 15, name: "King" },
  { number: 16, name: "Ballerina" },
  { number: 17, name: "Mini Camera" },
  { number: 18, name: "Statue of Liberty" },
  { number: 19, name: "Beetle Car" },
  { number: 20, name: "Queen" },
  { number: 21, name: "Butterfly" },
  { number: 22, name: "Infinity Love" },
  { number: 23, name: "Plane" },
  { number: 24, name: "Love" },
  { number: 25, name: "Glasses" },
  { number: 26, name: "Gun" },
  { number: 27, name: "Bicycle" },
  { number: 28, name: "Mr & Mrs" },
];

async function main() {
  const keep = CHARMS.map((c) => c.number);
  const removed = await prisma.charm.deleteMany({ where: { number: { notIn: keep } } });
  for (const c of CHARMS) {
    const data = { name: c.name, image: `/charms/charm-${c.number}.jpg`, active: true };
    await prisma.charm.upsert({ where: { number: c.number }, update: data, create: { number: c.number, ...data } });
  }
  // Turn on the charm picker for wallets / passport covers / diary sets / combos
  // (SKU types below). Pens, pouches and toiletry bags stay without it.
  const types = ["01","02","03","04","08","09","10","11","12","13","14","16","17","18","19"];
  const flagged = await prisma.product.updateMany({
    where: { OR: types.map((t) => ({ sku: { startsWith: `HG-${t}-` } })) },
    data: { hasCharm: true },
  });
  console.log(`Charm picker enabled on ${flagged.count} products.`);
  console.log(`Charms saved: ${CHARMS.length} (removed ${removed.count} old ones).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
