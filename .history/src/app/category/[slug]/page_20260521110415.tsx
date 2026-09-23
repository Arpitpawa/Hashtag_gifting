import { Suspense }    from "react";
import { notFound }   from "next/navigation";
import type { Metadata } from "next";
import prisma          from "@/lib/prisma";
import CategoryClient  from "@/components/category/CategoryClient";

export const revalidate = 3600; // cache for 1 hour

// ── helpers ──────────────────────────────────────────────────────────────────

async function getCategoryData(slug: string) {
  // 1. Try exact slug in DB
  const category = await prisma.category.findFirst({
    where: { slug },
    include: {
      children:  { select: { id: true, name: true, slug: true } },
      _count:    { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });
  if (category) return category;

  // 2. Slug not in DB (e.g. "gifts-for-boyfriend") — return null so we show
  //    a virtual page filtered by keyword search
  return null;
}

async function getInitialProducts(slug: string) {
  // Try to match by exact category slug first
  const category = await prisma.category.findFirst({ where: { slug } });

  const where: any = { status: "ACTIVE" };

  if (category) {
    where.categoryId = category.id;
  } else {
    // Fallback: keyword search from slug ("gifts-for-boyfriend" → "boyfriend")
    const keyword = slug.replace(/-/g, " ");
    where.OR = [
      { name:        { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { tags:        { has: keyword } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      skip: 0,
      select: {
        id: true, name: true, slug: true,
        price: true, comparePrice: true,
        images: true, badge: true, stock: true,
        customizable: true,
        category: { select: { id: true, name: true, slug: true } },
        reviews:  { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const enriched = products.map((p) => ({
    ...p,
    avgRating:   p.reviews.length
      ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
      : 0,
    reviewCount: p.reviews.length,
    reviews: undefined,
  }));

  return { products: enriched, total };
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const cat  = await getCategoryData(params.slug);
  const name = cat?.name || params.slug.replace(/-/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title:       `${name} — Hashtag Gifting`,
    description: cat?.description ||
      `Shop the best personalised ${name.toLowerCase()} — handcrafted with love, fast delivery across India.`,
    openGraph: {
      title:       `${name} — Hashtag Gifting`,
      description: `500+ personalised ${name.toLowerCase()} for every occasion. Order online with same-day dispatch.`,
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function CategoryPage(
  { params, searchParams }: {
    params:       { slug: string };
    searchParams: { sort?: string; minPrice?: string; maxPrice?: string; page?: string };
  }
) {
  const [category, { products, total }] = await Promise.all([
    getCategoryData(params.slug),
    getInitialProducts(params.slug),
  ]);

  // Hard 404 only if zero results AND no matching category
  if (!category && products.length === 0) {
    notFound();
  }

  const displayName = category?.name ||
    params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryClient
        slug={params.slug}
        displayName={displayName}
        description={category?.description || ""}
        initialProducts={products}
        initialTotal={total}
        categoryId={category?.id || null}
      />
    </Suspense>
  );
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="h-[180px] bg-[#e8e0d5] animate-pulse" />
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
              <div className="h-3.5 bg-[#e8e0d5] rounded-full mb-2" />
              <div className="h-3.5 bg-[#e8e0d5] rounded-full w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}