import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

/**
 * Cancels ONLINE orders that were never paid (customer closed the Razorpay
 * window) so their stock and coupon use come back. Run it every ~10 minutes
 * from a cron job / uptime service:
 *
 *   GET https://<domain>/api/cron/expire-orders
 *   Header: Authorization: Bearer <CRON_SECRET>
 *
 * Needs CRON_SECRET in .env. Orders older than 30 minutes with paymentStatus
 * PENDING are cancelled; a payment that lands later is still caught by the
 * Razorpay webhook's log line for manual refund.
 */
const EXPIRE_AFTER_MS = 30 * 60_000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given  = req.headers.get("authorization") || "";
  const want   = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  if (!secret || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stale = await prisma.order.findMany({
    where: {
      paymentMethod:  "online",
      paymentStatus:  "PENDING",
      deliveryStatus: "PROCESSING",
      createdAt:      { lt: new Date(Date.now() - EXPIRE_AFTER_MS) },
    },
    include: { items: true },
    take: 50,
  });

  let cancelled = 0;
  for (const order of stale) {
    try {
      const done = await prisma.$transaction(async (tx) => {
        const flipped = await tx.order.updateMany({
          where: { id: order.id, paymentStatus: "PENDING", deliveryStatus: "PROCESSING" },
          data:  { deliveryStatus: "CANCELLED", paymentStatus: "FAILED" },
        });
        if (flipped.count === 0) return false;

        for (const item of order.items) {
          const variantId = (item.variantInfo as any)?.variantId as number | undefined;
          if (variantId) {
            await tx.productVariant.update({ where: { id: variantId }, data: { stock: { increment: item.quantity } } });
          } else {
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          }
        }
        if (order.couponId) {
          await tx.coupon.updateMany({ where: { id: order.couponId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
        }
        return true;
      });
      if (done) cancelled++;
    } catch (err) {
      console.error(`EXPIRE ORDERS: order #${order.id} failed`, err);
    }
  }

  return NextResponse.json({ checked: stale.length, cancelled });
}
