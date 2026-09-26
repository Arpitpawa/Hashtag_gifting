import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { buildAbandonedCartMessage, sendWhatsAppMessage } from "@/lib/whatsapp";

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
        include: { product: { select: { name: true, images: true, price: true } }, variant: { select: { price: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let alertsCreated = 0;
  let skippedNoPhone = 0;
  let skippedTooRecent = 0;
  let skippedAlreadyAlerted = 0;

  for (const cart of candidateCarts) {
    const lastActivity = cart.items[0]?.createdAt ?? cart.createdAt;
    if (lastActivity > thresholdDate) { skippedTooRecent++; continue; }

    if (!cart.user?.phone) { skippedNoPhone++; continue; }

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
      cartUrl,
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

    const result = await sendWhatsAppMessage({ to: cart.user.phone, message: messageText });
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
  });
}
