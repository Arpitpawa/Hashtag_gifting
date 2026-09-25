import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { orderConfirmedTemplate } from "@/lib/emailTemplates";
import { notifyAdminNewOrder } from "@/lib/adminNotify";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // ── FETCH THE ORDER FIRST ──
    // Everything below depends on this existing and genuinely matching the
    // payment being verified — nothing gets written before that's confirmed.
    const existing = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      select: { id: true, razorpayOrderId: true, paymentStatus: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already processed — return success without re-sending emails or
    // re-writing fields. Handles double-calls (e.g. a retry after a network
    // hiccup) safely.
    if (existing.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, orderId: existing.id });
    }

    // ── THE CRITICAL CHECK ──
    // A valid signature only proves razorpay_order_id/razorpay_payment_id are
    // a genuine pair from Razorpay — it says nothing about which internal
    // order they belong to. Without this check, a real (but tiny) payment's
    // signature could be replayed against any other orderId to mark it PAID
    // for free. razorpayOrderId was set once, server-side, when this specific
    // order was created (see orders/create/route.ts) — it's the only trusted
    // link between a Razorpay payment and an internal order.
    if (existing.razorpayOrderId !== razorpay_order_id) {
      console.warn(`PAYMENT VERIFY MISMATCH: order ${orderId} has razorpayOrderId ${existing.razorpayOrderId}, but request claims ${razorpay_order_id}`);
      return NextResponse.json(
        { success: false, error: "This payment does not match this order" },
        { status: 400 }
      );
    }

    // ── VERIFY SIGNATURE ──
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is not set");
      return NextResponse.json({ error: "Payments are not configured" }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const given    = Buffer.from(String(razorpay_signature));
    const expected = Buffer.from(generatedSignature);
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
      // Deliberately NOT writing paymentStatus=FAILED here: this route can be
      // called by anyone, and a failed/garbage signature shouldn't be able to
      // flip a real pending order. Razorpay's webhook is what reports real
      // payment failures.
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // ── SIGNATURE VALID AND CONFIRMED TO BELONG TO THIS ORDER — UPDATE ──
    // Atomic: only the first caller (this route or the webhook) flips it to
    // PAID, so the confirmation email can never be sent twice.
    const claimed = await prisma.order.updateMany({
      where: { id: existing.id, paymentStatus: { not: "PAID" } },
      data: {
        paymentStatus:     "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    if (claimed.count === 0) {
      return NextResponse.json({ success: true, orderId: existing.id });
    }

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: existing.id },
      include: {
        user:  true,
        items: { include: { product: true } },
        address: true,
      },
    });

    // ── SEND CONFIRMATION EMAIL (non-critical) ──
    // Payment is already verified and the order already marked PAID above —
    // an email hiccup here must never turn into a "verification failed"
    // response, since that would tell a customer who genuinely paid that
    // something went wrong and risk them trying to pay again.
    const emailTo      = order.user?.email;
    const addressSnap  = order.addressSnapshot as any;
    const displayAddr  = addressSnap
      ? `${addressSnap.street}, ${addressSnap.city}`
      : "Jaipur";

    if (emailTo) {
      try {
        await sendEmail({
          to:      emailTo,
          subject: `Payment confirmed #${order.id} — Hashtag Gifting`,
          html:    orderConfirmedTemplate(
            addressSnap?.name || order.user?.name || "Customer",
            order.id,
            order.items.map((i: any) => ({
              name:     i.product.name,
              quantity: i.quantity,
              price:    i.price,
            })),
            order.totalAmount,
            displayAddr,
            order.paymentMethod,
            order.createdAt,
            order.giftNote
          ),
        });
      } catch (emailErr) {
        console.warn("Payment confirmation email failed (non-critical):", emailErr);
      }
    }

    // ── NOTIFY ADMIN (non-critical) ──
    await notifyAdminNewOrder({
      orderId:       order.id,
      customerName:  addressSnap?.name || order.user?.name || "Customer",
      items:         order.items.map((i: any) => ({ name: i.product.name, quantity: i.quantity })),
      totalAmount:   order.totalAmount,
      paymentMethod: order.paymentMethod,
      giftNote:      order.giftNote,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });

  } catch (err: any) {
    console.error("ORDER VERIFY ERROR:", err);
    // Generic message — avoid leaking internal (DB/Razorpay SDK) error
    // details to the client on a payment endpoint.
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}