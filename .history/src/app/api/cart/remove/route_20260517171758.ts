import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    await prisma.cartItem.delete({ where: { id: Number(itemId) } });

    return NextResponse.json({ success: true, message: "Item removed" });

  } catch (err) {
    console.error("CART REMOVE ERROR:", err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}