"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter }                  from "next/navigation";
import Link                                            from "next/link";
import Image                                           from "next/image";
import {
  Search, SlidersHorizontal, X, Heart,
  ChevronLeft, ChevronRight, Sparkles,
  Star, Loader2,
} from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { formatPrice }      from "@/lib/store/cartStore";

interface Product {
  id: number; name: string; slug: string;
  price: number; comparePrice: number | null;
  images: string[]; badge: string | null;
  stock: number; customizable: boolean;
  avgRating: number; reviewCount: number;
}

const SORT_OPTIONS = [
  { label: "Most relevant",      value: "newest"     },
  { label: "Price: low to high", value: "price_asc"  },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Most popular",       value: "popular"    },
];

function ProductCard({ product }: { product: Product }) {
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const discount   = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  return (
    <div className="group relative bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-[#f8f5f0] overflow-hidden">
          <Image src={product.images[0] || "/placeholder.jpg"} alt={product.name}
            fill loading="lazy" className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            sizes="(max-width:768px) 50vw, 25vw" />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-2 right-8 bg-[#1a1a1a]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.customizable && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#c0555a] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <Sparkles size={9} /> Personalizable
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-[#1a1a1a] text-white text-[11px] font-bold px-3 py-1 rounded-full">Out of stock</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-[13px] font-medium text-[#1a1a1a] capitalize line-clamp-2 leading-snug mb-1.5 group-hover:text-[#c0555a] transition-colors">
            {product.name}
          </p>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} className={s <= Math.round(product.avgRating) ? "fill-[#f4b56a] text-[#f4b56a]" : "fill-[#e8e0d5] text-[#e8e0d5]"} />
              ))}
              <span className="text-[11px] text-[#aaa] ml-0.5">({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-[#1a1a1a]">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[12px] text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>
      <button onClick={() => toggle(product.id)}
        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10">
        <Heart size={13} className={wishlisted ? "fill-[#c0555a] text-[#c0555a]" : "text-[#555]"} />
      </button>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const q            = searchParams.get("q") || "";

  const [query,    setQuery]    = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [sort,     setSort]     = useState("newest");
  const [page,     setPage]     = useState(1);
  const LIMIT = 20;

  const search = useCallback(async (searchQ: string, s: string, p: number) => {
    if (!searchQ.trim()) { setProducts([]); setTotal(0); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: searchQ, sort: s, page: String(p), limit: String(LIMIT) });
      const res    = await fetch(`/api/products?${params}`);
      const data   = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch { setProducts([]); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { if (q) { setQuery(q); search(q, sort, 1); setPage(1); } }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSort = (s: string) => { setSort(s); search(q, s, 1); setPage(1); };
  const handlePage = (p: number) => { setPage(p); search(q, sort, p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* Search header */}
      <div className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-8">
          <form onSubmit={handleSearch}>
            <div className="relative max-w-2xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for personalised gifts..."
                className="w-full pl-12 pr-16 py-4 border-2 border-[#e8e0d5] focus:border-[#c0555a] rounded-full text-[15px] outline-none bg-white transition-colors"
                autoFocus
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setProducts([]); setTotal(0); }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555]">
                  <X size={16} />
                </button>
              )}
              <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#c0555a] text-white rounded-full flex items-center justify-center hover:bg-[#a84449] transition-colors">
                <Search size={16} />
              </button>
            </div>
          </form>

          {q && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <p className="text-[14px] text-[#888]">
                {loading ? "Searching..." : (
                  total > 0
                    ? <><span className="font-bold text-[#1a1a1a]">{total}</span> results for "<span className="font-bold text-[#c0555a]">{q}</span>"</>
                    : <>No results for "<span className="font-bold text-[#c0555a]">{q}</span>"</>
                )}
              </p>
              <select value={sort} onChange={e => handleSort(e.target.value)}
                className="text-[13px] border border-[#e8e0d5] rounded-full px-4 py-2 outline-none bg-white text-[#555] focus:border-[#c0555a] cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-8">
        {!q ? (
          /* Empty search state */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border border-[#e8e0d5]">
              <Search size={32} className="text-[#c0555a]" strokeWidth={1.5} />
            </div>
            <p className="text-[18px] font-bold text-[#1a1a1a] mb-2">Search for a gift</p>
            <p className="text-[14px] text-[#888] mb-8">Try "birthday mug", "photo frame", "LED lamp"...</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Birthday gifts","Anniversary","Photo mug","LED lamp","Explosion box","Cushion"].map(s => (
                <button key={s} onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
                  className="px-4 py-2 bg-white border border-[#e8e0d5] text-[13px] text-[#555] rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
                <div className="h-3.5 bg-[#e8e0d5] rounded-full mb-2 w-3/4" />
                <div className="h-3.5 bg-[#e8e0d5] rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[18px] font-bold text-[#1a1a1a] mb-2">No results found</p>
            <p className="text-[14px] text-[#888] mb-6">Try a different search term or browse our categories</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-colors">
              Browse all gifts
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => handlePage(page - 1)} disabled={page === 1}
                  className="w-9 h-9 rounded-full border border-[#e8e0d5] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all disabled:opacity-40 disabled:pointer-events-none">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc: (number|string)[], p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx-1] as number) > 1) acc.push("...");
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) => p === "..." ? (
                    <span key={`dots-${i}`} className="text-[#aaa] text-[13px] px-1">…</span>
                  ) : (
                    <button key={p} onClick={() => handlePage(p as number)}
                      className={`w-9 h-9 rounded-full text-[13px] font-semibold border transition-all ${
                        page === p ? "bg-[#c0555a] text-white border-[#c0555a]" : "bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a]"
                      }`}>
                      {p}
                    </button>
                  ))}
                <button onClick={() => handlePage(page + 1)} disabled={page === totalPages}
                  className="w-9 h-9 rounded-full border border-[#e8e0d5] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all disabled:opacity-40 disabled:pointer-events-none">
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f3efe8] flex items-center justify-center"><Loader2 size={28} className="animate-spin text-[#c0555a]" /></div>}>
    <SearchContent />
  </Suspense>;
}