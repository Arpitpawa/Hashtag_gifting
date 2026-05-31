"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  MapPin,
  Loader2,
  CheckCircle,
  ShoppingBag,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Package,
  Phone,
  Clock,
  BadgeCheck,
  Award,
  Sparkles,
  MessageSquare,
  Gift,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Expand,
} from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore, formatPrice } from "@/lib/store/cartStore";
import SimilarProducts from "./SimilarProducts";
import RecentlyViewed from "./RecentlyViewed";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";

interface CustomizationField {
  type: "text" | "textarea" | "image";
  label: string;
  maxLength?: number;
  required: boolean;
  placeholder?: string;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  badge: string | null;
  stock: number;
  customizable: boolean;
  customizationFields: CustomizationField[];
  previewTemplate: string | null;
  previewZones: any[] | null;
  tags: string[];
  category: { id: number; name: string; slug: string } | null;
  reviews: Review[];
  avgRating: number;
  related: any[];
}

const EMOJIS = [
  "❤️",
  "🎉",
  "🎂",
  "💝",
  "✨",
  "🌹",
  "💫",
  "🎁",
  "😍",
  "🥰",
  "💖",
  "🌟",
];

export default function ProductClient({ product }: { product: Product }) {
  // ── GALLERY STATE ──
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // ── PRODUCT STATE ──
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews" | "faq"
  >("description");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [pincode, setPincode] = useState("");
  const [pincodeInfo, setPincodeInfo] = useState<any>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [customization, setCustomization] = useState<Record<string, string>>(
    {},
  );
  const [custErrors, setCustErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [showEmojis, setShowEmojis] = useState<string | null>(null);
  const [savedDraft, setSavedDraft] = useState(false);
  const [showPurchased, setShowPurchased] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [countdown, setCountdown] = useState({ h: 2, m: 34, s: 12 });

  const { toggle, isWishlisted } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { addProduct, getOthers } = useRecentlyViewed();

  const wishlisted = isWishlisted(product.id);
  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;
  const isOutOfStock = product.stock === 0;
  const images =
    product.images.length > 0 ? product.images : ["/placeholder.jpg"];
  const total = images.length;

  // ── GALLERY HELPERS ──
  const prevImg = () => setActiveImg((i) => (i - 1 + total) % total);
  const nextImg = () => setActiveImg((i) => (i + 1) % total);

  // ── SCROLL THUMB INTO VIEW ──
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[activeImg] as HTMLElement;
    if (thumb)
      thumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, [activeImg]);

  // ── KEYBOARD IN LIGHTBOX ──
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, activeImg]);

  // ── LOCK BODY SCROLL IN LIGHTBOX ──
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  // ── TOUCH SWIPE ──
  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImg() : prevImg();
    setTouchStart(null);
  };

  // ── HOVER ZOOM ──
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // ── RECENTLY VIEWED ──
  useEffect(() => {
    addProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      badge: product.badge,
    });
  }, [product.id]);

  // ── COUNTDOWN ──
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((p) => {
        if (p.s > 0) return { ...p, s: p.s - 1 };
        if (p.m > 0) return { ...p, m: p.m - 1, s: 59 };
        if (p.h > 0) return { h: p.h - 1, m: 59, s: 59 };
        return p;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── PURCHASED POPUP ──
  useEffect(() => {
    const show = setTimeout(() => setShowPurchased(true), 5000);
    const hide = setTimeout(() => setShowPurchased(false), 10000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // ── STICKY CART ──
  useEffect(() => {
    const fn = () => setShowSticky(window.scrollY > 600);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── LOAD DRAFT ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`draft-${product.id}`);
      if (saved) {
        const { c } = JSON.parse(saved);
        if (c) setCustomization(c);
      }
    } catch {}
  }, [product.id]);

  const saveDraft = () => {
    localStorage.setItem(
      `draft-${product.id}`,
      JSON.stringify({ c: customization }),
    );
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/customization/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.url) setCustomization((p) => ({ ...p, photoUrl: data.url }));
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (product.customizable) {
      const errs: Record<string, string> = {};
      for (const field of product.customizationFields) {
        if (field.required && !customization[field.type]?.trim()) {
          errs[field.type] = `${field.label} is required`;
        }
      }
      if (Object.keys(errs).length > 0) {
        setCustErrors(errs);
        return;
      }
    }
    setAdding(true);
    try {
      const custData = product.customizable
        ? {
            ...customization,
            giftWrap: String(giftWrap),
            greetingCard: String(greetingCard),
          }
        : null;
      await addToCart(product.id, quantity, custData);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share)
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setCheckingPin(true);
    try {
      const res = await fetch("/api/pincode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode }),
      });
      setPincodeInfo(await res.json());
    } catch {
      setPincodeInfo({ success: false, message: "Could not check pincode" });
    } finally {
      setCheckingPin(false);
    }
  };

  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (pincodeInfo?.estimatedDays || 5));
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const recentlyViewed = getOthers(product.id);

  const faqs = [
    {
      q: "How long does customization take?",
      a: "Personalized products are crafted within 24–48 hours of order placement.",
    },
    {
      q: "Can I see a proof before production?",
      a: "Our live preview shows exactly how your product will look. Production starts after order confirmation.",
    },
    {
      q: "What if I'm not satisfied?",
      a: "We offer a 100% satisfaction guarantee. Contact us within 7 days of delivery for a replacement or refund.",
    },
    {
      q: "Do you offer bulk/corporate orders?",
      a: "Yes! We specialize in bulk corporate gifting. Contact us via WhatsApp for custom quotes.",
    },
    {
      q: "What is the return policy?",
      a: "Personalized items cannot be returned unless there is a manufacturing defect. Non-personalized items can be returned within 7 days.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      {/* ── RECENTLY PURCHASED POPUP ── */}
      {showPurchased && (
        <div className="fixed bottom-24 left-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-[#e8e0d5] max-w-[280px]">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={images[0]}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#6b6b6b]">
                Someone from Jaipur just bought
              </p>
              <p className="text-[12px] font-bold text-[#1a1a1a] truncate">
                {product.name}
              </p>
              <p className="text-[11px] text-[#c0555a]">2 minutes ago</p>
            </div>
            <button
              onClick={() => setShowPurchased(false)}
              className="text-[#aaa] hover:text-[#555]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STICKY ADD TO CART ── */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e0d5] shadow-2xl px-4 py-3 flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={images[0]}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-[#1a1a1a] truncate">
              {product.name}
            </p>
            <p className="text-[13px] font-bold text-[#c0555a]">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className="flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-50 flex-shrink-0"
          >
            {adding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShoppingBag size={14} />
            )}
            {added ? "Added!" : "Add to cart"}
          </button>
        </div>
      )}

      {/* ── FULLSCREEN LIGHTBOX ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
          onClick={() => setLightbox(false)}
        >
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <p className="text-white/60 text-[13px] truncate max-w-[60%]">
              {product.name}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-[13px]">
                {activeImg + 1} / {total}
              </span>
              <button
                onClick={() => setLightbox(false)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* MAIN IMAGE */}
          <div
            className="flex-1 flex items-center justify-center relative px-16"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {total > 1 && (
              <button
                onClick={prevImg}
                className="absolute left-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all"
              >
                <ChevronLeft size={22} className="text-white" />
              </button>
            )}
            <div className="relative w-full max-w-3xl aspect-square">
              <Image
                src={images[activeImg]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="80vw"
                priority
              />
            </div>
            {total > 1 && (
              <button
                onClick={nextImg}
                className="absolute right-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all"
              >
                <ChevronRight size={22} className="text-white" />
              </button>
            )}
          </div>

          {/* LIGHTBOX THUMBNAILS */}
          {total > 1 && (
            <div
              className="flex-shrink-0 flex justify-center gap-2 px-6 py-4 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i
                      ? "border-[#c0555a] scale-105"
                      : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#c0555a] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#c0555a] transition-colors">
            Shop
          </Link>
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

        {/* ══════════════════════════════════════════
            MAIN PRODUCT SECTION
            ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* ── LEFT — GALLERY (Confetti style) ── */}
          <div className="lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">
            {/* MAIN IMAGE + THUMBNAILS ROW */}
            <div className="flex gap-3">
              {/* VERTICAL THUMBNAILS — LEFT SIDE */}
              {total > 1 && (
                <div
                  ref={thumbsRef}
                  className="flex flex-col gap-2 flex-shrink-0 overflow-y-auto max-h-[520px] pr-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative flex-shrink-0 w-[76px] h-[76px] rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                        activeImg === i
                          ? "border-[#c0555a] shadow-md"
                          : "border-[#e8e0d5] hover:border-[#c0555a]/50"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`View ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="76px"
                      />
                      {/* ACTIVE OVERLAY */}
                      {activeImg === i && (
                        <div className="absolute inset-0 bg-[#c0555a]/10 rounded-xl" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* MAIN IMAGE */}
              <div className="flex-1 relative">
                <div
                  ref={imgRef}
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-sm cursor-zoom-in group"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setZoomed(true)}
                  onMouseLeave={() => setZoomed(false)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => setLightbox(true)}
                >
                  <Image
                    src={images[activeImg]}
                    alt={product.name}
                    fill
                    priority
                    className={`object-cover transition-all duration-300 ${zoomed ? "scale-[1.5]" : "scale-100"}`}
                    style={
                      zoomed
                        ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                        : {}
                    }
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  {/* BADGES */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {product.badge && (
                      <span className="bg-[#c0555a] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow">
                        {product.badge}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="bg-[#c4922a] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow">
                        {discount}% OFF
                      </span>
                    )}
                    {product.customizable && (
                      <span className="bg-[#1a1a1a]/80 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        ✏️ Customizable
                      </span>
                    )}
                  </div>

                  {/* EXPAND BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox(true);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <Expand size={14} className="text-[#555]" />
                  </button>

                  {/* ZOOM HINT */}
                  <div className="absolute bottom-3 left-3 bg-black/30 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <ZoomIn size={10} /> Hover to zoom
                  </div>

                  {/* ARROW NAVIGATION */}
                  {total > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImg();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-10"
                      >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImg();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-10"
                      >
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </button>
                    </>
                  )}

                  {/* DOT INDICATORS */}
                  {total > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImg(i);
                          }}
                          className={`rounded-full transition-all duration-300 ${
                            activeImg === i
                              ? "w-5 h-2 bg-[#c0555a]"
                              : "w-2 h-2 bg-white/60 hover:bg-white"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* WISHLIST + SHARE */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggle(product.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-[13px] font-semibold transition-all ${
                  wishlisted
                    ? "border-[#c0555a] bg-[#c0555a] text-white"
                    : "border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
                }`}
              >
                <Heart size={14} className={wishlisted ? "fill-white" : ""} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#e8e0d5] text-[#555] text-[13px] font-semibold hover:border-[#c0555a] hover:text-[#c0555a] transition-all"
              >
                <Share2 size={14} /> Share
              </button>
              {total > 1 && (
                <span className="ml-auto text-[12px] text-[#aaa]">
                  {activeImg + 1}/{total} photos
                </span>
              )}
            </div>
          </div>

          {/* ── RIGHT — PRODUCT INFO ── */}
          <div className="flex flex-col gap-6">
            {/* CATEGORY + NAME + BADGES */}
            <div>
              {product.category && (
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="text-[12px] text-[#c0555a] font-semibold uppercase tracking-wider hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl md:text-[28px] font-bold text-[#1a1a1a] mt-1 leading-tight capitalize">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] bg-[#f3efe8] text-[#6b6b6b] px-2.5 py-1 rounded-full border border-[#e8e0d5]">
                  <Award size={11} className="text-[#c4922a]" /> Handcrafted
                </span>
                <span className="flex items-center gap-1 text-[11px] bg-[#f3efe8] text-[#6b6b6b] px-2.5 py-1 rounded-full border border-[#e8e0d5]">
                  <BadgeCheck size={11} className="text-[#c0555a]" /> Quality
                  assured
                </span>
                {product.customizable && (
                  <span className="flex items-center gap-1 text-[11px] bg-[#c0555a]/10 text-[#c0555a] px-2.5 py-1 rounded-full border border-[#c0555a]/20">
                    <Sparkles size={11} /> Personalizable
                  </span>
                )}
              </div>

              {/* RATING */}
              {product.reviews.length > 0 && (
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="flex items-center gap-2 mt-3 group"
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= Math.round(product.avgRating)
                            ? "fill-[#f4b56a] text-[#f4b56a]"
                            : "fill-gray-200 text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[13px] text-[#c0555a] group-hover:underline">
                    {product.avgRating} ({product.reviews.length} reviews)
                  </span>
                </button>
              )}
            </div>

            {/* PRICE */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl font-bold text-[#1a1a1a]">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-[18px] text-gray-400 line-through mb-0.5">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="mb-1 bg-green-100 text-green-700 text-[13px] font-bold px-3 py-1 rounded-full">
                    Save {formatPrice(product.comparePrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* STOCK + URGENCY */}
            <div className="flex items-center gap-3 flex-wrap">
              {isOutOfStock ? (
                <span className="text-[13px] font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                  ✕ Out of stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="text-[13px] font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                  🔥 Only {product.stock} left!
                </span>
              ) : (
                <span className="text-[13px] font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  ✓ In stock
                </span>
              )}
              {!isOutOfStock && (
                <span className="text-[12px] text-[#6b6b6b] flex items-center gap-1 flex-wrap">
                  <Clock size={12} className="text-[#c0555a]" />
                  Order in
                  <span className="font-bold text-[#c0555a]">
                    {" "}
                    {String(countdown.h).padStart(2, "0")}:
                    {String(countdown.m).padStart(2, "0")}:
                    {String(countdown.s).padStart(2, "0")}{" "}
                  </span>
                  for same-day dispatch
                </span>
              )}
            </div>

            {/* ── CUSTOMIZATION ── */}
            {product.customizable &&
              product.customizationFields?.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-[#c0555a] to-[#a84449] px-5 py-3 flex items-center justify-between">
                    <p className="text-[13px] font-bold text-white flex items-center gap-2">
                      <Sparkles size={14} /> Personalize this gift
                    </p>
                    <span className="text-[11px] text-white/70">
                      * = required
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-5">
                    {product.customizationFields.map((field, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-[#1a1a1a]">
                          {field.label}
                          {field.required && (
                            <span className="text-[#c0555a] ml-1">*</span>
                          )}
                        </label>

                        {field.type === "text" && (
                          <div>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={field.maxLength}
                                placeholder={
                                  field.placeholder ||
                                  `Enter ${field.label.toLowerCase()}...`
                                }
                                value={customization[field.type] || ""}
                                onChange={(e) => {
                                  setCustomization((p) => ({
                                    ...p,
                                    [field.type]: e.target.value,
                                  }));
                                  if (custErrors[field.type])
                                    setCustErrors((p) => ({
                                      ...p,
                                      [field.type]: "",
                                    }));
                                }}
                                className={`w-full border-2 rounded-xl px-4 py-3 text-[14px] outline-none transition-all ${field.maxLength ? "pr-16" : ""} ${
                                  custErrors[field.type]
                                    ? "border-red-400"
                                    : "border-[#e8e0d5] focus:border-[#c0555a]"
                                }`}
                              />
                              {field.maxLength && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#aaa]">
                                  {(customization[field.type] || "").length}/
                                  {field.maxLength}
                                </span>
                              )}
                            </div>
                            {/* EMOJI */}
                            <div className="relative mt-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowEmojis(
                                    showEmojis === field.type
                                      ? null
                                      : field.type,
                                  )
                                }
                                className="text-[12px] text-[#aaa] hover:text-[#c0555a] transition-colors"
                              >
                                😊 Add emoji
                              </button>
                              {showEmojis === field.type && (
                                <div className="absolute top-7 left-0 z-20 bg-white rounded-xl shadow-xl border border-[#e8e0d5] p-3 flex flex-wrap gap-2 w-[220px]">
                                  {EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        setCustomization((p) => ({
                                          ...p,
                                          [field.type]:
                                            (p[field.type] || "") + emoji,
                                        }));
                                        setShowEmojis(null);
                                      }}
                                      className="text-xl hover:scale-125 transition-transform"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {custErrors[field.type] && (
                              <p className="text-[12px] text-red-500 mt-1">
                                {custErrors[field.type]}
                              </p>
                            )}
                          </div>
                        )}

                        {field.type === "textarea" && (
                          <div>
                            <textarea
                              rows={3}
                              maxLength={field.maxLength}
                              placeholder={
                                field.placeholder ||
                                `Enter ${field.label.toLowerCase()}...`
                              }
                              value={customization[field.type] || ""}
                              onChange={(e) => {
                                setCustomization((p) => ({
                                  ...p,
                                  [field.type]: e.target.value,
                                }));
                                if (custErrors[field.type])
                                  setCustErrors((p) => ({
                                    ...p,
                                    [field.type]: "",
                                  }));
                              }}
                              className={`w-full border-2 rounded-xl px-4 py-3 text-[14px] outline-none transition-all resize-none ${
                                custErrors[field.type]
                                  ? "border-red-400"
                                  : "border-[#e8e0d5] focus:border-[#c0555a]"
                              }`}
                            />
                            <div className="flex justify-between mt-1">
                              {custErrors[field.type] ? (
                                <p className="text-[12px] text-red-500">
                                  {custErrors[field.type]}
                                </p>
                              ) : (
                                <span />
                              )}
                              {field.maxLength && (
                                <p className="text-[11px] text-[#aaa]">
                                  {(customization[field.type] || "").length}/
                                  {field.maxLength}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {field.type === "image" && (
                          <div>
                            {customization.photoUrl ? (
                              <div className="flex items-center gap-3 p-3 bg-[#f3efe8] rounded-xl border border-[#c0555a]/20">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                  <Image
                                    src={customization.photoUrl}
                                    alt="Uploaded preview"
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1">
                                    <CheckCircle size={13} /> Photo ready!
                                  </p>
                                  <p className="text-[11px] text-[#aaa]">
                                    Tap X to change
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    setCustomization((p) => {
                                      const n = { ...p };
                                      delete n.photoUrl;
                                      return n;
                                    })
                                  }
                                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm"
                                >
                                  <X size={13} className="text-red-400" />
                                </button>
                              </div>
                            ) : (
                              <label
                                className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                  uploading
                                    ? "pointer-events-none opacity-60"
                                    : "hover:border-[#c0555a] hover:bg-[#c0555a]/5"
                                } ${custErrors.photoUrl ? "border-red-400" : "border-[#e8e0d5]"}`}
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handlePhotoUpload(f);
                                  }}
                                />
                                {uploading ? (
                                  <>
                                    <Loader2
                                      size={24}
                                      className="text-[#c0555a] animate-spin"
                                    />
                                    <p className="text-[13px] text-[#c0555a] font-medium">
                                      Uploading...
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-12 h-12 bg-[#c0555a]/10 rounded-full flex items-center justify-center text-2xl">
                                      📷
                                    </div>
                                    <p className="text-[13px] font-semibold text-[#1a1a1a]">
                                      Click to upload photo
                                    </p>
                                    <p className="text-[11px] text-[#aaa]">
                                      JPG, PNG, WEBP — max 8MB
                                    </p>
                                  </>
                                )}
                              </label>
                            )}
                            {custErrors.photoUrl && (
                              <p className="text-[12px] text-red-500 mt-1">
                                {custErrors.photoUrl}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* LIVE TEXT PREVIEW */}
                    {(customization.text ||
                      customization.name ||
                      customization.message ||
                      customization.textarea) && (
                      <div className="bg-[#f3efe8] rounded-xl p-4 border border-[#e8e0d5]">
                        <p className="text-[11px] text-[#aaa] mb-2 uppercase tracking-wider font-semibold">
                          ✨ Live preview
                        </p>
                        <div className="min-h-[80px] bg-white rounded-xl flex items-center justify-center border border-[#e8e0d5] px-4 py-3">
                          <div className="text-center">
                            {customization.photoUrl && (
                              <div className="relative w-14 h-14 rounded-full overflow-hidden mx-auto mb-2 border-2 border-[#c0555a]">
                                <Image
                                  src={customization.photoUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              </div>
                            )}
                            <p
                              className="text-[20px] font-semibold text-[#1a1a1a]"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              {customization.text || customization.name || ""}
                            </p>
                            {(customization.textarea ||
                              customization.message) && (
                              <p className="text-[13px] text-[#555] mt-1">
                                {customization.textarea ||
                                  customization.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={saveDraft}
                      className="flex items-center gap-1.5 text-[12px] text-[#aaa] hover:text-[#c0555a] transition-colors w-fit"
                    >
                      {savedDraft ? (
                        <>
                          <CheckCircle size={13} className="text-green-500" />{" "}
                          Draft saved!
                        </>
                      ) : (
                        "💾 Save for later"
                      )}
                    </button>
                  </div>
                </div>
              )}

            {/* GIFT ADD-ONS */}
            <div>
              <p className="text-[13px] font-bold text-[#1a1a1a] mb-3">
                🎁 Gift add-ons
              </p>
              <div className="flex flex-col gap-2">
                {[
                  {
                    checked: giftWrap,
                    onChange: setGiftWrap,
                    icon: <Gift size={15} />,
                    title: "Premium gift wrapping",
                    sub: "Beautiful box + ribbon + message card",
                    price: "+Rs. 99",
                  },
                  {
                    checked: greetingCard,
                    onChange: setGreetingCard,
                    icon: <MessageSquare size={15} />,
                    title: "Personalised greeting card",
                    sub: "Handwritten card with your message",
                    price: "+Rs. 49",
                  },
                ].map((item, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      item.checked
                        ? "border-[#c0555a] bg-[#c0555a]/5"
                        : "border-[#e8e0d5] hover:border-[#c0555a]/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="hidden"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.checked ? "border-[#c0555a] bg-[#c0555a]" : "border-[#e8e0d5]"}`}
                    >
                      {item.checked && (
                        <CheckCircle size={12} className="text-white" />
                      )}
                    </div>
                    <span
                      className={
                        item.checked ? "text-[#c0555a]" : "text-[#aaa]"
                      }
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#aaa]">{item.sub}</p>
                    </div>
                    <span className="text-[12px] font-bold text-[#c0555a] flex-shrink-0">
                      {item.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* QUANTITY */}
            {!product.customizable && (
              <div className="flex items-center gap-4">
                <span className="text-[13px] font-semibold text-[#555]">
                  Quantity
                </span>
                <div className="flex items-center border-2 border-[#e8e0d5] rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#f3efe8] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-[15px] font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#f3efe8] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* CTA BUTTONS */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold transition-all duration-300 shadow-md ${
                  isOutOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : added
                      ? "bg-green-500 text-white"
                      : "bg-[#c0555a] text-white hover:bg-[#a84449] active:scale-[0.98]"
                }`}
              >
                {adding ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Adding...
                  </>
                ) : added ? (
                  <>
                    <CheckCircle size={18} /> Added to cart!
                  </>
                ) : isOutOfStock ? (
                  "Out of stock"
                ) : (
                  <>
                    <ShoppingBag size={18} />{" "}
                    {product.customizable
                      ? "Add personalized gift to cart"
                      : "Add to cart"}
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 active:scale-[0.98]"
                >
                  ⚡ Buy now
                </Link>
              )}

              <a
                href={`https://wa.me/917665909909?text=Hi! I'm interested in ${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[14px] font-semibold bg-[#25D366] text-white hover:bg-[#1da851] transition-all duration-300"
              >
                <Phone size={16} /> Order on WhatsApp
              </a>
            </div>

            {/* PINCODE CHECKER */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-4 shadow-sm">
              <p className="text-[13px] font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-[#c0555a]" /> Check delivery
                availability
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    setPincodeInfo(null);
                  }}
                  placeholder="Enter 6-digit pincode"
                  className="flex-1 border border-[#e8e0d5] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
                />
                <button
                  onClick={checkPincode}
                  disabled={pincode.length !== 6 || checkingPin}
                  className="px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#a84449] transition-colors disabled:opacity-50"
                >
                  {checkingPin ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Check"
                  )}
                </button>
              </div>
              {pincodeInfo && (
                <div
                  className={`mt-3 p-3 rounded-xl text-[13px] font-medium flex items-start gap-2 ${
                    pincodeInfo.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {pincodeInfo.success ? (
                    <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                  ) : (
                    <X size={14} className="mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p>{pincodeInfo.message}</p>
                    {pincodeInfo.success && (
                      <p className="text-[12px] mt-0.5 opacity-80">
                        Estimated: <strong>{getDeliveryDate()}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TRUST SIGNALS */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: <Truck size={15} />,
                  title: "Free delivery",
                  sub: "On orders above Rs. 999",
                },
                {
                  icon: <ShieldCheck size={15} />,
                  title: "Secure payment",
                  sub: "100% safe & encrypted",
                },
                {
                  icon: <RefreshCw size={15} />,
                  title: "Easy returns",
                  sub: "7-day return policy",
                },
                {
                  icon: <Package size={15} />,
                  title: "Safe packaging",
                  sub: "Damage-free delivery",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#e8e0d5]"
                >
                  <span className="text-[#c0555a] flex-shrink-0">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#1a1a1a]">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#aaa]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TABS SECTION ══ */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm mb-16 overflow-hidden">
          <div
            className="flex border-b border-[#e8e0d5] overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {(["description", "specs", "reviews", "faq"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-all capitalize flex-shrink-0 ${
                    activeTab === tab
                      ? "border-[#c0555a] text-[#c0555a] bg-[#c0555a]/5"
                      : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]"
                  }`}
                >
                  {tab === "reviews" && product.reviews.length > 0
                    ? `Reviews (${product.reviews.length})`
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>

          <div className="p-6 md:p-8">
            {/* DESCRIPTION */}
            {activeTab === "description" && (
              <div className="max-w-3xl space-y-6">
                <p className="text-[15px] text-[#555] leading-relaxed">
                  {product.description ||
                    "A beautifully crafted personalized gift made with love and attention to detail."}
                </p>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-4">
                    How it works
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        n: "1",
                        e: "✏️",
                        t: "Personalize",
                        d: "Enter name, message or upload your photo",
                      },
                      {
                        n: "2",
                        e: "🎨",
                        t: "We craft it",
                        d: "Our artisans print and craft your gift with care",
                      },
                      {
                        n: "3",
                        e: "🚀",
                        t: "Fast delivery",
                        d: "Packed and delivered safely to your door",
                      },
                    ].map((s) => (
                      <div
                        key={s.n}
                        className="flex gap-3 p-4 bg-[#f3efe8] rounded-xl"
                      >
                        <div className="w-8 h-8 bg-[#c0555a] text-white rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                          {s.n}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#1a1a1a]">
                            {s.e} {s.t}
                          </p>
                          <p className="text-[12px] text-[#6b6b6b] mt-0.5">
                            {s.d}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SPECS */}
            {activeTab === "specs" && (
              <div className="max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      l: "Material",
                      v: "Premium ceramic / High-quality print",
                    },
                    { l: "Size", v: "Standard (11oz / 330ml)" },
                    { l: "Print type", v: "Full color sublimation print" },
                    { l: "Customization", v: "Photo + Text + Message" },
                    { l: "Production", v: "24–48 hours" },
                    { l: "Care", v: "Hand wash recommended" },
                    { l: "Packaging", v: "Bubble wrap + sturdy box" },
                    { l: "Warranty", v: "7-day quality guarantee" },
                  ].map((spec) => (
                    <div
                      key={spec.l}
                      className="flex gap-3 p-3 bg-[#f3efe8] rounded-xl"
                    >
                      <span className="text-[12px] font-bold text-[#c0555a] w-[100px] flex-shrink-0">
                        {spec.l}
                      </span>
                      <span className="text-[12px] text-[#555]">{spec.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div className="max-w-3xl">
                {product.reviews.length > 0 && (
                  <div className="flex items-center gap-8 mb-8 p-5 bg-[#f3efe8] rounded-2xl flex-wrap">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-[#1a1a1a]">
                        {product.avgRating}
                      </p>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            className={
                              s <= Math.round(product.avgRating)
                                ? "fill-[#f4b56a] text-[#f4b56a]"
                                : "fill-gray-200 text-gray-200"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-[12px] text-[#aaa] mt-1">
                        {product.reviews.length} reviews
                      </p>
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = product.reviews.filter(
                          (r) => r.rating === star,
                        ).length;
                        return (
                          <div
                            key={star}
                            className="flex items-center gap-2 mb-1.5"
                          >
                            <span className="text-[12px] text-[#555] w-3">
                              {star}
                            </span>
                            <Star
                              size={11}
                              className="fill-[#f4b56a] text-[#f4b56a]"
                            />
                            <div className="flex-1 h-2 bg-[#e8e0d5] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#f4b56a] rounded-full"
                                style={{
                                  width: `${(count / product.reviews.length) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-[#aaa] w-4">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {product.reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star size={32} className="text-[#e8e0d5] mx-auto mb-3" />
                    <p className="text-[15px] text-[#6b6b6b]">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {product.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-[#e8e0d5] rounded-2xl p-5 bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#c0555a] rounded-full flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                              {review.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[14px] font-semibold text-[#1a1a1a]">
                                  {review.name}
                                </p>
                                <span className="flex items-center gap-0.5 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                                  <BadgeCheck size={10} /> Verified
                                </span>
                              </div>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={11}
                                    className={
                                      s <= review.rating
                                        ? "fill-[#f4b56a] text-[#f4b56a]"
                                        : "fill-gray-200 text-gray-200"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[12px] text-[#aaa] flex-shrink-0">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#555] leading-relaxed">
                          {review.comment}
                        </p>
                        {review.images?.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e8e0d5]"
                              >
                                <Image
                                  src={img}
                                  alt="Review"
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FAQ */}
            {activeTab === "faq" && (
              <div className="max-w-2xl flex flex-col gap-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="border border-[#e8e0d5] rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === i ? null : i)
                      }
                      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#f3efe8] transition-colors"
                    >
                      <span className="text-[14px] font-semibold text-[#1a1a1a] pr-4">
                        {faq.q}
                      </span>
                      {expandedFaq === i ? (
                        <ChevronUp
                          size={16}
                          className="text-[#c0555a] flex-shrink-0"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-[#aaa] flex-shrink-0"
                        />
                      )}
                    </button>
                    {expandedFaq === i && (
                      <div className="px-5 py-4 bg-[#f3efe8] border-t border-[#e8e0d5]">
                        <p className="text-[13px] text-[#555] leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIMILAR PRODUCTS */}
        <SimilarProducts
          currentProductId={product.id}
          categoryId={product.category?.id ?? null}
          categoryName={product.category?.name ?? ""}
          tags={product.tags || []}
        />

        {/* RECENTLY VIEWED */}
        <RecentlyViewed products={recentlyViewed} currentId={product.id} />
      </div>
    </div>
  );
}
