"use client";

import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "@/lib/store/wishlistStore";

interface Product {
  id: number; name: string; slug: string;
  price: number; comparePrice: number | null;
  images: string[]; badge: string | null;
  customizable: boolean;
  tags: string[];
  category?: { name: string };
}

function formatPrice(p: number) { return `Rs. ${(p / 100).toLocaleString("en-IN")}`; }
function savePercent(price: number, compare: number) {
  return `Save ${Math.round(((compare - price) / compare) * 100)}%`;
}

const CATEGORY_TAGS = [
  "Personalized",
  "Birthday",
  "Anniversary",
  "Girlfriend",
  "Boyfriend",
  "Couple",
];

export default function BestSellers() {
  const sliderRef  = useRef<HTMLDivElement>(null);
  const router     = useRouter();
  const { toggle, isWishlisted } = useWishlistStore();
  const [activeCategory, setActiveCategory] = useState("Personalized");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/products?sort=popular&limit=20&status=ACTIVE")
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  // Filter by tag or show all if no match
  const filtered = products.filter(p =>
    p.tags?.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())) ||
    p.category?.name?.toLowerCase().includes(activeCategory.toLowerCase())
  );
  const displayed = filtered.length > 0 ? filtered : products;

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 350, behavior: "smooth" });

  return (
    <section className="pt-8 md:pt-0 pb-24 md:pb-28 bg-[#f3efe8]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-8">

        {/* ── HEADING ── */}
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}>
            Best sellers
          </h2>
          <p className="text-gray-500 text-base md:text-lg mt-4">
            Tried, tested, and totally gift-worthy!
          </p>
        </div>

        {/* ── CATEGORY PILLS ── */}
        <div className="flex justify-center flex-wrap gap-3 mb-14">
          {CATEGORY_TAGS.map((cat, index) => (
            <button key={index} onClick={() => {
              setActiveCategory(cat);
              sliderRef.current?.scrollTo({ left: 0, behavior: "smooth" });
            }}
              className={`px-6 py-2.5 rounded-full border text-sm transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#c0555a] text-white border-[#c0555a] shadow-none"
                  : "border-gray-300 text-gray-700 hover:border-[#c0555a] hover:text-[#c0555a]"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── PRODUCT SLIDER ── */}
        <div className="relative">
          <button onClick={scrollLeft}
            className="hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 bg-white shadow-xl hover:bg-black hover:text-white transition-all duration-300 p-3 rounded-full z-20">
            <ChevronLeft size={22} />
          </button>

          <div ref={sliderRef} className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-2 px-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[260px] md:min-w-[300px] flex-shrink-0 animate-pulse">
                  <div className="w-full h-[300px] bg-[#e8e0d5] rounded-2xl mb-4" />
                  <div className="h-4 bg-[#e8e0d5] rounded-full w-3/4 mb-2" />
                  <div className="h-4 bg-[#e8e0d5] rounded-full w-1/2" />
                </div>
              ))
            ) : displayed.length > 0 ? (
              displayed.map((product, index) => (
                <Link href={`/product/${product.slug}`} key={product.id}
                  className="min-w-[260px] md:min-w-[300px] bg-white rounded-2xl overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex-shrink-0">
                  <div className="relative overflow-hidden">
                    <Image src={product.images[0]} alt={product.name}
                      width={600} height={600}
                      className={`w-full h-[300px] object-cover transition-opacity duration-500 ${product.images[1] ? "group-hover:opacity-0" : ""}`}
                    />
                    {product.images[1] && (
                      <Image src={product.images[1]} alt={product.name}
                        width={600} height={600}
                        className="w-full h-[300px] object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                    <button onClick={e => { e.preventDefault(); toggle(product.id); }}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md hover:bg-black hover:text-white transition-all duration-300">
                      <Heart size={16} className={isWishlisted(product.id) ? "fill-[#c0555a] text-[#c0555a]" : ""} />
                    </button>
                    {product.badge && (
                      <span className="absolute top-4 left-4 bg-black text-white text-[11px] px-3 py-1.5 rounded-full font-medium">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-2 capitalize">{product.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-bold text-black">{formatPrice(product.price)}</span>
                      {product.comparePrice && <>
                        <span className="text-gray-400 line-through text-[13px]">{formatPrice(product.comparePrice)}</span>
                        <span className="text-[#c0555a] text-[12px] font-medium">{savePercent(product.price, product.comparePrice)}</span>
                      </>}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="w-full text-center py-20 text-gray-400 text-base">
                No products found in this category.
              </div>
            )}

            {/* View All Card */}
            {!loading && (
              <div className="min-w-[220px] flex items-center justify-center flex-shrink-0">
                <button onClick={() => router.push("/shop?sort=popular")}
                  className="px-8 py-4 rounded-full border border-gray-300 text-gray-700 font-medium whitespace-nowrap hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300">
                  View All Products
                </button>
              </div>
            )}
          </div>

          <button onClick={scrollRight}
            className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 bg-white shadow-xl hover:bg-black hover:text-white transition-all duration-300 p-3 rounded-full z-20">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}