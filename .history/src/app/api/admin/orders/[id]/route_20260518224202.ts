import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { sendEmail } from "@/lib/email";
import { orderShippedTemplate } from "@/lib/emailTemplates";

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

    if (body.deliveryStatus) {
      data.deliveryStatus = body.deliveryStatus;
      if (body.deliveryStatus === "SHIPPED")   data.shippedAt   = new Date();
      if (body.deliveryStatus === "DELIVERED") data.deliveredAt = new Date();
    }

    if (body.paymentStatus)         data.paymentStatus = body.paymentStatus;
    if (body.trackingId !== undefined) data.trackingId = body.trackingId;
    if (body.notes      !== undefined) data.notes      = body.notes;

    const updated = await prisma.order.update({
      where:   { id: Number(id) },
      data,
      include: { user: true },
    });

    // Send shipped email
    if (
      body.deliveryStatus === "SHIPPED" &&
      updated.user?.email &&
      body.trackingId
    ) {
      const addressSnap = updated.addressSnapshot as any;
      await sendEmail({
        to:      updated.user.email,
        subject: `Your order #${updated.id} has been shipped! — Hashtag Gifting`,
        html:    orderShippedTemplate(
          addressSnap?.name || updated.user.name || "Customer",
          updated.id,
          body.trackingId
        ),
      });
    }

    return NextResponse.json({ success: true, order: updated });

  } catch (err) {
    console.error("ADMIN ORDER UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}