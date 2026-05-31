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

    const { guestCartId } = await req.json();
    if (!guestCartId) {
      return NextResponse.json({ success: true, message: "No guest cart to merge" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get guest cart items
    const guestCart = await prisma.cart.findUnique({
      where: { id: Number(guestCartId) },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return NextResponse.json({ success: true, message: "Guest cart empty" });
    }

    // Find or create user cart
    let userCart = await prisma.cart.findFirst({ where: { userId: user.id } });
    if (!userCart) {
      userCart = await prisma.cart.create({ data: { userId: user.id } });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId:    userCart.id,
          productId: guestItem.productId,
        },
      });

      if (existingItem && !guestItem.customization) {
        // Combine quantities for non-customized items
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data:  { quantity: { increment: guestItem.quantity } },
        });
      } else {
        // Add as new item
        await prisma.cartItem.create({
          data: {
            cartId:        userCart.id,
            productId:     guestItem.productId,
            quantity:      guestItem.quantity,
            customization: guestItem.customization,
          },
        });
      }
    }

    // Delete guest cart
    await prisma.cart.delete({ where: { id: Number(guestCartId) } });

    return NextResponse.json({
      success: true,
      cartId:  userCart.id,
      message: "Cart merged successfully",
    });

  } catch (err) {
    console.error("CART MERGE ERROR:", err);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}