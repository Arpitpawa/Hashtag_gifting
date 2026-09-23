"use client";

import { useState, useEffect, useCallback } from "react";
import ThemedSelect from "@/components/shared/ThemedSelect";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link                                  from "next/link";
import HoverImage from "@/components/shared/HoverImage";
import Image                                 from "next/image";
import {
  SlidersHorizontal, X, Heart, ChevronLeft,
  ChevronRight, Sparkles, Search, LayoutGrid,
  List, Star, Gift,
} from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { formatPrice }      from "@/lib/store/cartStore";
import ColorSwatchDots, { type SwatchVariant } from "@/components/shop/ColorSwatchDots";

// ── types ─────────────────────────────────────────────────────────────────────
interface Product {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
  stock:        number;
  customizable: boolean;
  avgRating:    number;
  reviewCount:  number;
  category:     { id: number; name: string; slug: string } | null;
  variants?:    SwatchVariant[];
}

interface Props {
  slug:             string;
  displayName:      string;
  description:      string;
  initialProducts:  Product[];
  initialTotal:     number;
  categoryId:       number | null;
  parentCategory:   { id: number; name: string; slug: string } | null;
  childCategories:  { id: number; name: string; slug: string }[];
}

const SORT_OPTIONS = [
  { label: "Newest first",       value: "newest"     },
  { label: "Price: low to high", value: "price_asc"  },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Most popular",       value: "popular"    },
];

const PRICE_RANGES = [
  { label: "Under Rs. 500",       min: "",     max: "500"  },
  { label: "Rs. 500–1,500",       min: "500",  max: "1500" },
  { label: "Rs. 1,500–3,000",     min: "1500", max: "3000" },
  { label: "Above Rs. 3,000",     min: "3000", max: ""     },
];

const LIMIT = 20;

