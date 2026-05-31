"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useWishlistStore }  from "@/lib/store/wishlistStore";
import { useCartStore }      from "@/lib/store/cartStore";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import type { Product }      from "@/types/product";

import ProductGallery       from "./ProductGallery";
import ProductLightbox      from "./ProductLightbox";
import ProductInfo          from "./ProductInfo";
import ProductCustomizer    from "./ProductCustomizer";
import ProductActions       from "./ProductActions";
import ProductDelivery      from "./ProductDelivery";
import ProductTabs          from "./ProductTabs";
import ProductStickyCart    from "./ProductStickyCart";
import ProductPurchasedPopup from "./ProductPurchasedPopup";
import SimilarProducts      from "./SimilarProducts";
import RecentlyViewed       from "./RecentlyViewed";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "description" | "specs" | "reviews" | "faq";

// ─── Component ───────────────────────────────────────────────────────────────
export default function ProductClient({ product }: { product: Product }) {

  // ── Gallery ──
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox,  setLightbox]  = useState(false);

  // ── Cart ──
  const [quantity,      setQuantity]      = useState(1);
  const [giftWrap,      setGiftWrap]      = useState(false);
  const [greetingCard,  setGreetingCard]  = useState(false);
  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [custErrors,    setCustErrors]    = useState<Record<string, string>>({});
  const [adding,        setAdding]        = useState(false);
  const [added,         setAdded]         = useState(false);

  // ── Urgency ──
  const [countdown, setCountdown] = useState({ h: 2, m: 34, s: 12 });

  // ── Tabs (for rating → review tab jump) ──
  const tabSetterRef = useRef<((t: Tab) => void) | null>(null);

  const { addToCart }             = useCartStore();
  const { addProduct, getOthers } = useRecentlyViewed();

  const isOutOfStock = product.stock === 0;
  const images       = product.images.length > 0 ? product.images : ["/placeholder.jpg"];

  // ── Countdown timer ──
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

  // ── Recently viewed ──
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

  // ── Add to cart ──
  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) return;

    // Validate customization fields
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
        ? { ...customization, giftWrap: String(giftWrap), greetingCard: String(greetingCard) }
        : null;
      await addToCart(product.id, quantity, custData);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }, [isOutOfStock, product, customization, giftWrap, greetingCard, quantity, addToCart]);

  // ── Share ──
  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  // ── Jump to reviews tab ──
  const handleTabChange = (tab: "reviews") => {
    tabSetterRef.current?.(tab);
    document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth" });
  };

  const recentlyViewed = getOthers(product.id);

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── Overlays ── */}
      <ProductPurchasedPopup images={images} productName={product.name} />

      <ProductStickyCart
        images={images}
        productName={product.name}
        price={product.price}
        adding={adding}
        added={added}
        isOutOfStock={isOutOfStock}
        onAddToCart={handleAddToCart}
      />

      <ProductLightbox
        open={lightbox}
        onClose={() => setLightbox(false)}
        images={images}
        activeImg={activeImg}
        setActiveImg={setActiveImg}
        productName={product.name}
      />

      {/* ── Page content ── */}
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-8 flex-wrap">
          <Link href="/"     className="hover:text-[#c0555a] transition-colors">Home</Link>
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

        {/* ── Main product grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* Left — Gallery */}
          <ProductGallery
            images={images}
            productName={product.name}
            badge={product.badge}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            onOpenLightbox={() => setLightbox(true)}
            onShare={handleShare}
          />

          {/* Right — Info + actions */}
          <div className="flex flex-col gap-6">
            <ProductInfo
              product={product}
              countdown={countdown}
              onTabChange={handleTabChange}
            />

            {product.customizable && product.customizationFields?.length > 0 && (
              <ProductCustomizer
                fields={product.customizationFields}
                customization={customization}
                setCustomization={setCustomization}
                custErrors={custErrors}
                setCustErrors={setCustErrors}
                productId={product.id}
              />
            )}

            <ProductActions
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              giftWrap={giftWrap}
              setGiftWrap={setGiftWrap}
              greetingCard={greetingCard}
              setGreetingCard={setGreetingCard}
              adding={adding}
              added={added}
              isOutOfStock={isOutOfStock}
              onAddToCart={handleAddToCart}
            />

            <ProductDelivery />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div id="product-tabs">
          <ProductTabs
            product={product}
            onTabRef={(setter) => { tabSetterRef.current = setter; }}
          />
        </div>

        {/* ── Discovery ── */}
        <SimilarProducts
          currentProductId={product.id}
          categoryId={product.category?.id ?? null}
          categoryName={product.category?.name ?? ""}
          tags={product.tags || []}
        />

        <RecentlyViewed
          products={recentlyViewed}
          currentId={product.id}
        />
      </div>
    </div>
  );
}
