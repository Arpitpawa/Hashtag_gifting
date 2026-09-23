"use client";

import Link from "next/link";
import { Star, Award, BadgeCheck, Sparkles, Clock } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";
import type { Product } from "@/types/product";

interface Countdown { h: number; m: number; s: number; }

interface Props {
  product:   Product;
  countdown: Countdown;
  onTabChange: (tab: "reviews") => void;
}

export default function ProductInfo({ product, countdown, onTabChange }: Props) {
  const discount    = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div>
      {/* Category */}
      {product.category && (
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="text-[12px] text-[#c0555a] font-semibold uppercase tracking-wider hover:underline"
        >
          {product.category.name}
        </Link>
      )}

      {/* Name */}
      <h1 className="text-2xl md:text-[28px] font-bold text-[#1a1a1a] mt-1 leading-tight capitalize">
        {product.name}
      </h1>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] bg-[#f3efe8] text-[#6b6b6b] px-2.5 py-1 rounded-full border border-[#e8e0d5]">
          <Award size={11} className="text-[#c4922a]" /> Handcrafted
        </span>
        <span className="flex items-center gap-1 text-[11px] bg-[#f3efe8] text-[#6b6b6b] px-2.5 py-1 rounded-full border border-[#e8e0d5]">
          <BadgeCheck size={11} className="text-[#c0555a]" /> Quality assured
        </span>
        {product.customizable && (
          <span className="flex items-center gap-1 text-[11px] bg-[#c0555a]/10 text-[#c0555a] px-2.5 py-1 rounded-full border border-[#c0555a]/20">
            <Sparkles size={11} /> Personalizable
          </span>
        )}
      </div>

      {/* Rating */}
      {product.reviews.length > 0 && (
        <button
          onClick={() => onTabChange("reviews")}
          className="flex items-center gap-2 mt-3 group"
        >
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                size={14}
                className={s <= Math.round(product.avgRating)
                  ? "fill-[#f4b56a] text-[#f4b56a]"
                  : "fill-gray-200 text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[13px] text-[#c0555a] group-hover:underline">
            {product.avgRating} ({product.reviews.length} reviews)
          </span>
        </button>
      )}

      {/* Price */}
      <div className="flex items-end gap-3 flex-wrap mt-5">
        <span className="text-3xl font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
        {product.comparePrice && product.comparePrice > product.price && (
          <>
            <span className="text-[18px] text-gray-400 line-through mb-0.5">
              {formatPrice(product.comparePrice)}
            </span>
            <span className="mb-1 bg-green-100 text-green-700 text-[13px] font-bold px-3 py-1 rounded-full">
              Save {formatPrice(product.comparePrice - product.price)}
            </span>
          </>
        )}
      </div>

      {/* Stock + urgency */}
      <div className="flex items-center gap-3 flex-wrap mt-4">
        {isOutOfStock ? (
          <span className="text-[13px] font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
            ✕ Out of stock
          </span>
        ) : product.stock <= 5 ? (
          <span className="text-[13px] font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            🔥 Only {product.stock} left!
          </span>
        ) : (
          <span className="text-[13px] font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            ✓ In stock
          </span>
        )}

        {!isOutOfStock && (
          <span className="text-[12px] text-[#6b6b6b] flex items-center gap-1 flex-wrap">
            <Clock size={12} className="text-[#c0555a]" />
            Order in
            <span className="font-bold text-[#c0555a]">
              {" "}{String(countdown.h).padStart(2, "0")}:
              {String(countdown.m).padStart(2, "0")}:
              {String(countdown.s).padStart(2, "0")}{" "}
            </span>
            for same-day dispatch
          </span>
        )}
      </div>
    </div>
  );
}