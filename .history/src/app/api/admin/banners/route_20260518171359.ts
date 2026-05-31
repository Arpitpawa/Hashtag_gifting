import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") || "hero";
    const cacheKey = `banners:${position}`;

    const cached = getCache(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });

    const banners = await prisma.banner.findMany({
      where:   { isActive: true, position },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, title: true, image: true,
        linkUrl: true, sortOrder: true,
      },
    });

    setCache(cacheKey, banners, 60); // cache 60s
    return NextResponse.json(banners, {
      headers: { "Cache-Control": "public, s-maxage=60" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load banners" }, { status: 500 });
  }
}