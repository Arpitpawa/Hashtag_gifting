"use client";

import { useState, useEffect } from "react";
import { useSession }           from "next-auth/react";
import Link                     from "next/link";
import HoverImage from "@/components/shared/HoverImage";
import Image                    from "next/image";
import { Heart, ShoppingBag, X, Loader2, ArrowRight, LogIn } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore }     from "@/lib/store/cartStore";

interface WishlistProduct {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
  customizable: boolean;
}

function fp(p: number) { return `Rs. ${(p / 100).toLocaleString("en-IN")}`; }

export default function WishlistPage() {
  const { data: session }             = useSession();
  const { localIds, fetch, toggle }   = useWishlistStore();
  const { addToCart }                 = useCartStore();

  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (session) {
          // Logged in — fetch from DB
          await fetch();
          const res  = await window.fetch("/api/wishlist");
          const data = await res.json();
          const prods = Array.isArray(data) ? data.map((i: any) => i.product) : [];
          setProducts(prods);
        } else if (localIds.length > 0) {
          // Guest — fetch product details for local IDs
          const res  = await window.fetch(`/api/products?ids=${localIds.join(",")}&limit=50`);
          const data = await res.json();
          setProducts(data.products || []);
        } else {
          setProducts([]);
        }
      } catch { setProducts([]); }
      finally { setLoading(false); }
    };
    load();
  }, [session, localIds.length]);

  const handleRemove = async (productId: number) => {
    await toggle(productId);
    setProducts(p => p.filter(p => p.id !== productId));
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    if (product.customizable) {
      window.location.href = `/product/${product.slug}`;
      return;
    }
    setAdding(product.id);
    try { await addToCart(product.id, 1, null); }
    finally { setAdding(null); }
  };

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-[36px] md:text-[48px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", lineHeight: "1.15" }}
            >
              My Wishlist
            </h1>
            <p className="text-[#888] text-[13px] mt-1">
              {loading ? "Loading..." : `${products.length} saved ${products.length === 1 ? "item" : "items"}`}
            </p>
          </div>
          {!session && (
            <Link href="/login?callbackUrl=/wishlist"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#c0555a] text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all">
              <LogIn size={14} /> Log in to save
            </Link>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#c0555a]" />
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#e8e0d5]">
            <div className="w-20 h-20 bg-[#c0555a]/8 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart size={32} className="text-[#c0555a]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[22px] font-normal text-[#1a1a1a] mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Your wishlist is empty
            </h2>
            <p className="flex items-center justify-center gap-1 text-[#888] text-[14px] mb-6 max-w-xs mx-auto">
              Tap the <Heart size={13} className="inline text-[#c0555a]" /> on any product to save it here for later.
            </p>
            <Link href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white text-[13px] font-semibold rounded-full hover:bg-[#a84449] transition-colors">
              Browse products <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Products grid */}
        {!loading && products.length > 0 && (
          <>
            {/* Guest banner */}
            {!session && (
              <div className="flex items-center justify-between bg-[#c0555a]/8 border border-[#c0555a]/20 rounded-2xl px-5 py-4 mb-6">
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">Save your wishlist permanently</p>
                  <p className="text-[12px] text-[#888] mt-0.5">Log in so your items are never lost</p>
                </div>
                <Link href="/login?callbackUrl=/wishlist"
                  className="flex-shrink-0 text-[12px] font-bold text-[#c0555a] border border-[#c0555a] px-4 py-2 rounded-full hover:bg-[#c0555a] hover:text-white transition-all">
                  Log in
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden group border border-[#f0ece6] hover:shadow-lg transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Link href={`/product/${product.slug}`}>
                      {product.images?.[0] && (
                        <HoverImage images={product.images} alt={product.name} sizes="(max-width: 640px) 50vw, 25vw" />
                      )}
                    </Link>
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="text-[14px] font-medium text-[#1a1a1a] mb-2 capitalize line-clamp-2 hover:text-[#c0555a] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[14px] font-bold text-[#1a1a1a]">{fp(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-[12px] text-gray-400 line-through">{fp(product.comparePrice)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={adding === product.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#c0555a] text-white text-[12px] font-semibold rounded-xl hover:bg-[#a84449] disabled:opacity-60 transition-all"
                    >
                      {adding === product.id
                        ? <><Loader2 size={13} className="animate-spin" /> Adding...</>
                        : <><ShoppingBag size={13} /> Add to cart</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}