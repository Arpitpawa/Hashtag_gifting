import { NextResponse }  from "next/server";
import type { NextRequest } from "next/server";
import prisma            from "@/lib/prisma";
import { rateLimit }     from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`search:${ip}`, { maxRequests: 60, windowMs: 60_000 });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const raw   = (searchParams.get("q") || "").trim();
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "8"));

    if (!raw || raw.length < 1) {
      return NextResponse.json({ products: [], categories: [] });
    }

    // Sanitize
    const q = raw.replace(/[%_\\]/g, "\\$&").slice(0, 100);

    // ── Build keyword variants for smarter matching ──────────────────────────
    // e.g. "led frame" → ["led", "frame"]
    // "diary" → also matches "diaries" via contains
    const words = q.split(/\s+/).filter(Boolean);

    // Each word must appear somewhere (AND logic across words)
    // For single word: match name OR description OR tags OR category
    // For multi-word: each word separately checked
    const productWhere: any = {
      status: "ACTIVE",
      AND: words.map(word => ({
        OR: [
          { name:        { contains: word, mode: "insensitive" } },
          { description: { contains: word, mode: "insensitive" } },
          { tags:        { hasSome:  [word, word.toLowerCase(), word.toUpperCase()] } },
          { category:    { name: { contains: word, mode: "insensitive" } } },
          { badge:       { contains: word, mode: "insensitive" } },
        ],
      })),
    };

    // ── Also search categories ───────────────────────────────────────────────
    const categoryWhere: any = {
      OR: words.map(word => ({
        OR: [
          { name:        { contains: word, mode: "insensitive" } },
          { description: { contains: word, mode: "insensitive" } },
        ],
      })),
    };

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where:   productWhere,
        take:    limit * 2, // fetch more so we can sort in-memory
        orderBy: [
          { stock: "desc" }, // in-stock first at DB level
          { name:  "asc"  },
        ],
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
        },
      }),
      prisma.category.findMany({
        where:   categoryWhere,
        take:    5,
        select: {
          id:    true,
          name:  true,
          slug:  true,
          image: true,
          _count: { select: { products: true } },
        },
      }),
    ]);

    // ── Sort: in-stock first, exact name matches within each group ─────────
    const inStock  = products.filter((p: any) => p.stock > 0);
    const outStock = products.filter((p: any) => p.stock === 0);

    const sortByName = (arr: typeof products) => arr.sort((a: any, b: any) => {
      const aName  = a.name.toLowerCase();
      const bName  = b.name.toLowerCase();
      const qLower = q.toLowerCase();
      if (aName === qLower)  return -1;
      if (bName === qLower)  return 1;
      if (aName.startsWith(qLower) && !bName.startsWith(qLower)) return -1;
      if (!aName.startsWith(qLower) && bName.startsWith(qLower)) return 1;
      return aName.localeCompare(bName);
    });

    const sorted = [...sortByName(inStock), ...sortByName(outStock)].slice(0, limit);

    return NextResponse.json({
      products:   sorted,
      categories,
      query:      q,
      total:      sorted.length,
    });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}