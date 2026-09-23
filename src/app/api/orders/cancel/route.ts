import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { orderId } = await req.json();
    const userId = Number(session.user.id);

    const order = await prisma.order.findUnique({
      where:   { id: Number(orderId) },
      include: { items: true },
    });

    // Same answer for "missing" and "someone else's" order.
    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.deliveryStatus !== "PROCESSING") {
      return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 });
    }

    // Money already taken online: cancelling here would keep the customer's
    // money with no refund. Send them to support so a refund is issued.
    if (order.paymentMethod === "online" && order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "This order is already paid. Please contact support to cancel it and get a refund." },
        { status: 400 }
      );
    }

    // Everything in one transaction, and the status flip is conditional so two
    // parallel cancel clicks can only restore stock / coupon once.
    const done = await prisma.$transaction(async (tx) => {
      const flipped = await tx.order.updateMany({
        where: { id: order.id, deliveryStatus: "PROCESSING" },
        data:  { deliveryStatus: "CANCELLED" },
      });
      if (flipped.count === 0) return false;

      for (const item of order.items) {
        const variantId = (item.variantInfo as any)?.variantId as number | undefined;
        if (variantId) {
          await tx.productVariant.update({
            where: { id: variantId },
            data:  { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data:  { stock: { increment: item.quantity } },
          });
        }
      }

      if (order.couponId) {
        await tx.coupon.updateMany({
          where: { id: order.couponId, usedCount: { gt: 0 } },
          data:  { usedCount: { decrement: 1 } },
        });
      }
      return true;
    });

    if (!done) {
      return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Order cancelled successfully" });

  } catch (err) {
    console.error("ORDER CANCEL ERROR:", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
