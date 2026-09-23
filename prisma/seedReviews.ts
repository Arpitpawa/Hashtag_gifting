/**
 * seedReviews.ts
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seedReviews.ts
 *
 * Adds a handful of realistic, APPROVED sample reviews to every ACTIVE product
 * that currently has fewer than 3 reviews — purely so you can see how the
 * reviews section (star breakdown + review cards) looks on the product page.
 * Safe to run more than once: products that already have 3+ reviews are skipped.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// A pool of realistic sample reviews. We'll pick 4-5 per product, shuffled,
// and stagger their createdAt dates so they don't all show as "today".
const SAMPLE_REVIEWS: { name: string; rating: number; comment: string }[] = [
  { name: "Priya Sharma",     rating: 5, comment: "Absolutely loved it! The personalisation came out exactly how I imagined and the packaging was so pretty. Will definitely order again for my next gift." },
  { name: "Rahul Verma",      rating: 5, comment: "Ordered this for my mom's birthday and she was so happy. Quality is great and delivery was faster than expected." },
  { name: "Ananya Iyer",      rating: 4, comment: "Really nice product, exactly like the pictures. Only reason for 4 stars is the delivery took a day longer than promised, but the product itself is lovely." },
  { name: "Karan Mehta",      rating: 5, comment: "This is my second order from Hashtag Gifting and both times the quality has been top notch. Highly recommend for personalised gifts." },
  { name: "Sneha Reddy",      rating: 4, comment: "Beautiful finishing and the name printing was crisp and clear. Packaging could be a little sturdier but overall very happy with the purchase." },
  { name: "Arjun Nair",       rating: 5, comment: "Got this customised for my friend's anniversary and he loved it! Great value for the price and the customer support team was very responsive on WhatsApp." },
  { name: "Divya Kapoor",     rating: 3, comment: "Product is nice but colour was slightly different from what was shown online. Still a decent gift overall." },
  { name: "Vikram Singh",     rating: 5, comment: "Super impressed with the live preview feature — what you see is exactly what you get. Ordered three of these for Diwali gifting." },
  { name: "Meera Pillai",     rating: 4, comment: "Lovely quality and quick dispatch. Would have given 5 stars but the box had a small dent on arrival, product itself was fine though." },
  { name: "Aditya Rao",       rating: 5, comment: "Perfect gift for my wife's birthday, she was so surprised! The font options for personalisation are a really nice touch." },
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, _count: { select: { reviews: true } } },
  });

  if (products.length === 0) {
    console.log("No active products found — add a product first, then re-run this script.");
    return;
  }

  let totalAdded = 0;

  for (const product of products) {
    if (product._count.reviews >= 3) {
      console.log(`Skipping "${product.name}" — already has ${product._count.reviews} reviews.`);
      continue;
    }

    const picks = pickRandom(SAMPLE_REVIEWS, 4 + Math.floor(Math.random() * 2)); // 4–5 reviews
    const spread = [2, 6, 11, 18, 27]; // days ago, so they look organic

    await prisma.review.createMany({
      data: picks.map((r, i) => ({
        productId: product.id,
        name:      r.name,
        rating:    r.rating,
        comment:   r.comment,
        images:    [],
        status:    "APPROVED" as const,
        createdAt: daysAgo(spread[i] ?? i * 5),
      })),
    });

    totalAdded += picks.length;
    console.log(`Added ${picks.length} reviews to "${product.name}".`);
  }

  console.log(`\nDone. ${totalAdded} sample reviews added across ${products.length} product(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
