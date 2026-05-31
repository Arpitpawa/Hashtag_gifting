import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { productId, quantity = 1, customization, cartId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: Number(productId), status: "ACTIVE" },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stock < Number(quantity)) {
      return NextResponse.json(
        { error: `Only ${product.stock} items in stock` },
        { status: 400 }
      );
    }

    // Get user if logged in
    const user = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    // Find or create cart
    let cart;

    if (user) {
      // Logged in — use user's cart
      cart = await prisma.cart.findFirst({ where: { userId: user.id } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: user.id } });
      }
    } else if (cartId) {
      // Guest with existing cart
      cart = await prisma.cart.findUnique({ where: { id: Number(cartId) } });
    }

    if (!cart) {
      // New guest cart
      cart = await prisma.cart.create({ data: {} });
    }

    // Check if same product + same customization already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId:    cart.id,
        productId: Number(productId),
        // For customizable products, treat each customization as unique
        ...(product.customizable ? {} : {}),
      },
    });

    if (existingItem && !product.customizable) {
      // Update quantity for non-customizable products
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: Number(quantity) } },
      });
    } else {
      // Always add new item for customizable products
      await prisma.cartItem.create({
        data: {
          cartId:        cart.id,
          productId:     Number(productId),
          quantity:      Number(quantity),
          customization: customization || null,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true,
                price: true, comparePrice: true,
                images: true, stock: true, customizable: true,
              },
            },
          },
        },
      },
    });

    const itemCount = updatedCart!.items.reduce((sum, i) => sum + i.quantity, 0);

    return NextResponse.json({
      success:   true,
      cartId:    cart.id,
      itemCount,
      message:   "Added to cart",
    });

  } catch (err) {
    console.error("CART ADD ERROR:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}