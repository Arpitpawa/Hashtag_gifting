import { NextResponse } from "next/server";
import { getNavCategories, NAV_CATEGORIES_CACHE_KEY } from "@/lib/getNavCategories";
import { getCache } from "@/lib/cache";

// This is the single hottest endpoint in the app — Navbar (every page,
// site-wide), ShopClient, and AllCategoriesClient all call it client-side to
// stay fresh during long sessions. The root layout also seeds this same data
// server-side on first load (see src/app/layout.tsx) so the navbar's
// category row never shows empty while this fetch is in flight.
export async function GET() {
  try {
    const wasCached = !!getCache(NAV_CATEGORIES_CACHE_KEY);
    const categories = await getNavCategories();

    return NextResponse.json(categories, {
      headers: {
        "X-Cache":       wasCached ? "HIT" : "MISS",
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}