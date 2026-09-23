import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { sanitizeCustomizationObject } from "@/lib/sanitize";
import { getSignedGuestCartId, setGuestCartCookie } from "@/lib/cartAuth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { productId, quantity = 1, customization, cartId, variantId } = await req.json();
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 50) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

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

    // ── VALIDATE VARIANT (if one was selected) ──
    // A variant's own stock is what actually governs this item when one is
    // selected — the parent product's stock is a separate, often unrelated
    // number once a product has variants (e.g. products created by
    // scripts/consolidateImportedCategories.ts-style merges), so it's
    // checked instead of, not in addition to, product.stock below.
    let variant: { id: number; stock: number; optionName: string } | null = null;
    if (variantId) {
      const v = await prisma.productVariant.findUnique({
        where:  { id: Number(variantId) },
        select: { id: true, productId: true, stock: true, optionName: true },
      });
      if (!v || v.productId !== Number(productId)) {
        return NextResponse.json({ error: "Selected option is invalid for this product" }, { status: 400 });
      }
      variant = v;
    }

    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < Number(quantity)) {
      return NextResponse.json(
        {
          error: availableStock === 0
            ? `"${product.name}"${variant ? ` (${variant.optionName})` : ""} is out of stock`
            : `Only ${availableStock} unit(s) available`,
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
    const user = session?.user?.id
      ? await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
      : null;

    let cart;
    if (user) {
      cart = await prisma.cart.findFirst({ where: { userId: user.id } });
      if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } });
    } else if (cartId && Number(cartId) === (await getSignedGuestCartId())) {
      const found = await prisma.cart.findUnique({ where: { id: Number(cartId) } });
      if (found && !found.userId) cart = found; // never write into a logged-in user's cart as a guest
    }
    if (!cart) cart = await prisma.cart.create({ data: {} });
    if (!user) await setGuestCartCookie(cart.id);

    // ── ADD OR UPDATE CART ITEM ──
    // For customizable products — always add new item (each customization is unique)
    // For regular products — merge quantities
    if (!product.customizable) {
      // Matching on variantId too — otherwise picking two different
      // variants of the same product (e.g. two different designs) would
      // incorrectly merge into one ambiguous cart row instead of two.
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: Number(productId), variantId: variant?.id ?? null },
      });

      if (existing) {
        // Check combined quantity doesn't exceed stock
        const newQty = existing.quantity + Number(quantity);
        if (newQty > availableStock) {
          return NextResponse.json(
            { error: `Cannot add more. Only ${availableStock} unit(s) available` },
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
            variantId: variant?.id ?? null,
            quantity:  Number(quantity),
          },
        });
      }
    } else {
      // Customizable — always new item
      // Sanitized here (not just relied on the client behaving) — the
      // LivePreviewModal UI already uploads photos to Cloudinary and sends
      // just a URL, but this API can be hit directly, so a raw base64 blob
      // must still be capped/stripped server-side rather than trusted.
      await prisma.cartItem.create({
        data: {
          cartId:        cart.id,
          productId:     Number(productId),
          variantId:     variant?.id ?? null,
          quantity:      Number(quantity),
          customization: customization ? sanitizeCustomizationObject(customization) : Prisma.JsonNull,
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