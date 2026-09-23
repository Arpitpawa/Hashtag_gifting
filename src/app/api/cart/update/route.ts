import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ownsCart } from "@/lib/cartAuth";

export async function PUT(req: Request) {
  try {
    const { itemId, quantity } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: Number(itemId) },
      include: { product: true, variant: true, cart: { select: { id: true, userId: true } } },
    });

    // Same response whether the item is missing or belongs to someone else.
    if (!item || !(await ownsCart(item.cart))) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty > 50) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return NextResponse.json({ success: true, removed: true });
    }

    // A selected variant's stock governs, not the parent product's.
    const available = item.variant ? item.variant.stock : item.product.stock;
    if (available < qty) {
      return NextResponse.json({ error: `Only ${available} items in stock` }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data:  { quantity: qty },
    });

    return NextResponse.json({ success: true, item: updated });

  } catch (err) {
    console.error("CART UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
