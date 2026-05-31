import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      return NextResponse.json({ error: "cartId is required" }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: Number(cartId) },
    });

    return NextResponse.json({ success: true, message: "Cart cleared" });

  } catch (err) {
    console.error("CART CLEAR ERROR:", err);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}