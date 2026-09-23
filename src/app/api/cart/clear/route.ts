import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ownsCart } from "@/lib/cartAuth";

export async function DELETE(req: Request) {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      return NextResponse.json({ error: "cartId is required" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where:  { id: Number(cartId) },
      select: { id: true, userId: true },
    });

    if (!cart || !(await ownsCart(cart))) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json({ success: true, message: "Cart cleared" });

  } catch (err) {
    console.error("CART CLEAR ERROR:", err);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
