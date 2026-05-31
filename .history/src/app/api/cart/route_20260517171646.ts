import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import type { NextRequest } from "next/server";

// ── HELPER: get or create cart ──
async function getOrCreateCart(userId?: number, guestCartId?: number) {
  // Logged in user — find their cart
  if (userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    // Merge guest cart if exists
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  }

  // Guest — find by cartId
  if (guestCartId) {
    const cart = await prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { items: { include: { product: true } } },
    });
    if (cart && !cart.userId) return cart; // only return if still guest cart
  }

  // Create new guest cart
  return prisma.cart.create({
    data: {},
    include: { items: { include: { product: true } } },
  });
}

// ── FORMAT CART RESPONSE ──
function formatCart(cart: any) {
  const items = cart.items.map((item: any) => ({
    id:            item.id,
    productId:     item.productId,
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
    // subtotal in paise
    subtotal: item.product.price * item.quantity,
  }));

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

    const user = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    const cart = await getOrCreateCart(
      user?.id,
      guestCartId ? Number(guestCartId) : undefined
    );

    return NextResponse.json({ success: true, cart: formatCart(cart), cartId: cart.id });
  } catch (err) {
    console.error("CART GET ERROR:", err);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}