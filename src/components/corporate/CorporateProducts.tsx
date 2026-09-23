"use client";

import { useState } from "react";
import Link from "next/link";
import HoverImage from "@/components/shared/HoverImage";
import { formatPrice } from "@/lib/store/cartStore";
import { useRealProducts } from "./useRealProducts";

// Product types that suit corporate gifting: diary sets, stationery pouches,
// men's wallets, croc/textured wallets, pens and men's travel combos.
const CORPORATE_TYPES = "01,15,11,06,13,19,12,14";
const INITIAL_SHOW = 8;

export default function CorporateProducts() {
  const [showAll, setShowAll] = useState(false);
  const { products, loading } = useRealProducts(CORPORATE_TYPES, 16, 0);
  const visibleProducts = showAll ? products : products.slice(0, INITIAL_SHOW);

  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mt-15.5 mb-10 md:mb-12">
          <h2
            className="text-[42px] md:text-[66px] font-normal text-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Corporate Gifting Solutions For Businesses
          </h2>
          <p className="text-[#6b6b6b] text-[14px] md:text-[15px]">
            Personalised diaries, pens, wallets and gift sets — with your team&apos;s names or your company branding
          </p>
        </div>

        {/* ── PRODUCT GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {loading
            ? Array.from({ length: INITIAL_SHOW }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[#e8e0d5] rounded-lg aspect-square mb-4" />
                  <div className="h-4 bg-[#e8e0d5] rounded-full w-3/4 mb-2" />
                  <div className="h-4 bg-[#e8e0d5] rounded-full w-1/3" />
                </div>
              ))
            : visibleProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg bg-[#f5f0ea] aspect-square mb-4">
                    <HoverImage
                      images={product.images}
                      alt={product.name}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div>
                    <h3 className="text-[14px] md:text-[15px] font-medium text-[#1a1a1a] mb-1 group-hover:text-[#c0555a] transition-colors duration-200 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-[14px] font-semibold text-[#1a1a1a] flex items-center gap-2 flex-wrap">
                      {formatPrice(product.price)}
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-[12px] font-normal text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
        </div>

        {/* ── LOAD MORE / SHOW LESS ── */}
        {!loading && products.length > INITIAL_SHOW && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#c0555a] bg-white text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all duration-300"
            >
              {showAll ? "Show less" : "Load more"}
            </button>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/category/corporate-gifts" className="text-[13px] font-semibold text-[#c0555a] hover:underline underline-offset-2">
            View all corporate gifts →
          </Link>
        </div>
      </div>
    </section>
  );
}
