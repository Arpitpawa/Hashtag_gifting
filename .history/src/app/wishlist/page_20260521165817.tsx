"use client";

import { useState, useEffect } from "react";
import { useSession }           from "next-auth/react";
import Link                     from "next/link";
import Image                    from "next/image";
import {
  Heart, ShoppingBag, X, Sparkles,
  Star, Loader2, ArrowRight,
} from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore, formatPrice } from "@/lib/store/cartStore";

interface WishlistItem {
  id:        number;
  productId: number;
  product: {
    id:           number;
    name:         string;
    slug:         string;
    price:        number;
    comparePrice: number | null;
    images:       string[];
    badge:        string | null;
    customizable: boolean;
  };
}

export default function WishlistPage() {
  const { data: session } = useSession();
  const { toggle }        = useWishlistStore();
  const { addToCart }     = useCartStore();

  const [items,   setItems]   = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState<number | null>(null);

  const load = () => {
    if (!session) { setLoading(false); return; }
    fetch("/api/wishlist").then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [session]);

  const handleRemove = async (productId: number) => {
    await fetch("/api/wishlist/remove", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems(p => p.filter(i => i.productId !== productId));
    toggle(productId);
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (item.product.customizable) {
      window.location.href = `/product/${item.product.slug}`;
      return;
    }
    setAdding(item.productId);
    try {
      await addToCart(item.productId, 1, null);
    } finally { setAdding(null); }
  };

  if (!session) return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border border-[#e8e0d5]">
          <Heart size={36} className="text-[#c0555a]" strokeWidth={1.5} />
        </div>
        <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-2">Your wishlist</h1>
        <p className="text-[14px] text-[#888] mb-6">Log in to save and view your favourite gifts</p>
        <Link href="/login?callbackUrl=/wishlist"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-colors">
          Log in to view wishlist <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-6">
          <Link href="/" className="hover:text-[#c0555a] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a1a1a] flex items-center gap-3">
              <Heart size={26} className="text-[#c0555a]" />
              My Wishlist
            </h1>
            {!loading && items.length > 0 && (
              <p className="text-[14px] text-[#888] mt-1">{items.length} saved gift{items.length > 1 ? "s" : ""}</p>
            )}
          </div>
          {items.length > 0 && (
            <Link href="/shop" className="text-[13px] text-[#c0555a] font-semibold hover:underline">
              Continue browsing →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
                <div className="h-3.5 bg-[#e8e0d5] rounded-full mb-2 w-3/4" />
                <div className="h-8 bg-[#e8e0d5] rounded-full mt-3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-[#e8e0d5]">
              <Heart size={40} className="text-[#e8e0d5]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-2">Nothing saved yet</h2>
            <p className="text-[14px] text-[#888] mb-8">
              Tap the heart on any product to save it here
            </p>
            <Link href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-colors">
              <ShoppingBag size={16} /> Browse gifts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map(item => {
              const p        = item.product;
              const discount = p.comparePrice
                ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;

              return (
                <div key={item.id} className="group bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
                  <Link href={`/product/${p.slug}`} className="relative aspect-square bg-[#f8f5f0] overflow-hidden block">
                    <Image src={p.images[0] || "/placeholder.jpg"} alt={p.name}
                      fill className="object-cover group-hover:scale-[1.04] transition-transform duration-500" sizes="300px" />
                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-2 right-8 bg-[#1a1a1a]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    {p.customizable && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#c0555a] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <Sparkles size={9} /> Personalizable
                      </span>
                    )}
                    {/* Remove from wishlist */}
                    <button onClick={(e) => { e.preventDefault(); handleRemove(p.id); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all z-10">
                      <X size={13} className="text-red-400" />
                    </button>
                  </Link>

                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <Link href={`/product/${p.slug}`}
                      className="text-[13px] font-semibold text-[#1a1a1a] capitalize line-clamp-2 leading-snug hover:text-[#c0555a] transition-colors flex-1">
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#1a1a1a]">{formatPrice(p.price)}</span>
                      {p.comparePrice && p.comparePrice > p.price && (
                        <span className="text-[12px] text-gray-400 line-through">{formatPrice(p.comparePrice)}</span>
                      )}
                    </div>

                    <button onClick={() => handleAddToCart(item)}
                      disabled={adding === p.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#c0555a] text-white text-[12px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-60">
                      {adding === p.id
                        ? <><Loader2 size={13} className="animate-spin" /> Adding...</>
                        : p.customizable
                        ? <><Sparkles size={13} /> Personalise & buy</>
                        : <><ShoppingBag size={13} /> Add to cart</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}