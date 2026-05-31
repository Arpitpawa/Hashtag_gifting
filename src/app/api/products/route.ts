import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { getCache, setCache } from "@/lib/cache";
import { sanitizeSearchQuery } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    // ── RATE LIMIT ──
    const ip     = req.headers.get("x-forwarded-for") || "unknown";
    const limit  = rateLimit(`products:${ip}`, { maxRequests: 60, windowMs: 60_000 });

    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status:  429,
          headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const { searchParams } = new URL(req.url);

    const category     = searchParams.get("category") || "";
    const search       = sanitizeSearchQuery(searchParams.get("search") || "");
    const sort         = searchParams.get("sort")     || "newest";
    const minPrice     = searchParams.get("minPrice") || "";
    const maxPrice     = searchParams.get("maxPrice") || "";
    const badge        = searchParams.get("badge")    || "";
    const customizable = searchParams.get("customizable") === "true";
    const page         = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit2       = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip         = (page - 1) * limit2;

    // ── CACHE KEY ──
    const cacheKey = `products:${category}:${search}:${sort}:${minPrice}:${maxPrice}:${badge}:${customizable}:${page}:${limit2}`;
    const cached   = getCache(cacheKey);

    if (cached && !search) {
      // Cache hits for non-search queries (search results should be fresh)
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }

    // ── BUILD WHERE ──
    const where: any = { status: "ACTIVE" };

    if (category)         where.category    = { slug: category };
    if (badge)            where.badge       = badge;
    if (customizable)     where.customizable = true;

    if (search) {
      where.OR = [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags:        { has: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice) * 100;
      if (maxPrice) where.price.lte = parseInt(maxPrice) * 100;
    }

    // ── SORT ──
    const orderBy: any =
      sort === "price_asc"  ? { price: "asc" }  :
      sort === "price_desc" ? { price: "desc" } :
      { createdAt: "desc" };

    // ── QUERY — select only needed fields ──
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit2,
        select: {
          id:          true,
          name:        true,
          slug:        true,
          price:       true,
          comparePrice: true,
          images:      true,   // Only first image needed for listing
          badge:       true,
          stock:       true,
          customizable: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Only return first image in listing for smaller payload
    const optimizedProducts = products.map((p) => ({
      ...p,
      images: p.images.slice(0, 2), // max 2 images in listing
    }));

    const response = {
      products:   optimizedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit2),
      hasMore:    skip + limit2 < total,
    };

    // Cache for 30s (non-search only)
    if (!search) setCache(cacheKey, response, 30);

    return NextResponse.json(response, {
      headers: {
        "X-Cache":         "MISS",
        "Cache-Control":   "public, s-maxage=30, stale-while-revalidate=60",
      },
    });

  } catch (err) {
    console.error("PRODUCTS ERROR:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}