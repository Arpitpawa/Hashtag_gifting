import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          where:   { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true, name: true, rating: true,
            comment: true, images: true, createdAt: true,
          },
        },
        // ── NEW: include variants ordered by group + sortOrder ──
        // Note: sku intentionally excluded — admin-only, never sent to shoppers.
        variants: {
          orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }],
          select: {
            id:           true,
            groupName:    true,
            optionName:   true,
            price:        true,
            comparePrice: true,
            stock:        true,
            images:       true,
            sortOrder:    true,
            isDefault:    true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const avgRating =
      product.reviews.length > 0
        ? Math.round(
            (product.reviews.reduce((s: any, r: any) => s + r.rating, 0) / product.reviews.length) * 10
          ) / 10
        : 0;

    // sku is admin-only (Orders/Inventory reference code) — strip it before
    // sending to the storefront, same as the variant-level sku above.
    const { sku: _sku, ...publicProduct } = product;

    return NextResponse.json({
      ...publicProduct,
      avgRating,
      related: [],
    });

  } catch (err) {
    console.error("PRODUCT SLUG ERROR:", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}