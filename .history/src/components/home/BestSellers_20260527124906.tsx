"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link  from "next/link";
import { Heart, ChevronLeft, ChevronRight, Star, Sparkles } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";

interface Product {
  id: number; name: string; slug: string;
  price: number; comparePrice: number | null;
  images: string[]; badge: string | null;
  customizable: boolean; avgRating: number; reviewCount: number;
}

function formatPrice(p: number) { return `Rs. ${(p/100).toLocaleString("en-IN")}`; }

function ProductCard({ p }: { p: Product }) {
  const { toggle, isWishlisted } = useWishlistStore();
  const [hovered, setHovered]    = useState(false);
  const liked   = isWishlisted(p.id);
  const discount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;

  return (
    <div className="flex-shrink-0 w-[220px] md:w-[240px] group relative">
      <Link href={`/product/${p.slug}`}>
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f8f5f0] mb-3"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <Image src={hovered && p.images[1] ? p.images[1] : p.images[0]} alt={p.name}
            fill className="object-cover transition-all duration-500 group-hover:scale-[1.04]" sizes="260px" />
          {p.badge && (
            <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{p.badge}</span>
          )}
          {discount > 0 && (
            <span className="absolute top-2 right-8 bg-[#1a1a1a]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {p.customizable && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 text-[#c0555a] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <Sparkles size={9} /> Personalizable
            </span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-[#1a1a1a] capitalize line-clamp-2 mb-1 group-hover:text-[#c0555a] transition-colors">{p.name}</p>
        {p.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1">
            {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= Math.round(p.avgRating) ? "fill-[#f4b56a] text-[#f4b56a]" : "fill-[#e8e0d5] text-[#e8e0d5]"} />)}
            <span className="text-[10px] text-[#aaa]">({p.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#1a1a1a]">{formatPrice(p.price)}</span>
          {p.comparePrice && <span className="text-[12px] text-gray-400 line-through">{formatPrice(p.comparePrice)}</span>}
        </div>
      </Link>
      <button onClick={() => toggle(p.id)}
        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
        <Heart size={13} className={liked ? "fill-[#c0555a] text-[#c0555a]" : "text-[#555]"} />
      </button>
    </div>
  );
}

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products?sort=popular&limit=12&status=ACTIVE")
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (loading) return (
    <section className="py-12 px-4 md:px-10">
      <div className="max-w-[1450px] mx-auto">
        <div className="h-8 w-48 bg-[#e8e0d5] rounded-full mb-6 animate-pulse" />
        <div className="flex gap-4">
          {Array.from({length:5}).map((_,i) => (
            <div key={i} className="flex-shrink-0 w-[220px]">
              <div className="aspect-square rounded-2xl bg-[#e8e0d5] animate-pulse mb-3" />
              <div className="h-4 bg-[#e8e0d5] rounded-full animate-pulse mb-2" />
              <div className="h-4 bg-[#e8e0d5] rounded-full animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!products.length) return null;

  return (
    <section className="py-12 px-4 md:px-10">
      <div className="max-w-[1450px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[26px] md:text-[32px] font-bold text-[#1a1a1a]">Best sellers</h2>
            <p className="text-[13px] text-[#888] mt-0.5">Most loved by our customers</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/shop?sort=popular" className="text-[13px] text-[#c0555a] font-semibold hover:underline">View all →</Link>
            <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full border border-[#e8e0d5] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full border border-[#e8e0d5] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}