import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

// ── Frequently bought together ───────────────────────────────────────────
// Different job from /api/products/similar (which suggests ALTERNATIVES --
// other wallets someone might pick instead). This suggests COMPLEMENTS --
// things actually bought alongside this one in the same real order, to
// grow order value rather than replace the item being viewed.
//
// Companions are restricted to non-customizable products on purpose: the
// bundle "Add selected to cart" button below adds them straight to cart
// with no customization step, so a personalised item (which usually
// requires a name/text field) can't safely go through this path. The
// currently-viewed product itself is unaffected -- it still uses its own
// normal Add to cart / Customize flow elsewhere on the page.

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" };

const PRODUCT_SELECT = {
  id: true, name: true, slug: true, price: true, comparePrice: true,
  images: true, stock: true, customizable: true,
};

interface FBTProduct {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  stock:        number;
  customizable: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId  = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    const pid = Number(productId);

    const cacheKey = `fbt:${pid}`;
    const cached   = getCache(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: CACHE_HEADERS });

    // Only orders that actually went through -- same "real purchase"
    // definition used for the recent-purchases social proof.
    const realOrderFilter = {
      paymentStatus:  { not: "FAILED"    as const },
      deliveryStatus: { not: "CANCELLED" as const },
    };

    // 1. Every real order that included this product (capped -- a hot
    // product could have thousands of orders, and we only need enough of
    // a sample to find the top companions, not every single one).
    const ordersWithProduct = await prisma.orderItem.findMany({
      where:    { productId: pid, order: realOrderFilter },
      select:   { orderId: true },
      distinct: ["orderId"],
      take:     500,
    });

    let products: FBTProduct[] = [];

    if (ordersWithProduct.length > 0) {
      // 2. What else showed up in those same orders, ranked by how often.
      const companions = await prisma.orderItem.groupBy({
        by:      ["productId"],
        where: {
          orderId:   { in: ordersWithProduct.map((o) => o.orderId) },
          productId: { not: pid },
        },
        _count:  { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take:    8, // fetch a few extra -- some will get filtered out below (customizable / out of stock / inactive)
      });

      if (companions.length > 0) {
        const rows = await prisma.product.findMany({
          where:  { id: { in: companions.map((c) => c.productId) }, status: "ACTIVE", customizable: false },
          select: PRODUCT_SELECT,
        });
        // groupBy doesn't preserve rank order once re-fetched -- re-sort by
        // real co-purchase count, most-bought-together first.
        const rankById = new Map(companions.map((c) => [c.productId, c._count.productId]));
        products = rows
          .sort((a, b) => (rankById.get(b.id) ?? 0) - (rankById.get(a.id) ?? 0))
          .slice(0, 3);
      }
    }

    // Fallback -- not enough real order history yet (new product, or every
    // real companion was itself customizable/out of stock): same category,
    // non-customizable, most recent first. Same graceful-degrade pattern
    // /api/products/similar already uses.
    if (products.length < 2) {
      const fallback = await prisma.product.findMany({
        where: {
          status:       "ACTIVE",
          customizable: false,
          NOT:          { id: { in: [pid, ...products.map((p) => p.id)] } },
          ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        },
        take:    3 - products.length,
        orderBy: { createdAt: "desc" },
        select:  PRODUCT_SELECT,
      });
      products = [...products, ...fallback];
    }

    const response = { products };
    setCache(cacheKey, response, 120);

    return NextResponse.json(response, { headers: CACHE_HEADERS });

  } catch (err) {
    console.error("FREQUENTLY BOUGHT TOGETHER ERROR:", err);
    return NextResponse.json({ error: "Failed to load frequently bought together" }, { status: 500 });
  }
}
