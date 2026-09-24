"use client";

import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WishlistButton from "@/components/home/WishlistButton";
import { formatPrice } from "@/lib/store/cartStore";

interface Category {
  id:   number;
  name: string;
  slug: string;
}

interface Product {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}

const LIMIT = 8;

export default function BestSellers() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  const [categories, setCategories]     = useState<Category[]>([]);
  const [activeSlug, setActiveSlug]     = useState<string | null>(null);
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);

  // Static tabs (names fixed on purpose — to be revisited with the client).
  // Not tied to categories: each tab mixes the listed product TYPES (SKU numbers):
  //   Men        = men's wallets (11-14) + men's combos (19)
  //   Women      = women's wallets (08), clutches (09,10), mobile pouch (05), women's combos (16-18)
  //   Travel     = passport covers (02,03), travel wallet organiser (04), toiletry bags (07)
  //   Stationery = pens (15), diary combos (01), stationery pouches (06)
  const TABS: { key: string; label: string; types: string }[] = [
    { key: "men",        label: "Men",        types: "11,12,13,14,19" },
    { key: "women",      label: "Women",      types: "08,09,10,05,16,17,18" },
    { key: "travel",     label: "Travel",     types: "02,03,04,07" },
    { key: "stationery", label: "Stationery", types: "15,01,06" },
  ];

  useEffect(() => {
    setCategories(TABS.map((t, i) => ({ id: i, name: t.label, slug: t.key })));
    setActiveSlug(TABS[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    const tab = TABS.find((t) => t.key === activeSlug);
    if (!tab) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/home/mix?${new URLSearchParams({ types: tab.types, limit: String(LIMIT) })}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setProducts(d.products || []); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  const selectCategory = useCallback((slug: string) => {
    setActiveSlug(slug);
    sliderRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  return (
    <section className="pt-8 md:pt-0 pb-24 md:pb-28 bg-[#f3efe8]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-14 md:mb-16">
          <h2
            className="text-[42px] md:text-[56px] font-normal text-gray-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Best sellers
          </h2>
          <p className="text-gray-500 text-base md:text-lg mt-4">
            Tried, tested, and totally gift-worthy!
          </p>
        </div>

        {/* ── CATEGORY PILLS ── */}
        {categories.length > 0 && (
          <div className="flex justify-center flex-wrap gap-3 mb-14">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.slug)}
                className={`px-6 py-2.5 rounded-full border text-sm transition-all duration-300 ${
                  activeSlug === cat.slug
                    ? "bg-[#c0555a] text-white border-[#c0555a] shadow-none"
                    : "border-gray-300 text-gray-700 hover:border-[#c0555a] hover:text-[#c0555a]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ── PRODUCT SLIDER ── */}
        <div className="relative">
          <button
            onClick={scrollLeft}
            className="hidden xl:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
           aria-label="Previous">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          <div ref={sliderRef} className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2 px-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[260px] md:min-w-[300px] bg-white rounded-2xl overflow-hidden flex-shrink-0 animate-pulse snap-start">
                  <div className="w-full h-[260px] md:h-[300px] bg-[#e8e0d5]" />
                  <div className="p-5">
                    <div className="h-4 bg-[#e8e0d5] rounded-full mb-3 w-3/4" />
                    <div className="h-4 bg-[#e8e0d5] rounded-full w-1/2" />
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => {
                const discount = product.comparePrice
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0;
                return (
                  <Link
                    href={`/product/${product.slug}`}
                    key={product.id}
                    className="w-[260px] md:w-[300px] bg-white rounded-2xl overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex-shrink-0 snap-start"
                  >
                    <div className="relative overflow-hidden bg-[#f5f0ea] aspect-square">
                      {product.images?.[0] ? (
                        <>
                          <Image src={product.images[0]} alt={product.name} fill sizes="300px"
                            className="object-cover transition-opacity duration-500 group-hover:opacity-0" />
                          <Image src={product.images[1] || product.images[0]} alt={product.name} fill sizes="300px"
                            className="object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gift size={32} className="text-[#ccc]" />
                        </div>
                      )}
                      <WishlistButton productId={product.id} className="absolute top-4 right-4" />
                      {product.badge && (
                        <span className="absolute top-4 left-4 bg-black text-white text-[11px] px-3 py-1.5 rounded-full font-medium">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-[15px] font-semibold text-gray-900 mb-2 capitalize line-clamp-2 min-h-[2.75rem]">{product.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-bold text-black">{formatPrice(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <>
                            <span className="text-gray-400 line-through text-[13px]">{formatPrice(product.comparePrice)}</span>
                            <span className="text-[#c0555a] text-[12px] font-medium">Save {discount}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="w-full text-center py-20 text-gray-400 text-base">
                No products found in this category.
              </div>
            )}

            <div className="min-w-[220px] flex items-center justify-center flex-shrink-0 snap-start">
              <button
                onClick={() => router.push("/shop?sort=popular")}
                className="px-8 py-4 rounded-full border border-[#c0555a] text-[#c0555a] font-medium whitespace-nowrap hover:bg-[#c0555a] hover:text-white transition-all duration-300"
              >
                View all products
              </button>
            </div>
          </div>

          <button
            onClick={scrollRight}
            className="hidden xl:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
           aria-label="Next">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}

