"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HoverImage from "@/components/shared/HoverImage";
import Image from "next/image";
import { Heart, Pencil, Loader2, Gift } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { formatPrice } from "@/lib/store/cartStore";
import ColorSwatchDots, { type SwatchVariant, expandToColorTiles } from "@/components/shop/ColorSwatchDots";

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
  variants?:    SwatchVariant[];
  colorParam?:  string;
}

export default function AllCategoriesProductGrid() {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { toggle, isWishlisted } = useWishlistStore();

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ sort: "newest", page: String(pageNum), limit: "16" });
      const res  = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts((prev) => (append ? [...prev, ...(data.products || [])] : (data.products || [])));
      setTotal(data.total || 0);
      setHasMore(!!data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchProducts(1, false); }, [fetchProducts]);

  return (
    <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-14 md:py-16">
      <div className="text-center mb-10">
        <h2
          className="text-[28px] md:text-[38px] font-normal text-[#1a1a1a]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em" }}
        >
          All gifts
        </h2>
        <p className="text-[13px] text-[#888] mt-2">
          {loading ? "Loading..." : `${total} personalised gifts, across every category`}
        </p>
      </div>

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
        <div className="text-center py-16">
          <Gift size={40} className="mx-auto mb-4 text-[#c0555a]" />
          <p className="text-[15px] font-bold text-[#1a1a1a]">No products yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {expandToColorTiles(products).map((tile, i) => (
              <ProductCard
                key={tile.tileKey}
                product={tile}
                index={i}
                isWishlisted={isWishlisted(tile.id)}
                onWishlistToggle={() => toggle(tile.id)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchProducts(page + 1, true)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#c0555a] text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                {loadingMore ? (
                  <><Loader2 size={16} className="animate-spin" /> Loading...</>
                ) : (
                  "Load more gifts"
                )}
              </button>
              <p className="text-[12px] text-[#aaa] mt-2">
                Showing {expandToColorTiles(products).length} gifts so far
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── PRODUCT CARD ──
function ProductCard({
  product, index = 99, isWishlisted, onWishlistToggle,
}: { product: Product; index?: number; isWishlisted: boolean; onWishlistToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const href = product.colorParam
    ? `/product/${product.slug}?color=${encodeURIComponent(product.colorParam)}`
    : `/product/${product.slug}`;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={href} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-[#f5f0ea] aspect-square mb-3">
          {(product.images?.[0] || product.images?.[1]) ? (
            <HoverImage images={product.images} alt={product.name} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" priority={index === 0} lazy={index > 3} />
          ) : (
            <div className="w-full h-full bg-[#e8e0d5] flex items-center justify-center">
              <span className="text-[#b0a898] text-[12px]">No image</span>
            </div>
          )}

          {product.badge && (
            <span className="absolute top-3 left-3 bg-[#c0555a] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          )}

          {product.customizable && (
            <span className="absolute top-3 right-10 flex items-center gap-1 bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-1 rounded-full">
              <Pencil size={9} /> Custom
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-[#1a1a1a] text-white text-[12px] font-bold px-4 py-2 rounded-full">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <ColorSwatchDots variants={product.variants || []} productSlug={product.slug} className="mb-1.5" />

      <Link href={href} className="block">
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

      <button
        onClick={(e) => { e.preventDefault(); onWishlistToggle(); }}
        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
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
