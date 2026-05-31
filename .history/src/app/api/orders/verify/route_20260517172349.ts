import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { orderConfirmedTemplate } from "@/lib/emailTemplates";

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

    // ── VERIFY SIGNATURE ──
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Payment failed — update DB
      await prisma.order.update({
        where: { id: Number(orderId) },
        data:  { paymentStatus: "FAILED" },
      });

      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // ── SIGNATURE VALID — UPDATE ORDER ──
    const order = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        paymentStatus:     "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      include: {
        user:  true,
        items: { include: { product: true } },
        address: true,
      },
    });

    // ── SEND CONFIRMATION EMAIL ──
    const emailTo      = order.user?.email;
    const addressSnap  = order.addressSnapshot as any;
    const displayAddr  = addressSnap
      ? `${addressSnap.street}, ${addressSnap.city}`
      : "Jaipur";

    if (emailTo) {
      await sendEmail({
        to:      emailTo,
        subject: `Payment confirmed #${order.id} — Hashtag Gifting`,
        html:    orderConfirmedTemplate(
          addressSnap?.name || order.user?.name || "Customer",
          order.id,
          order.items.map((i) => ({
            name:     i.product.name,
            quantity: i.quantity,
            price:    i.price,
          })),
          order.totalAmount,
          displayAddr
        ),
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });

  } catch (err: any) {
    console.error("ORDER VERIFY ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Verification failed" },
      { status: 500 }
    );
  }
}