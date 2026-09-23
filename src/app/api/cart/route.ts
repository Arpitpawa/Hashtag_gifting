import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import type { NextRequest } from "next/server";
import { getSignedGuestCartId, setGuestCartCookie } from "@/lib/cartAuth";

// ── HELPER: get or create cart ──
const CART_ITEM_INCLUDE = { product: true, variant: true };

async function getOrCreateCart(userId?: number, guestCartId?: number) {
  // Logged in user — find their cart
  if (userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: CART_ITEM_INCLUDE } },
    });

    // Merge guest cart if exists
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: CART_ITEM_INCLUDE } },
      });
    }

    return cart;
  }

  // Guest — only trust a cartId the caller can prove (signed cookie)
  if (guestCartId && guestCartId === (await getSignedGuestCartId())) {
    const cart = await prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { items: { include: CART_ITEM_INCLUDE } },
    });
    if (cart && !cart.userId) return cart; // only return if still guest cart
  }

  // Create new guest cart
  return prisma.cart.create({
    data: {},
    include: { items: { include: CART_ITEM_INCLUDE } },
  });
}

// ── FORMAT CART RESPONSE ──
function formatCart(cart: any) {
  const items = cart.items.map((item: any) => {
    // A selected variant's own price governs this item once one exists —
    // previously this always used the base product's price even when a
    // priced variant was selected, so the cart subtotal (and everything
    // downstream: coupon eligibility, delivery threshold, checkout total)
    // silently ignored variant pricing entirely.
    const effectivePrice = item.variant?.price ?? item.product.price;

    return {
      id:            item.id,
      productId:     item.productId,
      variantId:     item.variantId,
      quantity:      item.quantity,
      customization: item.customization,
      product: {
        id:           item.product.id,
        name:         item.product.name,
        slug:         item.product.slug,
        price:        item.product.price,        // paise
        comparePrice: item.product.comparePrice, // paise
        images:       item.product.images,
        stock:        item.product.stock,
        customizable: item.product.customizable,
      },
      variant: item.variant
        ? {
            id:           item.variant.id,
            optionName:   item.variant.optionName,
            groupName:    item.variant.groupName,
            price:        item.variant.price,
            comparePrice: item.variant.comparePrice,
            stock:        item.variant.stock,
          }
        : null,
      // subtotal in paise — variant-price-aware
      subtotal: effectivePrice * item.quantity,
    };
  });

  const subtotal  = items.reduce((sum: number, i: any) => sum + i.subtotal, 0);
  const itemCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

  return {
    id:        cart.id,
    items,
    subtotal,  // paise
    itemCount,
  };
}

// ── GET CART ──
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const guestCartId = searchParams.get("cartId");

    const user = session?.user?.id
      ? await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
      : null;

    const cart = await getOrCreateCart(
      user?.id,
      guestCartId ? Number(guestCartId) : undefined
    );

    if (!user) await setGuestCartCookie(cart.id);

    return NextResponse.json({ success: true, cart: formatCart(cart), cartId: cart.id });
  } catch (err) {
    console.error("CART GET ERROR:", err);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}