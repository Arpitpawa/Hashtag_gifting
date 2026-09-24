import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { getCache, setCache } from "@/lib/cache";
import { sanitizeSearchQuery } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    const ip    = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`products:${ip}`, { maxRequests: 150, windowMs: 60_000 });

    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { searchParams } = new URL(req.url);

    const category     = searchParams.get("category")     || "";
    // NEW: multiple categories — e.g. ?categories=birthday-gifts,mugs
    const categories   = searchParams.get("categories")   || "";
    const search       = sanitizeSearchQuery(searchParams.get("search") || "");
    const sort         = searchParams.get("sort")         || "newest";
    const minPrice     = searchParams.get("minPrice")     || "";
    const maxPrice     = searchParams.get("maxPrice")     || "";
    const badge        = searchParams.get("badge")        || "";
    const customizable = searchParams.get("customizable") === "true";
    const fastDelivery = searchParams.get("fastDelivery") === "true";
    const idsParam     = searchParams.get("ids")          || "";
    const page         = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit2       = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip         = (page - 1) * limit2;

    const cacheKey = `products:${category}:${categories}:${search}:${sort}:${minPrice}:${maxPrice}:${badge}:${customizable}:${fastDelivery}:${page}:${limit2}`;
    const cached   = getCache(cacheKey);
    if (cached && !search) {
      return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
    }

    // ── Build WHERE ──
    const where: any = { status: "ACTIVE" };

    if (badge)        where.badge        = badge;
    if (customizable) where.customizable = true;
    if (fastDelivery) where.fastDelivery = true;

    if (idsParam) {
      const ids = idsParam.split(",").map(Number).filter(Boolean);
      if (ids.length > 0) where.id = { in: ids };
    }

    // Category filtering:
    // Single ?category=slug  → filter via ProductCategory join (covers multi-cat products)
    // Multi  ?categories=a,b → same, products in ANY of those categories
    const catSlugs: string[] = [];
    if (category)   catSlugs.push(category);
    if (categories) catSlugs.push(...categories.split(",").map((s) => s.trim()).filter(Boolean));

    if (catSlugs.length > 0) {
      where.productCategories = {
        some: {
          category: { slug: { in: catSlugs } },
        },
      };
    }

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

    // Sort by the chosen field first; stock is only a tiebreaker for exact ties
    // (e.g. two products at the identical price), never the primary key —
    // sorting on raw stock quantity first clusters products into stock-count
    // buckets (10/15/20 etc.) and defeats the chosen sort entirely.
    const orderBy: any[] =
      sort === "price_asc"  ? [{ price: "asc"  }, { stock: "desc" }] :
      sort === "price_desc" ? [{ price: "desc" }, { stock: "desc" }] :
      sort === "popular"    ? [{ createdAt: "desc" }, { stock: "desc" }] :
      [{ createdAt: "desc" }, { stock: "desc" }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit2,
        select: {
          id:           true,
          name:         true,
          slug:         true,
          price:        true,
          comparePrice: true,
          images:       true,
          badge:        true,
          stock:        true,
          customizable: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          productCategories: {
            select: { category: { select: { id: true, name: true, slug: true } } },
          },
          // Lean — just enough to render color swatch dots on the card.
          // Only the "Color" group is useful here; Size/Material etc. would
          // need their own text, which doesn't fit a small dot row.
          variants: {
            where:   { groupName: { equals: "Color", mode: "insensitive" } },
            orderBy: { sortOrder: "asc" },
            select:  { id: true, optionName: true, images: true, stock: true, price: true, comparePrice: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const optimizedProducts = products.map((p: any) => ({
      ...p,
      images: p.images.slice(0, 2),
      // Flatten all categories into a simple array
      allCategories: p.productCategories.map((pc: any) => pc.category),
    }));

    const response = {
      products:   optimizedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit2),
      hasMore:    skip + limit2 < total,
    };

    if (!search) setCache(cacheKey, response, 30);

    return NextResponse.json(response, {
      headers: {
        "X-Cache":       "MISS",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });

  } catch (err) {
    console.error("PRODUCTS ERROR:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}