"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useCartStore }      from "@/lib/store/cartStore";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import type { Product }      from "@/types/product";

import ProductGallery        from "./ProductGallery";
import ProductLightbox       from "./ProductLightbox";
import ProductInfo           from "./ProductInfo";
import ProductFreebieBar     from "./ProductFreebieBar";
import ProductDelivery       from "./ProductDelivery";
import ProductCustomizer     from "./ProductCustomizer";
import ProductActions        from "./ProductActions";
import ProductAccordions     from "./ProductAccordions";
import ProductWhySection     from "./ProductWhySection";
import ProductReviewCarousel from "./ProductReviewCarousel";
import ProductTabs           from "./ProductTabs";
import ProductStickyCart     from "./ProductStickyCart";
import ProductPurchasedPopup from "./ProductPurchasedPopup";
import SimilarProducts       from "./SimilarProducts";
import RecentlyViewed        from "./RecentlyViewed";

export default function ProductClient({ product }: { product: Product }) {

  // ── Gallery ──
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox,  setLightbox]  = useState(false);

  // ── Non-customizable cart flow ──
  const [quantity,     setQuantity]     = useState(1);
  const [giftWrap,     setGiftWrap]     = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [adding,       setAdding]       = useState(false);
  const [added,        setAdded]        = useState(false);

  // ── Urgency countdown ──
  const [countdown, setCountdown] = useState({ h: 2, m: 34, s: 12 });

  const reviewsRef = useRef<HTMLDivElement>(null);

  const { addToCart }             = useCartStore();
  const { addProduct, getOthers } = useRecentlyViewed();

  const isOutOfStock = product.stock === 0;
  const images       = product.images.length > 0 ? product.images : ["/placeholder.jpg"];

  // ── Countdown ──
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

  // ── Add to cart (non-customizable) ──
  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity, null);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }, [isOutOfStock, product.id, quantity, addToCart]);

  // ── Share ──
  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  // ── Scroll to reviews ──
  const handleScrollToReviews = (_tab: "reviews") => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
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
        customizable={product.customizable}
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

      {/* ── Page ── */}
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
          <span className="text-[#1a1a1a] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ═══════════ MAIN GRID ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 mb-20">

          {/* LEFT — Gallery */}
          <ProductGallery
            images={images}
            productName={product.name}
            badge={product.badge}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            onOpenLightbox={() => setLightbox(true)}
            onShare={handleShare}
          />

          {/* RIGHT — Everything */}
          <div className="flex flex-col gap-5">

            {/* 1. Name / rating / price */}
            <ProductInfo
              product={product}
              onTabChange={handleScrollToReviews}
              onShare={handleShare}
            />

            {/* 2. Pincode + trust strip */}
            <ProductDelivery />

            {/* 3. Freebie progress bar */}
            <ProductFreebieBar currentProductPrice={product.price} />

            {/* 4. Customizable → full canvas customizer (has own CTA) */}
            {product.customizable && product.customizationFields?.length > 0 && (
              <div id="product-customizer">
                <ProductCustomizer
                  productId={product.id}
                  productName={product.name}
                  customizationFields={product.customizationFields}
                  previewTemplate={product.previewTemplate || ""}
                  previewZones={product.previewZones || []}
                  stock={product.stock}
                />
              </div>
            )}

            {/* 4b. Non-customizable → addons + qty + CTA */}
            {!product.customizable && (
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
                countdown={countdown}
              />
            )}

            {/* 5. Accordions (Product Details / Shipping / More Info) */}
            <ProductAccordions product={product} />
          </div>
        </div>

        {/* ═══════════ BELOW FOLD ═══════════ */}

        {/* Why This Gift / Make It Personal / Perfect For */}
        <ProductWhySection product={product} />

        {/* "Customers are saying" carousel */}
        {product.reviews.length > 0 && (
          <ProductReviewCarousel
            reviews={product.reviews}
            avgRating={product.avgRating}
            totalCount={product.reviews.length}
          />
        )}

        {/* Full reviews with rating breakdown */}
        <div ref={reviewsRef}>
          <ProductTabs product={product} />
        </div>

        {/* Discovery */}
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