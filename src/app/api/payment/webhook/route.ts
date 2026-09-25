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

  const sigA = Buffer.from(razorpaySignature);
  const sigB = Buffer.from(expectedSignature);
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
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

        // Paid amount must match what we charged — never trust "captured" alone.
        if (typeof payment.amount === "number" && payment.amount !== order.totalAmount) {
          console.error(`WEBHOOK: AMOUNT MISMATCH order #${order.id}: expected ${order.totalAmount}, got ${payment.amount} — NOT marking PAID`);
          break;
        }

        // Atomic claim: only the first of (verify route, webhook) flips it.
        const claimed = await prisma.order.updateMany({
          where: { id: order.id, paymentStatus: { not: "PAID" } },
          data: {
            paymentStatus:     "PAID",
            razorpayPaymentId: paymentId,
          },
        });
        if (claimed.count === 0) break;

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
              order.items.map((i: any) => ({
                name:     i.product.name,
                quantity: i.quantity,
                price:    i.price,
              })),
              order.totalAmount,
              addressSnap
                ? `${addressSnap.street}, ${addressSnap.city}`
                : "Jaipur",
              order.paymentMethod,
              order.createdAt,
              order.giftNote
            ),
          });
        }
        break;
      }

      // ── PAYMENT FAILED ────────────────────────────────────────────────────
      case "payment.failed": {
        // A failed ATTEMPT is not a failed ORDER: Razorpay lets the customer
        // retry on the same order, and a later payment.captured would then
        // mark it PAID. Restoring stock here caused overselling (stock came
        // back, then the retry succeeded without re-taking it). Unpaid orders
        // are cleaned up by the abandoned-order job instead — just log this.
        const payment = event.payload.payment.entity;
        console.log(`WEBHOOK: payment attempt failed for razorpay order ${payment.order_id} (${payment.error_description || "no reason"})`);
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

        if (typeof payment?.amount === "number" && payment.amount !== order.totalAmount) {
          console.error(`WEBHOOK: AMOUNT MISMATCH order #${order.id} (order.paid): expected ${order.totalAmount}, got ${payment.amount}`);
          break;
        }

        await prisma.order.updateMany({
          where: { id: order.id, paymentStatus: { not: "PAID" } },
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