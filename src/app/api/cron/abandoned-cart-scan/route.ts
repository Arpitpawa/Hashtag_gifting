import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { buildAbandonedCartMessage, sendWhatsAppMessage, isOptedOutOfPromotions } from "@/lib/whatsapp";

/**
 * Finds carts that have sat untouched past ABANDONED_CART_DELAY_MINUTES,
 * belong to a logged-in user with a phone number on file, and haven't
 * already been alerted on for this same batch of items — then logs an
 * AbandonedCartAlert (message text + a free wa.me click-to-chat link is
 * shown on /admin/abandoned-carts) and attempts sendWhatsAppMessage(),
 * which is a safe no-op until a WhatsApp API provider is configured (see
 * src/lib/whatsapp.ts).
 *
 * Guest carts (no userId) are skipped entirely — there's no phone number to
 * reach until checkout, at which point the cart is already cleared (see
 * orders/create/route.ts), so this only ever catches "added to cart, never
 * even started checkout."
 *
 * A phone that's opted out (WhatsAppOptOut — see src/lib/whatsapp.ts) never
 * even gets an alert row created, so it can't show up on the Abandoned
 * Carts admin page to be manually messaged either — not just a skipped
 * automatic send.
 *
 * Run every ~15-30 min from the same cron job / uptime service already
 * pinging /api/cron/expire-orders:
 *
 *   GET https://<domain>/api/cron/abandoned-cart-scan
 *   Header: Authorization: Bearer <CRON_SECRET>
 */
const DELAY_MINUTES = Number(process.env.ABANDONED_CART_DELAY_MINUTES) || 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given  = req.headers.get("authorization") || "";
  const want   = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  if (!secret || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thresholdDate = new Date(Date.now() - DELAY_MINUTES * 60_000);

  // Optional discount hook (see src/lib/whatsapp.ts) — looked up once per
  // scan run, not per cart. Only used if it's genuinely still valid, same
  // rules the real checkout coupon check applies.
  let activeCoupon: { code: string; type: string; value: number } | null = null;
  if (process.env.ABANDONED_CART_COUPON_CODE) {
    const c = await prisma.coupon.findUnique({ where: { code: process.env.ABANDONED_CART_COUPON_CODE } });
    if (c && c.isActive && (!c.expiresAt || c.expiresAt > new Date()) && (!c.usageLimit || c.usedCount < c.usageLimit)) {
      activeCoupon = { code: c.code, type: c.type, value: c.value };
    }
  }

  // Cart.updatedAt isn't touched by cart/add or cart/update today, so the
  // real "last activity" signal is the newest CartItem in the cart, not the
  // Cart row itself — hence items ordered newest-first below.
  const candidateCarts = await prisma.cart.findMany({
    where: {
      userId: { not: null },
      items:  { some: {} },
    },
    include: {
      user:  { select: { id: true, name: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, images: true, price: true, customizable: true, fastDelivery: true } },
          variant: { select: { price: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let alertsCreated = 0;
  let skippedNoPhone = 0;
  let skippedTooRecent = 0;
  let skippedAlreadyAlerted = 0;
  let skippedOptedOut = 0;

  for (const cart of candidateCarts) {
    const lastActivity = cart.items[0]?.createdAt ?? cart.createdAt;
    if (lastActivity > thresholdDate) { skippedTooRecent++; continue; }

    if (!cart.user?.phone) { skippedNoPhone++; continue; }

    // A customer who replied STOP (or an admin who manually flagged them)
    // never even gets an alert row created — not just a skipped send. This
    // is what actually keeps them off the Abandoned Carts admin page too,
    // so nobody accidentally messages them by hand via the wa.me link either.
    if (await isOptedOutOfPromotions(cart.user.phone)) { skippedOptedOut++; continue; }

    // Skip if we've already alerted for this exact batch of items (no new
    // item added since) — re-abandoning after adding something new will
    // naturally trigger a fresh alert, since lastActivity moves forward.
    const existingAlert = await prisma.abandonedCartAlert.findFirst({
      where: { cartId: cart.id, createdAt: { gte: lastActivity } },
      select: { id: true },
    });
    if (existingAlert) { skippedAlreadyAlerted++; continue; }

    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal  = cart.items.reduce((sum, i) => {
      const price = i.variant?.price ?? i.product.price;
      return sum + price * i.quantity;
    }, 0);
    const firstItem = cart.items[0];
    const cartUrl = `${process.env.NEXTAUTH_URL || ""}/cart`;

    const messageText = buildAbandonedCartMessage({
      customerName:     cart.user.name || "",
      itemCount,
      firstProductName: firstItem.product.name,
      customizable:     firstItem.product.customizable,
      fastDelivery:     firstItem.product.fastDelivery,
      cartUrl,
      coupon:           activeCoupon,
    });

    const alert = await prisma.abandonedCartAlert.create({
      data: {
        cartId:            cart.id,
        userId:            cart.user.id,
        phone:             cart.user.phone,
        itemCount,
        subtotal,
        firstProductName:  firstItem.product.name,
        firstProductImage: firstItem.product.images?.[0] || null,
        messageText,
      },
    });
    alertsCreated++;

    const result = await sendWhatsAppMessage({ to: cart.user.phone, message: messageText, category: "promotional" });
    if (result.sent) {
      await prisma.abandonedCartAlert.update({
        where: { id: alert.id },
        data:  { status: "SENT", sentAt: new Date() },
      });
    }
  }

  return NextResponse.json({
    checked: candidateCarts.length,
    alertsCreated,
    skippedNoPhone,
    skippedTooRecent,
    skippedAlreadyAlerted,
    skippedOptedOut,
  });
}
