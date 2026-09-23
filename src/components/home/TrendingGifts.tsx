"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/home/WishlistButton";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/store/cartStore";

interface Product {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}

const LIMIT = 8;

export default function TrendingGifts() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  // Real newest-arrivals from the DB — previously a hardcoded list of 7
  // fake products with fabricated /product/ slugs that 404'd for anyone who
  // actually clicked one.
  useEffect(() => {
    fetch(`/api/home/mix?limit=${LIMIT}&seed=0`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" });

  return (
    <section className="pt-0 pb-16 md:pb-24 relative overflow-hidden">

      <div
        className="absolute top-0 left-1/2 w-[600px] h-[300px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: "#2f3e7a", filter: "blur(80px)", transform: "translate(-50%, -50%)" }}
      />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-12 md:mb-14">
          <span className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            People are loving right now
          </span>
          <h2
            className="text-[42px] md:text-[66px] font-normal text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Trending personalized gifts
          </h2>
          <p className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto">
            Gifts people are loving right now
          </p>
        </div>

        {/* ── SLIDER ── */}
        <div className="relative">

          <button onClick={scrollLeft}
            className="hidden xl:flex absolute -left-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]" aria-label="Previous">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2 px-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[260px] md:w-[300px] flex-shrink-0 animate-pulse snap-start">
                  <div className="h-[280px] md:h-[320px] rounded-2xl bg-[#e8e0d5]" />
                  <div className="h-4 bg-[#e8e0d5] rounded-full mt-4 mb-2 w-3/4" />
                  <div className="h-4 bg-[#e8e0d5] rounded-full w-1/2" />
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => {
                const discount = product.comparePrice
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0;
                return (
                  <div key={product.id} className="w-[260px] md:w-[300px] flex-shrink-0 group snap-start">
                    <div className="relative rounded-2xl overflow-hidden bg-white">
                      <div className="relative aspect-square bg-[#f5f0ea]">
                        {product.images?.[0] ? (
                          <>
                            <Image src={product.images[0]} alt={product.name} fill
                              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                              sizes="(max-width: 768px) 260px, 300px" />
                            <Image src={product.images[1] || product.images[0]} alt={product.name} fill
                              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              sizes="(max-width: 768px) 260px, 300px" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gift size={32} className="text-[#ccc]" />
                          </div>
                        )}
                      </div>
                      {product.badge && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                            {product.badge}
                          </span>
                        </div>
                      )}
                      <WishlistButton productId={product.id} className="absolute top-3 right-3" />
                    </div>
                    <Link href={`/product/${product.slug}`} className="block mt-4 px-1">
                      <h3 className="text-[15px] font-medium text-[#1a1a1a] mb-2 capitalize line-clamp-2 hover:text-[#2f3e7a] transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <>
                            <span className="text-[13px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                            <span className="text-[12px] font-semibold text-[#c0555a]">Save {discount}%</span>
                          </>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-16 text-gray-400 text-base">
                No products yet.
              </div>
            )}
          </div>

          <button onClick={scrollRight}
            className="hidden xl:flex absolute -right-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]" aria-label="Next">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        {/* VIEW ALL CTA */}
        <div className="flex justify-center mt-14">
          <button
            onClick={() => router.push("/shop?sort=newest")}
            className="px-8 py-4 rounded-full border border-[#c0555a] text-[#c0555a] font-medium whitespace-nowrap hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300 flex items-center gap-3"
          >
            View all trending gifts
            <span className="text-lg">→</span>
          </button>
        </div>

      </div>
    </section>
  );
}
