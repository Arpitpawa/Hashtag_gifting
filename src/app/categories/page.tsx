import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import AllCategoriesClient from "@/components/category/AllCategoriesClient";

// Category listings don't need to be second-by-second fresh — a 60s ISR
// window means most requests get served straight from cache instead of
// round-tripping to Postgres, and admin edits still land within a minute
// (immediately if the category itself changed, since the admin routes bust
// the /api/categories cache too).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "All categories",
  description: "Browse every gift category we offer.",
};

const PASTEL_RED = "#6B4F3F";

// Only top-level (parent) categories are shown on this page — subcategories
// are folded into the parent's product count/filter instead of getting
// their own tile, since admin can have many subcategories per parent.
async function getParentCategories() {
  const parents = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { select: { id: true, slug: true } },
    },
    orderBy: [{ navOrder: "asc" }, { name: "asc" }],
  });

  // One grouped query for every category's product count instead of a
  // separate count() per parent — was N+1 round trips to Postgres, now 1.
  const counts = await prisma.product.groupBy({
    by:    ["categoryId"],
    where: { status: "ACTIVE", categoryId: { not: null } },
    _count: { _all: true },
  });
  const countByCategoryId = new Map(counts.map((c) => [c.categoryId as number, c._count._all]));
  // Multi-category membership (birthday, for-him, ...) lives in ProductCategory.
  const joinCounts = await prisma.productCategory.groupBy({
    by:    ["categoryId"],
    where: { product: { status: "ACTIVE", deletedAt: null } },
    _count: { _all: true },
  });
  const joinByCategoryId = new Map(joinCounts.map((c) => [c.categoryId, c._count._all]));

  return parents.map((p) => {
    const childIds   = p.children.map((c) => c.id);
    const childSlugs = p.children.map((c) => c.slug);

    // Sum the parent's own count plus every subcategory's, since products
    // are usually tagged at the subcategory level.
    const summed = [p.id, ...childIds].reduce(
      (sum, id) => sum + (countByCategoryId.get(id) ?? 0),
      0
    );
    // Parents get a join row for every product in their children, so the
    // join count is already distinct — take whichever is larger.
    const count = Math.max(summed, joinByCategoryId.get(p.id) ?? 0);

    return { id: p.id, name: p.name, slug: p.slug, image: p.image, count, childSlugs };
  });
}

export default async function AllCategoriesPage() {
  const categories = await getParentCategories();

  return (
    <section className="pt-0 pb-16">
      <div
        className="pt-14 md:pt-16 pb-10 md:pb-12 px-4 md:px-6 lg:px-10"
        style={{ backgroundColor: PASTEL_RED }}
      >
        <div className="text-center mb-2">
          <p className="text-white/50 text-[11px] font-medium uppercase tracking-[4px] mb-3">
            Everything we offer
          </p>
          <h1
            className="text-white text-[38px] md:text-[58px] font-normal"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            All categories
          </h1>
        </div>
      </div>

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 pt-10 md:pt-12">
        <AllCategoriesClient categories={categories} />
      </div>
    </section>
  );
}
