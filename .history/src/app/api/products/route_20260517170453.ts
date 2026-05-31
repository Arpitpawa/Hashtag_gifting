import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category  = searchParams.get("category");   // slug
    const search    = searchParams.get("search");
    const sort      = searchParams.get("sort");        // "price_asc" | "price_desc" | "newest"
    const minPrice  = searchParams.get("minPrice");
    const maxPrice  = searchParams.get("maxPrice");
    const badge     = searchParams.get("badge");       // "Best seller" | "New"
    const customizable = searchParams.get("customizable"); // "true"
    const limit     = parseInt(searchParams.get("limit") || "50");
    const page      = parseInt(searchParams.get("page") || "1");
    const skip      = (page - 1) * limit;

    const where: any = {
      status: "ACTIVE",
    };

    // Category filter
    if (category) {
      where.category = { slug: category };
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    // Price filter (stored in paise)
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice) * 100;
      if (maxPrice) where.price.lte = parseInt(maxPrice) * 100;
    }

    // Badge filter
    if (badge) {
      where.badge = badge;
    }

    // Customizable filter
    if (customizable === "true") {
      where.customizable = true;
    }

    // Sort
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc")  orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "newest")     orderBy = { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id:          true,
          name:        true,
          slug:        true,
          price:       true,
          comparePrice: true,
          images:      true,
          badge:       true,
          customizable: true,
          stock:       true,
          tags:        true,
          category: {
            select: { id: true, name: true, slug: true }
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("PRODUCTS GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}