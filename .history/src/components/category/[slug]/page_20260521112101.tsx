import { Suspense }     from "react";
import { notFound }    from "next/navigation";
import type { Metadata } from "next";
import prisma           from "@/lib/prisma";
import CategoryClient   from "@/components/category/CategoryClient";

export const revalidate = 3600;

// ── fetch category (exact slug OR child slug) ─────────────────────────────────
async function getCategoryData(slug: string) {
  return prisma.category.findFirst({
    where: { slug },
    include: {
      parent:   { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
      _count:   { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });
}

// ── fetch products — includes children's products too ─────────────────────────
async function getInitialProducts(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug },
    include: { children: { select: { id: true } } },
  });

  let where: any = { status: "ACTIVE" };

  if (category) {
    // Collect this category + all its children IDs
    const ids = [category.id, ...category.children.map((c) => c.id)];
    where.categoryId = { in: ids };
  } else {
    // Slug not in DB — keyword fallback
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
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      avgRating:   p.reviews.length
        ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
        : 0,
      reviewCount: p.reviews.length,
      reviews:     undefined,
    })),
    total,
  };
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const cat  = await getCategoryData(params.slug);
  const name = cat?.name ?? params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title:       `${name} — Hashtag Gifting`,
    description: cat?.description ??
      `Shop the best personalised ${name.toLowerCase()} — handcrafted with love, fast delivery across India.`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CategoryPage(
  { params }: { params: { slug: string } }
) {
  const [category, { products, total }] = await Promise.all([
    getCategoryData(params.slug),
    getInitialProducts(params.slug),
  ]);

  if (!category && products.length === 0) notFound();

  const displayName = category?.name ??
    params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryClient
        slug={params.slug}
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