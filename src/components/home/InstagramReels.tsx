"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag, ExternalLink, Gift } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const INSTA = "https://www.instagram.com/hashtagifting/";

interface Product {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}

export default function InstagramReels() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  // This section previously paired invented Instagram posts (fake like
  // counts, fake captions) with a hardcoded product list whose /product/
  // links were all 404s. There's no real Instagram API integration wired up
  // yet, so rather than keep faking engagement numbers, this now showcases
  // real products with real links — the "as seen on Instagram" framing and
  // follow CTA stay, since those are genuinely your account.
  useEffect(() => {
    fetch("/api/home/mix?limit=6&seed=1")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  // pt reduced (not py) — was stacking with Testimonials' own bottom
  // padding right before it, doubling up into one oversized gap.
  return (
    <section className="pt-8 md:pt-10 pb-16 md:pb-24 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-2 font-light"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              As seen on instagram
            </span>
            <h2
              className="text-[42px] md:text-[66px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
            >
              @hashtagifting
            </h2>
          </div>
          <a href={INSTA} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#c0555a] text-[#c0555a] text-[13px] font-medium hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300 w-fit">
            <InstagramIcon />
            Follow on Instagram
          </a>
        </div>

        {/* ── SLIDER ── */}
        <div className="relative">
          <button onClick={scrollLeft}
            className="hidden xl:flex absolute -left-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-[#c0555a] hover:text-white transition-all duration-300 border border-[#e8e0d5]" aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <button onClick={scrollRight}
            className="hidden xl:flex absolute -right-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-[#c0555a] hover:text-white transition-all duration-300 border border-[#e8e0d5]" aria-label="Next">
            <ChevronRight size={18} />
          </button>

          <div ref={sliderRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2" style={{ scrollbarWidth: "none" }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[220px] md:w-[250px] animate-pulse snap-start">
                  <div className="rounded-2xl bg-[#e8e0d5] aspect-[4/5]" />
                  <div className="h-3.5 bg-[#e8e0d5] rounded-full mt-3 mb-2" />
                  <div className="h-3.5 bg-[#e8e0d5] rounded-full w-1/2" />
                </div>
              ))
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[220px] md:w-[250px] flex flex-col group snap-start">

                  {/* Image card — clicking opens Instagram */}
                  <a href={INSTA} target="_blank" rel="noopener noreferrer" aria-label="Follow Hashtag Gifting on Instagram"
                    className="relative rounded-2xl overflow-hidden bg-[#f8f5f0] aspect-[4/5] block">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="250px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift size={28} className="text-[#ccc]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                    {/* Instagram badge */}
                    <div className="absolute top-3 left-3">
                      <div className="w-7 h-7 rounded-xl border border-[#c0555a] bg-white text-[#c0555a] flex items-center justify-center shadow-md">
                        <InstagramIcon />
                      </div>
                    </div>

                    {/* Tag — real badge if this product has one */}
                    {product.badge && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold text-white bg-[#c0555a] px-2 py-0.5 rounded-full">{product.badge}</span>
                      </div>
                    )}
                  </a>

                  {/* Product info — gap-3 (was gap-2) so the "Shop this"
                      button gets real breathing room below the price
                      instead of sitting right under it. */}
                  <div className="mt-3 flex flex-col gap-3">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug line-clamp-1 capitalize">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-[12px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>
                    <Link href={`/product/${product.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[#c0555a] text-[#c0555a] text-[12px] font-semibold hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300">
                      <ShoppingBag size={13} /> Shop this
                    </Link>
                  </div>
                </div>
              ))
            )}

            {/* View all card */}
            <div className="flex-shrink-0 w-[220px] md:w-[250px] snap-start">
              <a href={INSTA} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full rounded-2xl border-2 border-dashed border-[#e8e0d5] hover:border-[#c0555a] transition-all duration-300 gap-4 p-6 group min-h-[340px]">
                <div className="w-14 h-14 rounded-2xl border border-[#c0555a] bg-white text-[#c0555a] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <InstagramIcon />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">See more on</p>
                  <p className="text-[14px] font-bold text-[#c0555a]">@hashtagifting</p>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#c0555a]">
                  <ExternalLink size={13} /> Open Instagram
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
