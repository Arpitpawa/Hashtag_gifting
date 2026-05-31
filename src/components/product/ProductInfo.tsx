"use client";

import Link from "next/link";
import { Star, Award, BadgeCheck, Sparkles, Share2 } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";
import type { Product } from "@/types/product";

interface Props {
  product:     Product;
  onTabChange: (tab: "reviews") => void;
  onShare:     () => void;
}

export default function ProductInfo({ product, onTabChange, onShare }: Props) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  // Derive a short tagline from the product description
  const tagline = product.description
    ? product.description.split(/[.!?]/)[0].trim().slice(0, 72)
    : product.customizable
    ? "Make it uniquely theirs — personalised with love"
    : "A beautiful gift they will always remember";

  return (
    <div className="flex flex-col gap-4">

      {/* ── ROW 1: Category + Share ── */}
      <div className="flex items-center justify-between">
        {product.category ? (
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="text-[11px] text-[#c0555a] font-bold uppercase tracking-[0.12em] hover:underline"
          >
            {product.category.name}
          </Link>
        ) : <span />}

        <button
          onClick={onShare}
          className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-[#c0555a] transition-colors"
        >
          <Share2 size={13} />
          Share
        </button>
      </div>

      {/* ── ROW 2: Tagline ── */}
      <p className="text-[14px] italic text-[#c0555a] font-medium leading-snug -mt-1">
        {tagline}
      </p>

      {/* ── ROW 3: Product name ── */}
      <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a] leading-tight capitalize -mt-1">
        {product.name}
      </h1>

      {/* ── ROW 4: Rating ── */}
      {product.reviews.length > 0 ? (
        <button
          onClick={() => onTabChange("reviews")}
          className="flex items-center gap-2 group w-fit -mt-1"
        >
          {/* Stars */}
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                size={15}
                className={
                  s <= Math.round(product.avgRating)
                    ? "fill-[#f4b56a] text-[#f4b56a]"
                    : "fill-[#e8e0d5] text-[#e8e0d5]"
                }
              />
            ))}
          </div>
          <span className="text-[13px] font-semibold text-[#1a1a1a]">
            {product.avgRating}
          </span>
          <span className="text-[13px] text-[#888] group-hover:text-[#c0555a] group-hover:underline transition-colors">
            {product.reviews.length} reviews
          </span>
        </button>
      ) : (
        <p className="text-[12px] text-[#aaa] -mt-1">No reviews yet — be the first!</p>
      )}

      {/* ── DIVIDER ── */}
      <div className="border-t border-[#e8e0d5]" />

      {/* ── ROW 5: Price ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-[16px] text-[#bbb] line-through font-medium">
            {formatPrice(product.comparePrice)}
          </span>
        )}
        <span className="text-[30px] font-bold text-[#1a1a1a] leading-none">
          {formatPrice(product.price)}
        </span>
        {discount > 0 && (
          <span className="text-[12px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            Save {discount}%
          </span>
        )}
      </div>

      {/* ── ROW 6: Badges ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b] bg-[#f3efe8] border border-[#e8e0d5] px-3 py-1.5 rounded-full">
          <Award size={11} className="text-[#c4922a]" />
          Handcrafted
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b] bg-[#f3efe8] border border-[#e8e0d5] px-3 py-1.5 rounded-full">
          <BadgeCheck size={11} className="text-[#c0555a]" />
          Quality Assured
        </span>
        {product.customizable && (
          <span className="flex items-center gap-1.5 text-[11px] text-[#c0555a] bg-[#c0555a]/8 border border-[#c0555a]/25 px-3 py-1.5 rounded-full">
            <Sparkles size={11} />
            Personalizable
          </span>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="text-[11px] text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full font-semibold">
            🔥 Only {product.stock} left
          </span>
        )}
      </div>

    </div>
  );
}