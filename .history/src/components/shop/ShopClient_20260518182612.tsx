"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  SlidersHorizontal, X, Heart, ChevronDown,
  Search, Grid3X3, Grid2X2, Loader2
} from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { formatPrice } from "@/lib/store/cartStore";

// ── TYPES ──
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
  category:     { id: number; name: string; slug: string } | null;
}

interface Category {
  id:       number;
  name:     string;
  slug:     string;
  _count:   { products: number };
}

const SORT_OPTIONS = [
  { label: "Newest first",  value: "newest" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
];

const PRICE_RANGES = [
  { label: "Under Rs. 500",       min: "",    max: "500" },
  { label: "Rs. 500 – Rs. 1500",  min: "500", max: "1500" },
  { label: "Rs. 1500 – Rs. 3000", min: "1500", max: "3000" },
  { label: "Above Rs. 3000",      min: "3000", max: "" },
];

export default function ShopClient() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  // ── URL PARAMS ──
  const categorySlug = searchParams.get("category") || "";
  const search       = searchParams.get("search")   || "";
  const sort         = searchParams.get("sort")      || "newest";
  const minPrice     = searchParams.get("minPrice")  || "";
  const maxPrice     = searchParams.get("maxPrice")  || "";
  const badge        = searchParams.get("badge")     || "";

  // ── STATE ──
  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols,    setGridCols]    = useState<3 | 4>(4);
  const [searchInput, setSearchInput] = useState(search);

  const { toggle, isWishlisted } = useWishlistStore();

  // ── FETCH CATEGORIES ONCE ──
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  // ── FETCH PRODUCTS ──
  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (categorySlug) params.set("category", categorySlug);
      if (search)       params.set("search",   search);
      if (sort)         params.set("sort",      sort);
      if (minPrice)     params.set("minPrice",  minPrice);
      if (maxPrice)     params.set("maxPrice",  maxPrice);
      if (badge)        params.set("badge",     badge);
      params.set("page",  String(pageNum));
      params.set("limit", "12");

      const res  = await fetch(`/api/products?${params}`);
      const data = await res.json();

      if (append) {
        setProducts((prev) => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }

      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);

    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug, search, sort, minPrice, maxPrice, badge]);

  // ── REFETCH WHEN FILTERS CHANGE ──
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // ── UPDATE URL ──
  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    // Reset page on filter change
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ── CLEAR ALL FILTERS ──
  const clearFilters = () => {
    router.push("/shop", { scroll: false });
    setSearchInput("");
  };

  const hasActiveFilters = categorySlug || search || minPrice || maxPrice || badge;

  // ── ACTIVE PRICE RANGE ──
  const activePriceRange = PRICE_RANGES.find(
    (r) => r.min === minPrice && r.max === maxPrice
  );

  return (
    <div className="min-h-screen">

      {/* ── TOP BAR ── */}
      <div className="border-b border-[#e8e0d5] bg-white sticky top-0 z-30">
        <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-3">
          <div className="flex items-center gap-3 flex-wrap">

            {/* FILTER TOGGLE */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-[13px] font-semibold transition-all duration-300 ${
                showFilters
                  ? "bg-[#c0555a] text-white border-[#c0555a]"
                  : "bg-white text-[#c0555a] border-[#c0555a] hover:bg-[#c0555a] hover:text-white"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-white text-[#c0555a] rounded-full text-[10px] flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>

            {/* SEARCH BAR */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateUrl({ search: searchInput });
              }}
              className="flex items-center gap-2 flex-1 max-w-sm"
            >
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search gifts..."
                  className="w-full pl-9 pr-4 py-2 border border-[#e8e0d5] rounded-full text-[13px] outline-none focus:border-[#c0555a] transition-colors"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(""); updateUrl({ search: "" }); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#1a1a1a]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </form>

            {/* SORT */}
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => updateUrl({ sort: e.target.value })}
                className="appearance-none pl-4 pr-8 py-2 border border-[#e8e0d5] rounded-full text-[13px] outline-none focus:border-[#c0555a] cursor-pointer bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
            </div>

            {/* GRID TOGGLE */}
            <div className="hidden md:flex items-center gap-1 border border-[#e8e0d5] rounded-full p-1">
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded-full transition-colors ${gridCols === 4 ? "bg-[#c0555a] text-white" : "text-[#aaa] hover:text-[#1a1a1a]"}`}
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-full transition-colors ${gridCols === 3 ? "bg-[#c0555a] text-white" : "text-[#aaa] hover:text-[#1a1a1a]"}`}
              >
                <Grid2X2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">
        <div className="flex gap-8">

          {/* ── SIDEBAR FILTERS ── */}
          {showFilters && (
            <aside className="w-[240px] flex-shrink-0">
              <div className="sticky top-[70px] flex flex-col gap-6">

                {/* CLEAR ALL */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold hover:underline w-fit"
                  >
                    <X size={13} /> Clear all filters
                  </button>
                )}

                {/* CATEGORIES */}
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-[#aaa] mb-3">
                    Categories
                  </h3>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => updateUrl({ category: "" })}
                      className={`text-left text-[13px] py-2 px-3 rounded-xl transition-colors ${
                        !categorySlug
                          ? "bg-[#c0555a] text-white font-semibold"
                          : "text-[#555] hover:bg-[#f3efe8]"
                      }`}
                    >
                      All products
                      <span className="ml-1 text-[11px] opacity-60">({total})</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateUrl({ category: cat.slug })}
                        className={`text-left text-[13px] py-2 px-3 rounded-xl transition-colors ${
                          categorySlug === cat.slug
                            ? "bg-[#c0555a] text-white font-semibold"
                            : "text-[#555] hover:bg-[#f3efe8]"
                        }`}
                      >
                        {cat.name}
                        <span className="ml-1 text-[11px] opacity-60">
                          ({cat._count.products})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRICE RANGE */}
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-[#aaa] mb-3">
                    Price range
                  </h3>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => updateUrl({ minPrice: "", maxPrice: "" })}
                      className={`text-left text-[13px] py-2 px-3 rounded-xl transition-colors ${
                        !minPrice && !maxPrice
                          ? "bg-[#c0555a] text-white font-semibold"
                          : "text-[#555] hover:bg-[#f3efe8]"
                      }`}
                    >
                      All prices
                    </button>
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => updateUrl({ minPrice: range.min, maxPrice: range.max })}
                        className={`text-left text-[13px] py-2 px-3 rounded-xl transition-colors ${
                          activePriceRange?.label === range.label
                            ? "bg-[#c0555a] text-white font-semibold"
                            : "text-[#555] hover:bg-[#f3efe8]"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BADGES */}
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[2px] text-[#aaa] mb-3">
                    Filter by
                  </h3>
                  <div className="flex flex-col gap-1">
                    {["Best seller", "New", "Sale"].map((b) => (
                      <button
                        key={b}
                        onClick={() => updateUrl({ badge: badge === b ? "" : b })}
                        className={`text-left text-[13px] py-2 px-3 rounded-xl transition-colors ${
                          badge === b
                            ? "bg-[#c0555a] text-white font-semibold"
                            : "text-[#555] hover:bg-[#f3efe8]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                    <button
                      onClick={() => updateUrl({ customizable: "true" })}
                      className={`text-left text-[13px] py-2 px-3 rounded-xl transition-colors ${
                        searchParams.get("customizable") === "true"
                          ? "bg-[#c0555a] text-white font-semibold"
                          : "text-[#555] hover:bg-[#f3efe8]"
                      }`}
                    >
                      Customizable only
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* RESULTS COUNT + ACTIVE FILTERS */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[14px] text-[#1a1a1a] font-medium">
                  {loading ? "Loading..." : `${total} gift${total !== 1 ? "s" : ""} found`}
                </p>
                {categorySlug && (
                  <p className="text-[12px] text-[#aaa] mt-0.5">
                    in {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                  </p>
                )}
              </div>

              {/* ACTIVE FILTER TAGS */}
              <div className="flex items-center gap-2 flex-wrap">
                {categorySlug && (
                  <span className="flex items-center gap-1.5 bg-[#c0555a]/10 text-[#c0555a] text-[12px] font-medium px-3 py-1.5 rounded-full">
                    {categories.find((c) => c.slug === categorySlug)?.name}
                    <button onClick={() => updateUrl({ category: "" })}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {activePriceRange && (
                  <span className="flex items-center gap-1.5 bg-[#c0555a]/10 text-[#c0555a] text-[12px] font-medium px-3 py-1.5 rounded-full">
                    {activePriceRange.label}
                    <button onClick={() => updateUrl({ minPrice: "", maxPrice: "" })}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {badge && (
                  <span className="flex items-center gap-1.5 bg-[#c0555a]/10 text-[#c0555a] text-[12px] font-medium px-3 py-1.5 rounded-full">
                    {badge}
                    <button onClick={() => updateUrl({ badge: "" })}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1.5 bg-[#c0555a]/10 text-[#c0555a] text-[12px] font-medium px-3 py-1.5 rounded-full">
                    "{search}"
                    <button onClick={() => { updateUrl({ search: "" }); setSearchInput(""); }}>
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* LOADING SKELETON */}
            {loading && (
              <div className={`grid gap-5 ${
                gridCols === 4
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-3"
              }`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl aspect-square mb-3" />
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-[#f3efe8] rounded-full flex items-center justify-center mb-4 text-3xl">
                  🎁
                </div>
                <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2">
                  No gifts found
                </h3>
                <p className="text-[14px] text-[#6b6b6b] mb-6 max-w-sm">
                  Try adjusting your filters or search for something else
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-[#c0555a] text-white text-[13px] font-semibold rounded-full hover:bg-[#a84449] transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* PRODUCT GRID */}
            {!loading && products.length > 0 && (
              <div className={`grid gap-5 ${
                gridCols === 4
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-3"
              }`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={isWishlisted(product.id)}
                    onWishlistToggle={() => toggle(product.id)}
                  />
                ))}
              </div>
            )}

            {/* LOAD MORE */}
            {hasMore && !loading && (
              <div className="text-center mt-12">
                <button
                  onClick={() => fetchProducts(page + 1, true)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#c0555a] text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all duration-300 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><Loader2 size={16} className="animate-spin" /> Loading...</>
                  ) : (
                    `Load more gifts`
                  )}
                </button>
                <p className="text-[12px] text-[#aaa] mt-2">
                  Showing {products.length} of {total} gifts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PRODUCT CARD ──
function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
}: {
  product:          Product;
  isWishlisted:     boolean;
  onWishlistToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">

        {/* IMAGE */}
        <div className="relative overflow-hidden rounded-2xl bg-[#f5f0ea] aspect-square mb-3">
          <Image
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* BADGE */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-[#c0555a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          )}

          {/* CUSTOMIZABLE BADGE */}
          {product.customizable && (
            <span className="absolute top-3 right-10 bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-1 rounded-full">
              ✏️ Custom
            </span>
          )}

          {/* OUT OF STOCK */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-[#1a1a1a] text-white text-[12px] font-bold px-4 py-2 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <h3 className="text-[13px] md:text-[14px] font-medium text-[#1a1a1a] mb-1 group-hover:text-[#c0555a] transition-colors line-clamp-2 capitalize">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-[11px] text-[#aaa] mb-1">{product.category.name}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-[#1a1a1a]">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-[12px] text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="text-[11px] font-bold text-[#c0555a]">
                  {discount}% off
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* WISHLIST */}
      <button
        onClick={(e) => { e.preventDefault(); onWishlistToggle(); }}
        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
      >
        <Heart
          size={14}
          strokeWidth={2}
          className={isWishlisted ? "fill-[#c0555a] text-[#c0555a]" : "text-[#555]"}
        />
      </button>
    </div>
  );
}