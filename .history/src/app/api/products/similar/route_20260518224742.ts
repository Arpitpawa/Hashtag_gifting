import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId  = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const cacheKey = `similar:${productId}:${categoryId}`;
    const cached   = getCache(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Get current product tags for tag-based similarity
    const currentProduct = await prisma.product.findUnique({
      where:  { id: Number(productId) },
      select: { tags: true, categoryId: true, price: true },
    });

    if (!currentProduct) {
      return NextResponse.json({ products: [] });
    }

    // Fetch similar — same category first
    const similar = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        NOT:    { id: Number(productId) },
        OR: [
          // Same category
          currentProduct.categoryId
            ? { categoryId: currentProduct.categoryId }
            : {},
          // Similar price range (±30%)
          {
            price: {
              gte: Math.round(currentProduct.price * 0.7),
              lte: Math.round(currentProduct.price * 1.3),
            },
          },
        ].filter((o) => Object.keys(o).length > 0),
      },
      take:    12,
      orderBy: { createdAt: "desc" },
      select: {
        id:          true,
        name:        true,
        slug:        true,
        price:       true,
        comparePrice: true,
        images:      true,
        badge:       true,
        stock:       true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const response = { products: similar };
    setCache(cacheKey, response, 60); // cache 60s

    return NextResponse.json(response);

  } catch (err) {
    console.error("SIMILAR PRODUCTS ERROR:", err);
    return NextResponse.json({ error: "Failed to load similar products" }, { status: 500 });
  }
}