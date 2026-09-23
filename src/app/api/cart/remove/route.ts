import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ownsCart } from "@/lib/cartAuth";

export async function DELETE(req: Request) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: Number(itemId) },
      include: { cart: { select: { id: true, userId: true } } },
    });

    if (!item || !(await ownsCart(item.cart))) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: item.id } });

    return NextResponse.json({ success: true, message: "Item removed" });

  } catch (err) {
    console.error("CART REMOVE ERROR:", err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
