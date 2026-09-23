"use client";

import Link from "next/link";
import { Star, Award, BadgeCheck, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";
import type { Product } from "@/types/product";

interface Props {
  product:     Product;
  onTabChange: (tab: "reviews") => void;
}

export default function ProductInfo({ product, onTabChange }: Props) {
  const discount     = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-3">

      {/* Category */}
      {product.category && (
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="text-[11px] text-[#c0555a] font-bold uppercase tracking-widest hover:underline w-fit"
        >
          {product.category.name}
        </Link>
      )}

      {/* Product name */}
      <h1 className="text-[26px] md:text-[30px] font-bold text-[#1a1a1a] leading-tight capitalize">
        {product.name}
      </h1>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
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
          className="flex items-center gap-2 group w-fit"
        >
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={14}
                className={s <= Math.round(product.avgRating)
                  ? "fill-[#f4b56a] text-[#f4b56a]"
                  : "fill-gray-200 text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[13px] text-[#c0555a] group-hover:underline font-medium">
            {product.avgRating} ({product.reviews.length} reviews)
          </span>
        </button>
      )}

      {/* Price block */}
      <div className="flex items-end gap-3 flex-wrap">
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-[16px] text-gray-400 line-through mb-0.5">
            {formatPrice(product.comparePrice)}
          </span>
        )}
        <span className="text-[28px] font-bold text-[#1a1a1a]">
          {formatPrice(product.price)}
        </span>
        {discount > 0 && (
          <span className="mb-1 bg-[#c0555a] text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full">
            Save {discount}%
          </span>
        )}
      </div>

      {/* COD note */}
      <p className="text-[12px] text-[#888]">
        or Pay <span className="font-semibold text-[#1a1a1a]">{formatPrice(Math.ceil(product.price / 2))}</span> now
        and the rest on delivery using{" "}
        <span className="text-[#c0555a] font-semibold">Partial COD</span> at checkout
      </p>
    </div>
  );
}