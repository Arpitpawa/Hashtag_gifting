import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const { itemId, quantity } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    if (Number(quantity) <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({ where: { id: Number(itemId) } });
      return NextResponse.json({ success: true, removed: true });
    }

    // Check stock
    const item = await prisma.cartItem.findUnique({
      where: { id: Number(itemId) },
      include: { product: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    if (item.product.stock < Number(quantity)) {
      return NextResponse.json(
        { error: `Only ${item.product.stock} items in stock` },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: Number(itemId) },
      data:  { quantity: Number(quantity) },
    });

    return NextResponse.json({ success: true, item: updated });

  } catch (err) {
    console.error("CART UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}