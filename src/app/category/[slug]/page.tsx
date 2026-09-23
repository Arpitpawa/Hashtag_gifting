import { Suspense }      from "react";
import { notFound }     from "next/navigation";
import type { Metadata } from "next";
import prisma            from "@/lib/prisma";
import CategoryClient    from "@/components/category/CategoryClient";

// Product listings for a category don't need to be rebuilt from Postgres on
// every single request — 60s ISR serves repeat/concurrent visitors from
// cache while still picking up new stock/price changes within a minute.
export const revalidate = 60;

// ── helpers ───────────────────────────────────────────────────────────────────
async function getCategoryData(slug: string) {
  return prisma.category.findFirst({
    where: { slug },
    include: {
      parent:   { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true }, orderBy: [{ navOrder: "asc" }, { name: "asc" }] },
    },
  });
}

async function getInitialProducts(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug },
    include: { children: { select: { id: true } } },
  });

  let where: any = { status: "ACTIVE" };

  if (category) {
    const ids = [category.id, ...category.children.map((c: any) => c.id)];
    // Primary category OR any ProductCategory row (multi-category products)
    where.OR = [
      { categoryId: { in: ids } },
      { productCategories: { some: { categoryId: { in: ids } } } },
    ];
  } else {
    const keyword = slug.replace(/-/g, " ");
    where.OR = [
      { name:        { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { tags:        { has: keyword } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy: { createdAt: "desc" }, take: 20, skip: 0,
      select: {
        id: true, name: true, slug: true, price: true,
        comparePrice: true, images: true, badge: true,
        stock: true, customizable: true,
        category: { select: { id: true, name: true, slug: true } },
        reviews:  { select: { rating: true } },
        variants: {
          where:   { groupName: { equals: "Color", mode: "insensitive" } },
          orderBy: { sortOrder: "asc" },
          select:  { id: true, optionName: true, images: true, stock: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p: any) => ({
      ...p,
      avgRating:   p.reviews.length
        ? Math.round((p.reviews.reduce((s: any, r: any) => s + r.rating, 0) / p.reviews.length) * 10) / 10
        : 0,
      reviewCount: p.reviews.length,
      reviews:     undefined,
    })),
    total,
  };
}

// ── Metadata ──────────────────────────────────────────────────────────────────
// Next.js 15/16: params is a Promise — must be awaited
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const cat  = await getCategoryData(slug);
  const name = cat?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title:       `${name}`,
    description: cat?.description ??
      `Shop the best personalised ${name.toLowerCase()} — handcrafted with love, fast delivery across India.`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
// Next.js 15/16: params is a Promise — must be awaited
export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  // ← THE FIX: await params before using .slug
  const { slug } = await params;

  const [category, { products, total }] = await Promise.all([
    getCategoryData(slug),
    getInitialProducts(slug),
  ]);

  if (!category && products.length === 0) notFound();

  const displayName = category?.name ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryClient
        key={slug}
        slug={slug}
        displayName={displayName}
        description={category?.description ?? ""}
        initialProducts={products}
        initialTotal={total}
        categoryId={category?.id ?? null}
        parentCategory={category?.parent ?? null}
        childCategories={category?.children ?? []}
      />
    </Suspense>
  );
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="h-[160px] bg-[#e8e0d5] animate-pulse" />
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
              <div className="h-3.5 bg-[#e8e0d5] rounded-full mb-2 w-3/4" />
              <div className="h-3.5 bg-[#e8e0d5] rounded-full w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}