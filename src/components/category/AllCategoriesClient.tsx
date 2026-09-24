"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import HoverImage from "@/components/shared/HoverImage";
import Image from "next/image";
import { Star, Sparkles, Gift, FolderTree, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";
import ColorSwatchDots, { type SwatchVariant, expandToColorTiles } from "@/components/shop/ColorSwatchDots";

export interface CategoryPick {
  id:         number;
  name:       string;
  slug:       string;
  image:      string | null;
  count:      number;
  childSlugs: string[];
}

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
  variants?:    SwatchVariant[];
  colorParam?:  string;
}

const LIMIT = 24;

export default function AllCategoriesClient({ categories }: { categories: CategoryPick[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  const trackRef = useRef<HTMLDivElement>(null);
  const [dotCount,   setDotCount]   = useState(1);
  const [activeDot,  setActiveDot]  = useState(0);

  // ── Fetch products whenever the selected category changes ──
  // Selecting a parent circle pulls in products tagged under that parent
  // AND every one of its subcategories, since products are usually tagged
  // at the subcategory level, not the parent.
  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (selected) {
      const cat   = categories.find((c) => c.slug === selected);
      const slugs = cat ? [cat.slug, ...cat.childSlugs] : [selected];
      p.set("categories", slugs.join(","));
    }
    p.set("limit", String(LIMIT));

    fetch(`/api/products?${p}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selected, categories]);

  // ── Dot pagination for the circle strip ──
  const recalcDots = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setDotCount(pages);
  }, []);

  useEffect(() => {
    recalcDots();
    window.addEventListener("resize", recalcDots);
    return () => window.removeEventListener("resize", recalcDots);
  }, [recalcDots, categories.length]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveDot(idx);
  };

  const scrollToDot = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      {/* ── DOT PAGINATION ── */}
      {dotCount > 1 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToDot(i)}
              className={`rounded-full transition-all duration-300 ${
                activeDot === i ? "w-6 h-2 bg-[#c0555a]" : "w-2 h-2 bg-[#e0dcd3] hover:bg-[#c0555a]/50"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── CATEGORY CIRCLES ── */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex items-start gap-6 md:gap-10 overflow-x-auto no-scrollbar pb-2 px-1 scroll-smooth snap-x"
      >
        {/* "All" chip */}
        <button
          onClick={() => setSelected(null)}
          className="flex flex-col items-center gap-3 flex-shrink-0 group snap-start"
        >
          <div
            className={`w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              selected === null ? "border-[#c0555a] shadow-lg" : "border-[#e8e0d5] group-hover:border-[#c0555a]"
            }`}
            style={{ backgroundColor: "#f3efe8" }}
          >
            <Gift size={28} className="text-[#c0555a]" />
          </div>
          <p className={`text-[12px] text-center font-semibold max-w-[100px] leading-snug transition-colors ${
            selected === null ? "text-[#c0555a]" : "text-[#555] group-hover:text-[#c0555a]"
          }`}>
            All
          </p>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.slug)}
            className="flex flex-col items-center gap-3 flex-shrink-0 group snap-start"
          >
            <div
              className={`relative w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden border-2 transition-all duration-300 ${
                selected === cat.slug ? "border-[#c0555a] shadow-lg" : "border-[#e8e0d5] group-hover:border-[#c0555a]"
              }`}
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="110px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f3efe8]">
                  <FolderTree size={26} className="text-[#ccc]" />
                </div>
              )}
            </div>
            <p className={`text-[12px] text-center font-medium max-w-[100px] leading-snug transition-colors ${
              selected === cat.slug ? "text-[#c0555a] font-semibold" : "text-[#555] group-hover:text-[#c0555a]"
            }`}>
              {cat.name}
            </p>
          </button>
        ))}
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="mt-10 md:mt-12">
        <p className="text-[13px] text-[#aaa] mb-4">
          {loading ? "Loading..." : `${expandToColorTiles(products).length} ${expandToColorTiles(products).length === 1 ? "product" : "products"}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
                <div className="h-3.5 bg-[#e8e0d5] rounded-full mb-2" />
                <div className="h-3.5 bg-[#e8e0d5] rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Gift size={40} className="mx-auto mb-4 text-[#c0555a]" />
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No products in this category yet</p>
            <p className="text-[13px] text-[#888]">Try another category above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {expandToColorTiles(products).map((tile) => (
              <ProductCard key={tile.tileKey} product={tile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── product card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const href = product.colorParam
    ? `/product/${product.slug}?color=${encodeURIComponent(product.colorParam)}`
    : `/product/${product.slug}`;

  return (
    <div className="group relative">
      <Link href={href} className="block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f8f5f0] mb-3">
          <HoverImage images={product.images} alt={product.name} sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw" />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-2 right-2 bg-[#1a1a1a]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              -{discount}%
            </span>
          )}
          {product.customizable && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#c0555a] text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
              <Sparkles size={9} /> Personalizable
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-[#1a1a1a] text-white text-[11px] font-bold px-3 py-1 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <ColorSwatchDots variants={product.variants || []} productSlug={product.slug} className="mb-1.5" />

      <Link href={href} className="block">
        <p className="text-[13px] font-medium text-[#1a1a1a] capitalize line-clamp-2 leading-snug mb-1.5 group-hover:text-[#c0555a] transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[12px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
