import { NextResponse }  from "next/server";
import type { NextRequest } from "next/server";
import prisma             from "@/lib/prisma";
import crypto             from "crypto";
import { sendEmail }      from "@/lib/email";
import { orderConfirmedTemplate } from "@/lib/emailTemplates";

// ── Razorpay sends raw body — we MUST read it as text first ──────────────────
export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Could not read body" }, { status: 400 });
  }

  // ── 1. VERIFY WEBHOOK SIGNATURE ──────────────────────────────────────────
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("WEBHOOK: RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const razorpaySignature = req.headers.get("x-razorpay-signature") || "";

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    console.warn("WEBHOOK: Invalid signature — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── 2. PARSE EVENT ────────────────────────────────────────────────────────
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event;
  console.log(`WEBHOOK: received event → ${eventType}`);

  // ── 3. HANDLE EVENTS ──────────────────────────────────────────────────────
  try {
    switch (eventType) {

      // ── PAYMENT CAPTURED (primary success event) ──────────────────────────
      case "payment.captured": {
        const payment       = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;
        const paymentId     = payment.id;

        if (!razorpayOrderId) {
          console.warn("WEBHOOK: payment.captured — no order_id in payload");
          break;
        }

        // Find our order by Razorpay order ID
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
          include: {
            user:  { select: { id: true, email: true, name: true } },
            items: { include: { product: { select: { name: true } } } },
          },
        });

        if (!order) {
          console.warn(`WEBHOOK: No order found for razorpayOrderId=${razorpayOrderId}`);
          break;
        }

        // Idempotency — skip if already paid
        if (order.paymentStatus === "PAID") {
          console.log(`WEBHOOK: Order #${order.id} already marked PAID — skipping`);
          break;
        }

        // Update order to PAID
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus:     "PAID",
            razorpayPaymentId: paymentId,
          },
        });

        console.log(`WEBHOOK: Order #${order.id} marked PAID via webhook`);

        // Send confirmation email
        const addressSnap = order.addressSnapshot as any;
        if (order.user?.email) {
          await sendEmail({
            to:      order.user.email,
            subject: `Payment confirmed #${order.id} — Hashtag Gifting`,
            html:    orderConfirmedTemplate(
              addressSnap?.name || order.user.name || "Customer",
              order.id,
              order.items.map(i => ({
                name:     i.product.name,
                quantity: i.quantity,
                price:    i.price,
              })),
              order.totalAmount,
              addressSnap
                ? `${addressSnap.street}, ${addressSnap.city}`
                : "Jaipur",
            ),
          });
        }
        break;
      }

      // ── PAYMENT FAILED ────────────────────────────────────────────────────
      case "payment.failed": {
        const payment       = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        if (!razorpayOrderId) break;

        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
        });

        if (!order || order.paymentStatus === "PAID") break;

        // Mark as FAILED and restore stock
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data:  { paymentStatus: "FAILED" },
          });

          // Restore stock for all items
          const items = await tx.orderItem.findMany({
            where: { orderId: order.id },
            select: { productId: true, quantity: true },
          });

          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data:  { stock: { increment: item.quantity } },
            });
          }

          // Rollback coupon usage if any
          if (order.couponId) {
            await tx.coupon.update({
              where: { id: order.couponId },
              data:  { usedCount: { decrement: 1 } },
            });
          }
        });

        console.log(`WEBHOOK: Order #${order.id} marked FAILED — stock restored`);
        break;
      }

      // ── ORDER PAID (alternative success event) ────────────────────────────
      case "order.paid": {
        const rzpOrder      = event.payload.order.entity;
        const payment       = event.payload.payment?.entity;
        const razorpayOrderId = rzpOrder.id;
        const paymentId     = payment?.id;

        if (!razorpayOrderId) break;

        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
        });

        if (!order || order.paymentStatus === "PAID") break;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus:     "PAID",
            razorpayPaymentId: paymentId || null,
          },
        });

        console.log(`WEBHOOK: Order #${order.id} marked PAID via order.paid event`);
        break;
      }

      // ── REFUND PROCESSED ──────────────────────────────────────────────────
      case "refund.processed": {
        const refund        = event.payload.refund.entity;
        const paymentId     = refund.payment_id;

        const order = await prisma.order.findFirst({
          where: { razorpayPaymentId: paymentId },
        });

        if (!order) break;

        await prisma.order.update({
          where: { id: order.id },
          data:  { paymentStatus: "REFUNDED" as any },
        });

        console.log(`WEBHOOK: Order #${order.id} refund processed`);
        break;
      }

      default:
        // Log unhandled events for debugging but return 200
        console.log(`WEBHOOK: Unhandled event type → ${eventType}`);
    }

  } catch (err: any) {
    console.error(`WEBHOOK: Error handling ${eventType}:`, err);
    // Return 200 anyway — Razorpay retries on non-200, causing duplicate processing
    // We log the error and investigate separately
  }

  // Always return 200 to Razorpay to acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 });
}