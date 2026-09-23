import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { sendEmail } from "@/lib/email";
import { orderShippedTemplate } from "@/lib/emailTemplates";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// GET single order
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where:   { id: Number(params.id) },
    include: {
      user:  true,
      items: { include: { product: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}

// PATCH update order status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const id   = Number(params.id);
    const data: any = {};

    if (body.deliveryStatus) {
      data.deliveryStatus = body.deliveryStatus;
      if (body.deliveryStatus === "SHIPPED")   data.shippedAt   = new Date();
      if (body.deliveryStatus === "DELIVERED") data.deliveredAt = new Date();
    }

    if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
    if (body.trackingId !== undefined) data.trackingId = body.trackingId;
    if (body.notes !== undefined) data.notes = body.notes;

    const updated = await prisma.order.update({
      where:   { id },
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