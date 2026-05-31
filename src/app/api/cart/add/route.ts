import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { productId, quantity = 1, customization, cartId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // ── VALIDATE PRODUCT ──
    const product = await prisma.product.findUnique({
      where:  { id: Number(productId), status: "ACTIVE" },
      select: {
        id: true, name: true, stock: true,
        customizable: true, customizationFields: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found or unavailable" }, { status: 404 });
    }

    if (product.stock < Number(quantity)) {
      return NextResponse.json(
        {
          error: product.stock === 0
            ? `"${product.name}" is out of stock`
            : `Only ${product.stock} unit(s) of "${product.name}" available`,
        },
        { status: 400 }
      );
    }

    // ── VALIDATE CUSTOMIZATION IF PROVIDED ──
    if (customization && product.customizable) {
      const fields = product.customizationFields as any[] || [];

      for (const field of fields) {
        // Check by label (text fields) or by photo key (image fields)
        const val = field.type === "image"
          ? (customization[`photo_img_0`] || customization[`photo_${field.label}`] || Object.keys(customization).filter(k => k.startsWith("photo_")).map(k => customization[k])[0])
          : (customization[field.label] || customization[field.type]);
        if (field.required && (!val || val.toString().trim() === "")) {
          return NextResponse.json(
            { error: `"${field.label}" is required` },
            { status: 400 }
          );
        }
        if (val && field.maxLength && val.toString().length > field.maxLength) {
          return NextResponse.json(
            { error: `"${field.label}" exceeds maximum length of ${field.maxLength}` },
            { status: 400 }
          );
        }
      }
    }

    // ── GET OR CREATE CART ──
    const user = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    let cart;
    if (user) {
      cart = await prisma.cart.findFirst({ where: { userId: user.id } });
      if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } });
    } else if (cartId) {
      cart = await prisma.cart.findUnique({ where: { id: Number(cartId) } });
    }
    if (!cart) cart = await prisma.cart.create({ data: {} });

    // ── ADD OR UPDATE CART ITEM ──
    // For customizable products — always add new item (each customization is unique)
    // For regular products — merge quantities
    if (!product.customizable) {
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: Number(productId) },
      });

      if (existing) {
        // Check combined quantity doesn't exceed stock
        const newQty = existing.quantity + Number(quantity);
        if (newQty > product.stock) {
          return NextResponse.json(
            { error: `Cannot add more. Only ${product.stock} unit(s) available` },
            { status: 400 }
          );
        }

        await prisma.cartItem.update({
          where: { id: existing.id },
          data:  { quantity: { increment: Number(quantity) } },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId:    cart.id,
            productId: Number(productId),
            quantity:  Number(quantity),
          },
        });
      }
    } else {
      // Customizable — always new item
      await prisma.cartItem.create({
        data: {
          cartId:        cart.id,
          productId:     Number(productId),
          quantity:      Number(quantity),
          customization: customization || null,
        },
      });
    }

    // ── GET ITEM COUNT ──
    const itemCount = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum:  { quantity: true },
    });

    return NextResponse.json({
      success:   true,
      cartId:    cart.id,
      itemCount: itemCount._sum.quantity || 0,
      message:   "Added to cart",
    });

  } catch (err) {
    console.error("CART ADD ERROR:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}