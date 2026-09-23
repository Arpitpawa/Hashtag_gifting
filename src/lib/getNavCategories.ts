import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

// Shared by /api/categories (client-side refresh fetches from Navbar/ShopClient/
// AllCategoriesClient) AND the root layout (server-rendered initial data, so the
// navbar's category row is populated on the very first paint instead of showing
// empty until the client fetch resolves). Same cache key either way, so whichever
// one runs first on a given request warms it for the other.
export const NAV_CATEGORIES_CACHE_KEY = "categories:nav";

// Sub-categories matching this are people/occasion/bulk groupings, not product
// types — they're never hidden for being empty.
const ALWAYS_SHOW = new RegExp([
  "gifts? for", "birthday", "anniversary", "valentine", "mother", "father", "friendship",
  "raksha", "women", "wedding", "bulk", "corporate", "employee", "event", "branding",
  "couple", "married", "fiance", "bridesmaid", "baby", "kids", "parents", "day$", "\\bday\\b",
].join("|"), "i");

export async function getNavCategories() {
  const cached = getCache(NAV_CATEGORIES_CACHE_KEY);
  if (cached) return cached as any[];

  const categories = await prisma.category.findMany({
    where: { parentId: null, showInNav: true }, // top-level, nav-visible only
    include: {
      children: {
        where: { showInNav: true },
        select: {
          id: true, name: true, slug: true, image: true,
          _count: { select: {
            products: { where: { deletedAt: null } },
            productCategories: { where: { product: { deletedAt: null } } },
          } },
        },
        orderBy: [{ navOrder: "asc" }, { name: "asc" }],
      },
      // Count via the ProductCategory join so a product listed under several
      // categories (birthday, for-him, ...) counts in each of them.
      _count: { select: { products: { where: { deletedAt: null } }, productCategories: { where: { product: { deletedAt: null } } } } },
    },
    orderBy: [{ navOrder: "asc" }, { name: "asc" }],
  });

  const result = categories.map((c: any) => ({
    ...c,
    // Sub-categories are automatic: a product-TYPE sub-category (mugs, frames,
    // lamps, wallets, ...) only shows in the menu while it actually has
    // products. Relationship / occasion / bulk ones (gifts for him, birthday,
    // corporate, ...) always show, even when empty.
    children: c.children
      .filter((k: any) => ALWAYS_SHOW.test(`${k.name} ${k.slug.replace(/-/g, " ")}`)
        || Math.max(k._count.products, k._count.productCategories) > 0)
      .map(({ _count, ...rest }: any) => ({ ...rest, _count: { products: Math.max(_count.products, _count.productCategories) } })),
    _count: { products: Math.max(c._count.products, c._count.productCategories) },
  }));

  // Categories without an uploaded image borrow a product photo (a different
  // product per category) so "Shop by category" never shows empty boxes.
  await Promise.all(result.map(async (c: any, i: number) => {
    if (c.image) return;
    const ids = [c.id, ...c.children.map((k: any) => k.id)];
    const where = {
      deletedAt: null, status: "ACTIVE" as const,
      OR: [{ categoryId: { in: ids } }, { productCategories: { some: { categoryId: { in: ids } } } }],
    };
    const total = await prisma.product.count({ where });
    if (!total) return;
    const pick = await prisma.product.findFirst({ where, orderBy: { id: "asc" }, skip: (i * 17) % total, select: { images: true } });
    if (pick?.images?.[0]) c.image = pick.images[0];
  }));

  // A top-level menu item with no products and nothing inside it is hidden
  // automatically (e.g. an empty "Gifts by type") until products are added.
  const visible = result.filter((c: any) => c.children.length > 0 || c._count.products > 0);

  setCache(NAV_CATEGORIES_CACHE_KEY, visible, 120);
  return visible;
}
