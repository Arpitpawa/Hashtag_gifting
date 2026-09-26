import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { sendEmail } from "@/lib/email";
import { orderShippedTemplate } from "@/lib/emailTemplates";
import {
  sendWhatsAppMessage,
  buildOrderShippedMessage,
  buildOrderOutForDeliveryMessage,
  buildOrderDeliveredMessage,
  buildOrderCancelledMessage,
} from "@/lib/whatsapp";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where:   { id: Number(id) },
      include: {
        user:  true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body   = await req.json();
    const data: any = {};

    const existingOrder = await prisma.order.findUnique({
      where:  { id: Number(id) },
      select: { paymentMethod: true, paymentStatus: true },
    });
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const DELIVERY = ["PROCESSING", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
    const PAYMENT  = ["PENDING", "PAID", "FAILED", "REFUNDED"];
    if (body.deliveryStatus && !DELIVERY.includes(body.deliveryStatus)) {
      return NextResponse.json({ error: "Invalid delivery status" }, { status: 400 });
    }
    if (body.paymentStatus && !PAYMENT.includes(body.paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    if (body.deliveryStatus) {
      data.deliveryStatus = body.deliveryStatus;
      if (body.deliveryStatus === "SHIPPED")   data.shippedAt   = new Date();
      if (body.deliveryStatus === "DELIVERED") data.deliveredAt = new Date();
    }

    if (body.paymentStatus)         data.paymentStatus = body.paymentStatus;
    if (body.trackingId !== undefined) data.trackingId = body.trackingId;
    if (body.notes      !== undefined) data.notes      = body.notes;

    // COD orders never get an online-payment event to flip paymentStatus to
    // PAID — cash is collected AT delivery, so marking DELIVERED is the
    // real-world moment that actually happens. Without this, a COD order's
    // paymentStatus sits at PENDING forever unless separately remembered,
    // which silently blocks that customer from ever leaving a review
    // (reviews require paymentStatus === "PAID" — see /api/reviews).
    if (
      body.deliveryStatus === "DELIVERED" &&
      existingOrder.paymentMethod === "cod" &&
      !body.paymentStatus &&                       // don't override an explicit choice made in this same request
      existingOrder.paymentStatus !== "PAID" &&
      existingOrder.paymentStatus !== "REFUNDED"
    ) {
      data.paymentStatus = "PAID";
    }

    const updated = await prisma.order.update({
      where:   { id: Number(id) },
      data,
      include: { user: true },
    });

    // Shared across the email + WhatsApp blocks below, so the Json ->
    // typed-access cast only happens once.
    const addressSnap = updated.addressSnapshot as any;

    // Send shipped email (non-critical — the status/tracking update above has
    // already been saved by this point, so an email hiccup here must never
    // make this whole request look like it failed. Without this guard, a
    // failed send would fall into the outer catch below and report "Failed
    // to update order" even though the shipment status was in fact saved —
    // same class of bug as the payment-confirmation email in orders/verify.)
    if (
      body.deliveryStatus === "SHIPPED" &&
      updated.user?.email &&
      body.trackingId
    ) {
      try {
        await sendEmail({
          to:      updated.user.email,
          subject: `Your order #${updated.id} has been shipped! — Hashtag Gifting`,
          html:    orderShippedTemplate(
            addressSnap?.name || updated.user.name || "Customer",
            updated.id,
            body.trackingId
          ),
        });
      } catch (emailErr) {
        console.warn("Shipped email failed (non-critical):", emailErr);
      }
    }

    // Send status-update WhatsApp messages (non-critical — the status
    // change above is already saved regardless of whether this succeeds).
    // Same "every ecom brand does this" lifecycle emails don't cover today
    // (only SHIPPED gets an email currently) — WhatsApp fills the rest:
    // OUT_FOR_DELIVERY, DELIVERED and CANCELLED never sent anything before.
    if (body.deliveryStatus) {
      const phone       = addressSnap?.phone;
      const customerName = addressSnap?.name || updated.user?.name || "Customer";
      const orderUrl    = `${process.env.NEXTAUTH_URL || ""}/order/${updated.id}`;

      if (phone) {
        try {
          let message: string | null = null;
          if (body.deliveryStatus === "SHIPPED" && body.trackingId) {
            message = buildOrderShippedMessage({ customerName, orderId: updated.id, trackingId: body.trackingId, orderUrl });
          } else if (body.deliveryStatus === "OUT_FOR_DELIVERY") {
            message = buildOrderOutForDeliveryMessage({ customerName, orderId: updated.id, orderUrl });
          } else if (body.deliveryStatus === "DELIVERED") {
            message = buildOrderDeliveredMessage({ customerName, orderId: updated.id, orderUrl });
          } else if (body.deliveryStatus === "CANCELLED") {
            message = buildOrderCancelledMessage({ customerName, orderId: updated.id, orderUrl });
          }
          if (message) await sendWhatsAppMessage({ to: phone, message });
        } catch (waErr) {
          console.warn("Order status WhatsApp failed (non-critical):", waErr);
        }
      }
    }

    return NextResponse.json({ success: true, order: updated });

  } catch (err) {
    console.error("ADMIN ORDER UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}