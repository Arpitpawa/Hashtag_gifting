"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/store/cartStore";

interface ViewedProduct {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}

interface Props {
  products:  ViewedProduct[];
  currentId: number;
}

export default function RecentlyViewed({ products, currentId }: Props) {
  const others = products.filter((p) => p.id !== currentId);

  if (others.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-4xl font-bold text-[#1a1a1a]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Recently viewed
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem("hashtag-recently-viewed");
            window.location.reload();
          }}
          className="text-[12px] text-[#aaa] hover:text-[#c0555a] transition-colors"
        >
          Clear history
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {others.slice(0, 6).map((product) => {
          const discount = product.comparePrice
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
            : 0;

          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group block"
            >
              {/* IMAGE */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#f5f0ea] mb-2">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="200px"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-2 right-2 bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* INFO */}
              <p className="text-[12px] font-medium text-[#1a1a1a] group-hover:text-[#c0555a] transition-colors line-clamp-2 capitalize mb-1">
                {product.name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-[#1a1a1a]">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-[11px] text-gray-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}