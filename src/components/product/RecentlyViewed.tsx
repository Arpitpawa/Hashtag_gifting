"use client";

import { useRef } from "react";
import Link from "next/link";
import HoverImage from "@/components/shared/HoverImage";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";

interface ViewedProduct {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}

// "Recently viewed" is a full product snapshot (incl. image URL) cached
// straight in the visitor's own localStorage indefinitely — see
// useRecentlyViewed.ts. It never gets revalidated against the DB, so if a
// product is later deleted, or its image host is ever removed from
// next.config's remotePatterns (like confettigifts.in was), next/image
// hard-crashes the whole page for anyone who has that stale entry cached,
// not just shows a broken image. This guard makes sure we only ever hand
// next/image a URL from a host we know is currently allowed — anything
// else (leftover dummy data, a domain we've since delisted, etc.) quietly
// falls back to the placeholder instead of taking the page down.
const SAFE_IMAGE_HOSTS = ["res.cloudinary.com"];
function safeImageSrc(url?: string): string {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("/")) return url; // local public asset
  try {
    return SAFE_IMAGE_HOSTS.includes(new URL(url).hostname) ? url : "/placeholder.jpg";
  } catch {
    return "/placeholder.jpg";
  }
}

interface Props {
  products:  ViewedProduct[];
  currentId: number;
}

export default function RecentlyViewed({ products, currentId }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { toggle, isWishlisted } = useWishlistStore();

  const others = products.filter((p) => p.id !== currentId).slice(0, 10);
  if (others.length === 0) return null;

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  const clearHistory = () => {
    localStorage.removeItem("hashtag-recently-viewed");
    window.location.reload();
  };

  return (
    <div className="mb-16">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a] flex items-center gap-2">
            <Clock size={18} className="text-[#c0555a]" />
            Recently viewed
          </h2>
          <p className="text-[13px] text-[#aaa] mt-0.5">Pick up where you left off</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Clear */}
          <button
            onClick={clearHistory}
            className="text-[12px] text-[#aaa] hover:text-[#c0555a] transition-colors underline-offset-2 hover:underline"
          >
            Clear history
          </button>

          {/* Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
             aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
             aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SLIDER ── */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {others.map((product) => {
          const discount = product.comparePrice
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
            : 0;
          const wishlisted = isWishlisted(product.id);

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-[180px] md:w-[200px] group relative"
            >
              <Link href={`/product/${product.slug}`} className="block">

                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f0ea] mb-3">
                  <HoverImage images={[safeImageSrc(product.images[0]), ...(product.images[1] ? [safeImageSrc(product.images[1])] : [])]} alt={product.name} sizes="200px" />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Discount */}
                  {discount > 0 && (
                    <span className="absolute top-2 right-8 bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </span>
                  )}

                  {/* Viewed indicator */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#555] px-2 py-0.5 rounded-full">
                      <Clock size={9} /> Viewed
                    </span>
                  </div>
                </div>

                {/* Info */}
                <p className="text-[13px] font-medium text-[#1a1a1a] group-hover:text-[#c0555a] transition-colors line-clamp-2 capitalize leading-snug mb-1.5">
                  {product.name}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#1a1a1a]">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
              </Link>

              {/* Wishlist button */}
              <button
                onClick={() => toggle(product.id)}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <Heart
                  size={13}
                  className={wishlisted ? "fill-[#c0555a] text-[#c0555a]" : "text-[#555]"}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}