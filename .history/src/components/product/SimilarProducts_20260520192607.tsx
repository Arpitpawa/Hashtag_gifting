"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { formatPrice } from "@/lib/store/cartStore";

interface Product {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
  stock:        number;
  category:     { id: number; name: string; slug: string } | null;
}

interface Props {
  currentProductId: number;
  categoryId:       number | null;
  categoryName:     string;
  tags:             string[];
}

export default function SimilarProducts({
  currentProductId,
  categoryId,
  categoryName,
  tags,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const sliderRef               = useRef<HTMLDivElement>(null);
  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        // Fetch by same category
        const params = new URLSearchParams();
        if (categoryId) params.set("category", String(categoryId));
        params.set("limit", "10");

        const res  = await fetch(`/api/products/similar?productId=${currentProductId}&categoryId=${categoryId || ""}`);
        const data = await res.json();

        if (data.products) {
          setProducts(data.products.filter((p: Product) => p.id !== currentProductId));
        }
      } catch (err) {
        console.error("Similar products error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [currentProductId, categoryId]);

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  if (loading) {
    return (
      <div className="mb-16">
        <div className="h-6 bg-[#e8e0d5] rounded-full w-44 mb-2 animate-pulse" />
        <div className="h-3 bg-[#e8e0d5] rounded-full w-32 mb-6 animate-pulse" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] animate-pulse">
              <div className="aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
              <div className="h-3.5 bg-[#e8e0d5] rounded-full mb-2" />
              <div className="h-3.5 bg-[#e8e0d5] rounded-full w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mb-16">
      {/* HEADING */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a] flex items-center gap-2">
            <Sparkles size={18} className="text-[#c0555a]" />
            You may also like
          </h2>
          <p className="text-[13px] text-[#aaa] mt-0.5">
            {categoryName ? `Handpicked from ${categoryName}` : "Handpicked gifts you'll love"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categoryId && (
            <a
              href={`/shop?category=${categoryId}`}
              className="text-[12px] text-[#c0555a] font-semibold hover:underline underline-offset-2"
            >
              View all →
            </a>
          )}
          {/* ARROWS */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <button
              onClick={scrollRight}
              className="w-9 h-9 bg-white border border-[#e8e0d5] rounded-full flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* SLIDER */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => {
          const discount = product.comparePrice
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
            : 0;

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-[200px] md:w-[220px] group relative"
            >
              <Link href={`/product/${product.slug}`} className="block">
                {/* IMAGE */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f0ea] mb-3">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="220px"
                  />

                  {/* BADGE */}
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}

                  {/* DISCOUNT */}
                  {discount > 0 && (
                    <span className="absolute top-2 right-8 bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </span>
                  )}

                  {/* OUT OF STOCK */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="bg-[#1a1a1a] text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>

                {/* INFO */}
                <p className="text-[13px] font-medium text-[#1a1a1a] group-hover:text-[#c0555a] transition-colors line-clamp-2 capitalize mb-1">
                  {product.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#1a1a1a]">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-[12px] text-gray-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
              </Link>

              {/* WISHLIST */}
              <button
                onClick={() => toggle(product.id)}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <Heart
                  size={13}
                  className={isWishlisted(product.id)
                    ? "fill-[#c0555a] text-[#c0555a]"
                    : "text-[#555]"
                  }
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}