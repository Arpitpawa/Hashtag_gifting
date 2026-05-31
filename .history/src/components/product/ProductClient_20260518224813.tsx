"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, Share2, ShieldCheck, Truck,
  RefreshCw, Star, ChevronLeft, ChevronRight,
  MapPin, Loader2, CheckCircle, ShoppingBag,
  Minus, Plus
} from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore, formatPrice } from "@/lib/store/cartStore";
import ProductCustomizer from "./ProductCustomizer";
import SimilarProducts from "./SimilarProducts";
import RecentlyViewed from "./RecentlyViewed";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";

interface Product {
  id:                  number;
  name:                string;
  slug:                string;
  description:         string;
  price:               number;
  comparePrice:        number | null;
  images:              string[];
  badge:               string | null;
  stock:               number;
  customizable:        boolean;
  customizationFields: any[];
  previewTemplate:     string | null;
  previewZones:        any[] | null;
  tags:                string[];
  category:            { id: number; name: string; slug: string } | null;
  reviews:             Review[];
  avgRating:           number;
  related:             RelatedProduct[];
}

interface Review {
  id:        number;
  name:      string;
  rating:    number;
  comment:   string;
  images:    string[];
  createdAt: string;
}

interface RelatedProduct {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  badge:        string | null;
}

export default function ProductClient({ product }: { product: Product }) {
  const [activeImage,  setActiveImage]  = useState(0);
  const [quantity,     setQuantity]     = useState(1);
  const [pincode,      setPincode]      = useState("");
  const [pincodeInfo,  setPincodeInfo]  = useState<any>(null);
  const [checkingPin,  setCheckingPin]  = useState(false);
  const [adding,       setAdding]       = useState(false);
  const [added,        setAdded]        = useState(false);
  const [activeTab,    setActiveTab]    = useState<"description" | "reviews">("description");

  const { toggle, isWishlisted }  = useWishlistStore();
  const { addToCart }             = useCartStore();
  const { addProduct, getOthers } = useRecentlyViewed();

  const wishlisted   = isWishlisted(product.id);
  const discount     = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isOutOfStock = product.stock === 0;

  // ── TRACK RECENTLY VIEWED ──
  useEffect(() => {
    addProduct({
      id:           product.id,
      name:         product.name,
      slug:         product.slug,
      price:        product.price,
      comparePrice: product.comparePrice,
      images:       product.images,
      badge:        product.badge,
    });
  }, [product.id]);

  const recentlyViewed = getOthers(product.id);

  // ── PINCODE CHECK ──
  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setCheckingPin(true);
    try {
      const res  = await fetch("/api/pincode", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pincode }),
      });
      const data = await res.json();
      setPincodeInfo(data);
    } catch {
      setPincodeInfo({ success: false, message: "Could not check pincode" });
    } finally {
      setCheckingPin(false);
    }
  };

  // ── ADD TO CART ──
  const handleAddToCart = async () => {
    if (isOutOfStock || product.customizable) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity, null);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch {
      console.error("Add to cart failed");
    } finally {
      setAdding(false);
    }
  };

  // ── SHARE ──
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-8">
          <Link href="/" className="hover:text-[#c0555a] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#c0555a] transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-[#c0555a] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* ── MAIN PRODUCT SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* ── LEFT — IMAGE GALLERY ── */}
          <div className="flex gap-4">
            {/* THUMBNAILS */}
            {product.images.length > 1 && (
              <div className="flex flex-col gap-2 w-[80px] flex-shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-[80px] h-[80px] rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? "border-[#c0555a]" : "border-transparent hover:border-[#e8e0d5]"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {/* MAIN IMAGE */}
            <div className="flex-1 relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f0ea]">
                <Image
                  src={product.images[activeImage] || product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-[#c0555a] text-white text-[12px] font-bold px-3 py-1.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => (i + 1) % product.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* WISHLIST + SHARE */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => toggle(product.id)}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
                >
                  <Heart size={16} className={wishlisted ? "fill-[#c0555a] text-[#c0555a]" : "text-[#555]"} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
                >
                  <Share2 size={16} className="text-[#555]" />
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT — PRODUCT INFO ── */}
          <div className="flex flex-col gap-5">
            {/* CATEGORY + NAME */}
            <div>
              {product.category && (
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="text-[12px] text-[#c0555a] font-semibold uppercase tracking-wider hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mt-1 leading-tight capitalize">
                {product.name}
              </h1>

              {/* RATING */}
              {product.avgRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(product.avgRating)
                          ? "fill-[#f4b56a] text-[#f4b56a]"
                          : "fill-gray-200 text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[13px] text-[#6b6b6b]">
                    {product.avgRating} ({product.reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* PRICE */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#1a1a1a]">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-[18px] text-gray-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="bg-[#c0555a] text-white text-[13px] font-bold px-3 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* STOCK */}
            <div>
              {isOutOfStock ? (
                <span className="text-[13px] font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                  Out of stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="text-[13px] font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full">
                  Only {product.stock} left!
                </span>
              ) : (
                <span className="text-[13px] font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  ✓ In stock
                </span>
              )}
            </div>

            {/* ── CUSTOMIZATION + LIVE PREVIEW ── */}
            {product.customizable && product.customizationFields?.length > 0 ? (
              <div className="border border-[#e8e0d5] rounded-2xl overflow-hidden">
                {/* HEADER */}
                <div className="bg-[#f3efe8] px-5 py-3 border-b border-[#e8e0d5]">
                  <p className="text-[13px] font-bold text-[#1a1a1a] flex items-center gap-2">
                    ✏️ Personalize this gift
                    <span className="text-[11px] font-normal text-[#6b6b6b]">
                      — preview updates live as you type
                    </span>
                  </p>
                </div>

                <div className="p-5">
                  {product.previewTemplate && product.previewZones?.length ? (
                    /* ── LIVE PREVIEW CUSTOMIZER ── */
                    <ProductCustomizer
                      productId={product.id}
                      productName={product.name}
                      customizationFields={product.customizationFields}
                      previewTemplate={product.previewTemplate}
                      previewZones={product.previewZones}
                      price={product.price}
                      comparePrice={product.comparePrice ?? undefined}
                      stock={product.stock}
                    />
                  ) : (
                    /* ── SIMPLE CUSTOMIZER (no preview) ── */
                    <SimpleCustomizer
                      productId={product.id}
                      customizationFields={product.customizationFields}
                      stock={product.stock}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* ── DIRECT ADD TO CART ── */
              <div className="flex flex-col gap-4">
                {/* QUANTITY */}
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-semibold text-[#555]">Quantity</span>
                  <div className="flex items-center border-2 border-[#e8e0d5] rounded-full overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#f3efe8] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-[14px] font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#f3efe8] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* ADD TO CART */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-semibold transition-all duration-300 ${
                    isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : added
                      ? "bg-green-500 text-white"
                      : "bg-[#c0555a] text-white hover:bg-[#a84449]"
                  }`}
                >
                  {adding ? (
                    <><Loader2 size={18} className="animate-spin" /> Adding...</>
                  ) : added ? (
                    <><CheckCircle size={18} /> Added to cart!</>
                  ) : isOutOfStock ? (
                    "Out of stock"
                  ) : (
                    <><ShoppingBag size={18} /> Add to cart</>
                  )}
                </button>

                {/* BUY NOW */}
                {!isOutOfStock && (
                  <Link
                    href="/checkout"
                    onClick={() => addToCart(product.id, quantity, null)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-semibold border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
                  >
                    Buy now
                  </Link>
                )}
              </div>
            )}

            {/* PINCODE CHECKER */}
            <div className="border border-[#e8e0d5] rounded-2xl p-4">
              <p className="text-[13px] font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-[#c0555a]" />
                Check delivery availability
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeInfo(null); }}
                  placeholder="Enter 6-digit pincode"
                  className="flex-1 border border-[#e8e0d5] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
                />
                <button
                  onClick={checkPincode}
                  disabled={pincode.length !== 6 || checkingPin}
                  className="px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#a84449] transition-colors disabled:opacity-50"
                >
                  {checkingPin ? <Loader2 size={14} className="animate-spin" /> : "Check"}
                </button>
              </div>
              {pincodeInfo && (
                <p className={`text-[12px] font-medium mt-2 ${pincodeInfo.success ? "text-green-600" : "text-red-500"}`}>
                  {pincodeInfo.message}
                </p>
              )}
            </div>

            {/* TRUST SIGNALS */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck size={18} />,       text: "Free delivery above Rs. 999" },
                { icon: <ShieldCheck size={18} />, text: "100% secure payments" },
                { icon: <RefreshCw size={18} />,   text: "Easy returns" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 text-center p-3 bg-[#f3efe8] rounded-xl">
                  <span className="text-[#c0555a]">{item.icon}</span>
                  <p className="text-[11px] text-[#6b6b6b] leading-tight">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DESCRIPTION + REVIEWS TABS ── */}
        <div className="mb-16">
          <div className="flex gap-0 border-b border-[#e8e0d5] mb-8">
            {(["description", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[14px] font-semibold border-b-2 transition-all capitalize ${
                  activeTab === tab
                    ? "border-[#c0555a] text-[#c0555a]"
                    : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]"
                }`}
              >
                {tab}
                {tab === "reviews" && product.reviews.length > 0 && (
                  <span className="ml-1.5 text-[11px] bg-[#c0555a] text-white px-1.5 py-0.5 rounded-full">
                    {product.reviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="max-w-3xl">
              <p className="text-[15px] text-[#555] leading-relaxed whitespace-pre-line">
                {product.description || "No description available."}
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl">
              {product.reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[15px] text-[#6b6b6b]">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border border-[#e8e0d5] rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[#1a1a1a]">{review.name}</p>
                          <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4,5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                className={s <= review.rating ? "fill-[#f4b56a] text-[#f4b56a]" : "fill-gray-200 text-gray-200"}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[12px] text-[#aaa]">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                      </div>
                      <p classN