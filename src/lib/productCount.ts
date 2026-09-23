import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

// Single source of truth for "how many products do we sell" — used anywhere
// marketing copy needs a live number (homepage JSON-LD, meta description,
// announcement bar, hamper builder blurb) instead of a hand-typed figure
// that quietly goes stale as the catalog grows. Cached briefly since this
// gets called from several places on every page load.
const PRODUCT_COUNT_CACHE_KEY = "products:count:active";

export async function getActiveProductCount(): Promise<number> {
  const cached = getCache<number>(PRODUCT_COUNT_CACHE_KEY);
  if (cached !== null) return cached;

  const count = await prisma.product.count({
    where: { status: "ACTIVE", deletedAt: null },
  });

  setCache(PRODUCT_COUNT_CACHE_KEY, count, 300); // 5 min
  return count;
}

// Marketing copy reads better as "200+" than "213" — rounds DOWN to the
// nearest step so the claim is always true, never an overstatement, even
// the moment before the cache refreshes and the real count has grown past it.
export function roundDownForMarketing(count: number, step = 50): number {
  if (count < step) return count;
  return Math.floor(count / step) * step;
}
