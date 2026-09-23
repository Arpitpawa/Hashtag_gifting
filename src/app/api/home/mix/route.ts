import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

/**
 * Homepage product picks with VARIETY: one product from each product type
 * (diary set, passport cover, wallets, clutch, pen, combos, ...) instead of
 * "newest first", which is all combos. `seed` rotates which type starts and
 * which design of each type is shown, so different homepage sections show
 * different products.
 *
 * GET /api/home/mix?limit=8&seed=0
 */
const TYPE_ORDER = ["01", "11", "08", "15", "02", "13", "09", "04", "06", "10", "16", "19", "03", "05", "07", "12", "14", "17", "18"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "8", 10) || 8, 1), 20);
  const seed = Math.min(Math.max(parseInt(sp.get("seed") || "0", 10) || 0, 0), 50);

  // optional: only these product types, e.g. types=11,12,13
  const wanted = (sp.get("types") || "").split(",").map((t) => t.trim()).filter((t) => /^\d{2}$/.test(t));

  const key = `home:mix:${limit}:${seed}:${wanted.join("-")}`;
  const cached = getCache<any>(key);
  if (cached) return NextResponse.json(cached, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });

  try {
    const all = await prisma.product.findMany({
      where: { deletedAt: null, status: "ACTIVE", sku: { startsWith: "HG-" } },
      orderBy: { sku: "asc" },
      select: { id: true, sku: true, name: true, slug: true, price: true, comparePrice: true, images: true, badge: true, stock: true, customizable: true },
    });

    const byType = new Map<string, any[]>();
    for (const p of all) {
      const t = /^HG-(\d{2})-/.exec(p.sku ?? "")?.[1];
      if (!t || !p.images?.[0]) continue;
      (byType.get(t) ?? byType.set(t, []).get(t)!).push(p);
    }

    const start = wanted.length ? 0 : (seed * 5) % TYPE_ORDER.length;
    const order = [...TYPE_ORDER.slice(start), ...TYPE_ORDER.slice(0, start)].filter((t) => byType.has(t) && (wanted.length === 0 || wanted.includes(t)));
    const out: any[] = [];
    for (let round = 0; out.length < limit && round < 40; round++) {
      for (const t of order) {
        const list = byType.get(t)!;
        if (round >= list.length) continue;
        const p = list[(seed + round) % list.length];
        if (out.some((x) => x.id === p.id)) continue;
        const { sku, ...rest } = p; // sku is admin-only
        out.push({ ...rest, images: p.images.slice(0, 2), allCategories: [] });
        if (out.length >= limit) break;
      }
    }

    const body = { products: out };
    setCache(key, body, 120);
    return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