// ── product card ──────────────────────────────────────────────────────────────
function ProductCard({
  product, listView,
}: { product: Product; listView: boolean }) {
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const discount   = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (listView) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="flex items-center gap-4 bg-white border border-[#e8e0d5] rounded-2xl p-4 hover:shadow-md transition-all duration-300 group"
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#f8f5f0]">
          <Image src={product.images[0] || "/placeholder.jpg"} alt={product.name}
            fill className="object-cover group-hover:scale-[1.04] transition-transform duration-500" sizes="96px" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1a1a1a] capitalize line-clamp-2 group-hover:text-[#c0555a] transition-colors">
            {product.name}
          </p>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="fill-[#f4b56a] text-[#f4b56a]" />
              <span className="text-[11px] text-[#888]">{product.avgRating} ({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[15px] font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-[12px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
            {discount > 0 && (
              <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{discount}% off</span>
            )}
          </div>
        </div>
        {product.customizable && (
          <span className="text-[10px] font-semibold text-[#c0555a] bg-[#c0555a]/10 border border-[#c0555a]/20 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
            <Sparkles size={9} /> Personal
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f8f5f0] mb-3">
          <HoverImage images={product.images} alt={product.name} sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw" />

          {/* Badges */}
          {product.badge && (
            <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-2 right-8 bg-[#1a1a1a]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              -{discount}%
            </span>
          )}
          {product.customizable && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#c0555a] text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
              <Sparkles size={9} /> Personalizable
            </span>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-[#1a1a1a] text-white text-[11px] font-bold px-3 py-1 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Color swatches — own click handling, sits between image and info */}
      <ColorSwatchDots variants={product.variants || []} productSlug={product.slug} className="mb-1.5" />

      <Link href={`/product/${product.slug}`} className="block">
        {/* Info */}
        <p className="text-[13px] font-medium text-[#1a1a1a] capitalize line-clamp-2 leading-snug mb-1.5 group-hover:text-[#c0555a] transition-colors">
          {product.name}
        </p>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={11}
                className={s <= Math.round(product.avgRating)
                  ? "fill-[#f4b56a] text-[#f4b56a]"
                  : "fill-[#e8e0d5] text-[#e8e0d5]"}
              />
            ))}
            <span className="text-[11px] text-[#aaa] ml-0.5">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[12px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </Link>

      {/* Wishlist */}
      <button
        onClick={() => toggle(product.id)}
        aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
      >
        <Heart size={13} className={wishlisted ? "fill-[#c0555a] text-[#c0555a]" : "text-[#555]"} />
      </button>
    </div>
  );
}

// ── pagination ────────────────────────────────────────────────────────────────
function Pagination({
  page, total, onPageChange,
}: { page: number; total: number; onPageChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / LIMIT);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-12">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-9 h-9 rounded-full border border-[#e8e0d5] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="text-[#aaa] text-[13px] px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-9 h-9 rounded-full text-[13px] font-semibold border transition-all ${
                page === p
                  ? "bg-[#c0555a] text-white border-[#c0555a]"
                  : "bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a]"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-9 h-9 rounded-full border border-[#e8e0d5] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <p className="text-[12px] text-[#aaa]">
        Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} products
      </p>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function CategoryClient({
  slug, displayName, description,
  initialProducts, initialTotal, categoryId,
  parentCategory = null, childCategories = [],
}: Props) {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();

  // Always read slug from URL — never trust props for routing
  const currentSlug = (params?.slug as string) || slug;

  const sort     = searchParams.get("sort")     || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const [products,    setProducts]    = useState<Product[]>(initialProducts);
  const [total,       setTotal]       = useState(initialTotal);
  const [loading,     setLoading]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [listView,    setListView]    = useState(false);
  const [searchQ,     setSearchQ]     = useState("");

  // Always derive a display name from the actual URL slug as ultimate fallback
  const urlDerivedName = currentSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const resolvedName = displayName && displayName !== "Birthday Gifts" || currentSlug === slug
    ? displayName
    : urlDerivedName;

  const updateUrl = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    p.delete("page");
    router.push(`/category/${currentSlug}?${p.toString()}`, { scroll: false });
  }, [searchParams, router, currentSlug]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (categoryId) p.set("category", currentSlug);
      if (sort)       p.set("sort",      sort);
      if (minPrice)   p.set("minPrice",  minPrice);
      if (maxPrice)   p.set("maxPrice",  maxPrice);
      if (searchQ)    p.set("search",    searchQ);
      p.set("page",  String(page));
      p.set("limit", String(LIMIT));

      const res  = await fetch(`/api/products?${p}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [currentSlug, categoryId, sort, minPrice, maxPrice, page, searchQ]);

  // Skip fetch on first render (use server-rendered data)
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const hasFilters = sort !== "newest" || minPrice || maxPrice;
  const activePriceLabel = PRICE_RANGES.find(
    (r) => r.min === minPrice && r.max === maxPrice
  )?.label;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handlePageChange = (p: number) => {
    const ps = new URLSearchParams(searchParams.toString());
    if (p === 1) ps.delete("page"); else ps.set("page", String(p));
    router.push(`/category/${currentSlug}?${ps.toString()}`);
    scrollToTop();
  };

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── HERO ── */}
      <div className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-4 flex-wrap">
            <Link href="/"     className="hover:text-[#c0555a] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#c0555a] transition-colors">Shop</Link>
            {parentCategory && (
              <>
                <span>/</span>
                <Link href={`/category/${parentCategory.slug}`}
                  className="hover:text-[#c0555a] transition-colors capitalize">
                  {parentCategory.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-[#1a1a1a] font-medium capitalize">{resolvedName}</span>
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[28px] md:text-[36px] font-bold text-[#1a1a1a] capitalize leading-tight">
                {resolvedName}
              </h1>
              {description && (
                <p className="text-[14px] text-[#888] mt-2 max-w-xl leading-relaxed">{description}</p>
              )}
              <p className="text-[13px] text-[#aaa] mt-2">
                {loading ? "Loading..." : `${total} personalised gifts`}
              </p>
            </div>
            <Link href="/shop"
              className="text-[12px] font-semibold text-[#c0555a] hover:underline underline-offset-2 flex-shrink-0">
              View all gifts →
            </Link>
          </div>

          {/* Sub-category chips */}
          {childCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              <Link href={`/category/${slug}`}
                className="text-[12px] font-semibold px-4 py-1.5 rounded-full bg-[#c0555a] text-white">
                All
              </Link>
              {childCategories.map((child) => (
                <Link key={child.id} href={`/category/${child.slug}`}
                  className="text-[12px] font-medium px-4 py-1.5 rounded-full border border-[#e8e0d5] bg-white text-[#555] hover:border-[#c0555a] hover:text-[#c0555a] transition-all capitalize">
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── STICKY FILTER BAR ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e8e0d5] shadow-sm">
        <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-3">
          <div className="flex items-center gap-3 flex-wrap">

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-semibold transition-all ${
                showFilters || hasFilters
                  ? "bg-[#c0555a] text-white border-[#c0555a]"
                  : "bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a]"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasFilters && (
                <span className="w-4 h-4 bg-white text-[#c0555a] rounded-full text-[10px] flex items-center justify-center font-bold">!</span>
              )}
            </button>

            {/* Active filter chips */}
            {activePriceLabel && (
              <span className="flex items-center gap-1.5 text-[12px] bg-[#c0555a]/10 text-[#c0555a] border border-[#c0555a]/20 px-3 py-1.5 rounded-full font-medium">
                {activePriceLabel}
                <button onClick={() => updateUrl({ minPrice: "", maxPrice: "" })}>
                  <X size={12} />
                </button>
              </span>
            )}
            {sort !== "newest" && (
              <span className="flex items-center gap-1.5 text-[12px] bg-[#c0555a]/10 text-[#c0555a] border border-[#c0555a]/20 px-3 py-1.5 rounded-full font-medium">
                {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                <button onClick={() => updateUrl({ sort: "" })}><X size={12} /></button>
              </span>
            )}
            {hasFilters && (
              <button
                onClick={() => updateUrl({ sort: "", minPrice: "", maxPrice: "" })}
                className="text-[12px] text-[#aaa] hover:text-[#c0555a] transition-colors underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            )}

            {/* Right side: sort + view toggle */}
            <div className="ml-auto flex items-center gap-3">
              <ThemedSelect value={sort} onChange={(v) => updateUrl({ sort: v })} options={SORT_OPTIONS} ariaLabel="Sort products" />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setListView(false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    !listView ? "bg-[#c0555a] text-white" : "bg-white border border-[#e8e0d5] text-[#888]"
                  }`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setListView(true)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    listView ? "bg-[#c0555a] text-white" : "bg-white border border-[#e8e0d5] text-[#888]"
                  }`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter drawer */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-[#e8e0d5] flex flex-wrap gap-6">
              <div>
                <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-2">Price range</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => updateUrl({ minPrice: r.min, maxPrice: r.max })}
                      className={`text-[12px] px-3 py-1.5 rounded-full border transition-all ${
                        minPrice === r.min && maxPrice === r.max
                          ? "bg-[#c0555a] text-white border-[#c0555a]"
                          : "bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-2">Type</p>
                <button
                  onClick={() => updateUrl({ customizable: "true" })}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a] transition-all"
                >
                  <Sparkles size={11} /> Personalizable only
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {loading ? (
          <div className={listView
            ? "flex flex-col gap-3"
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                {listView
                  ? <div className="h-24 bg-[#e8e0d5] rounded-2xl" />
                  : (
                    <>
                      <div className="aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
                      <div className="h-3.5 bg-[#e8e0d5] rounded-full mb-2" />
                      <div className="h-3.5 bg-[#e8e0d5] rounded-full w-2/3" />
                    </>
                  )}
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <Gift size={48} className="mx-auto mb-4 text-[#c0555a]" />
            <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-2">No products found</h2>
            <p className="text-[14px] text-[#888] mb-6">Try adjusting your filters or browse all gifts</p>
            <Link href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white font-semibold rounded-full hover:bg-[#a84449] transition-colors">
              Browse all gifts →
            </Link>
          </div>
        ) : (
          <div className={listView
            ? "flex flex-col gap-3"
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          }>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} listView={listView} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination page={page} total={total} onPageChange={handlePageChange} />
        )}
      </div>
    </div>
  );
}