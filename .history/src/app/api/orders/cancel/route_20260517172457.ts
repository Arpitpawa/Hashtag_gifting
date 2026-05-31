import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { orderId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only owner can cancel
    if (order.userId !== user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only PROCESSING orders can be cancelled
    if (order.deliveryStatus !== "PROCESSING") {
      return NextResponse.json(
        { error: "Order cannot be cancelled at this stage" },
        { status: 400 }
      );
    }

    // Cancel order
    await prisma.order.update({
      where: { id: order.id },
      data:  { deliveryStatus: "CANCELLED" },
    });

    // Restore stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { increment: item.quantity } },
      });
    }

    return NextResponse.json({ success: true, message: "Order cancelled successfully" });

  } catch (err) {
    console.error("ORDER CANCEL ERROR:", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}