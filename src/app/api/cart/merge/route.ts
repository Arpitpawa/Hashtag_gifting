import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getSignedGuestCartId, clearGuestCartCookie } from "@/lib/cartAuth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { guestCartId } = await req.json();
    if (!guestCartId) {
      return NextResponse.json({ success: true, message: "No guest cart to merge" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only a guest cart the caller can prove is theirs (signed cookie) and
    // that isn't a logged-in user's cart may be merged.
    if (Number(guestCartId) !== (await getSignedGuestCartId())) {
      return NextResponse.json({ success: true, message: "No guest cart to merge" });
    }

    const guestCart = await prisma.cart.findFirst({
      where: { id: Number(guestCartId), userId: null },
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
          variantId: guestItem.variantId,
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
            variantId:     guestItem.variantId,
            quantity:      guestItem.quantity,
            customization: guestItem.customization === null ? Prisma.JsonNull : guestItem.customization,
          },
        });
      }
    }

    // Delete guest cart
    await prisma.cart.delete({ where: { id: guestCart.id } });
    await clearGuestCartCookie();

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