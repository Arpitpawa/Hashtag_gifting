"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { StoreButton } from "@/components/ui/StoreButton";
import { useCartStore }      from "@/lib/store/cartStore";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import type { Product, ProductVariant, VariantGroups } from "@/types/product";

import ProductGallery         from "./ProductGallery";
import ProductLightbox        from "./ProductLightbox";
import ProductInfo            from "./ProductInfo";
import ProductFreebieBar      from "./ProductFreebieBar";
import ProductDelivery        from "./ProductDelivery";
import ProductCustomizer      from "./ProductCustomizer";
import ProductActions         from "./ProductActions";
import { NotifyMeButton }    from "./ProductActions";
import ProductAccordions      from "./ProductAccordions";
import ProductTabs            from "./ProductTabs";
import LivePreviewModal       from "./LivePreviewModal";
import CharmSelector          from "./CharmSelector";
import ProductStickyCart      from "./ProductStickyCart";
import ProductPurchasedPopup  from "./ProductPurchasedPopup";
import SimilarProducts        from "./SimilarProducts";
import RecentlyViewed         from "./RecentlyViewed";
import ProductVariantSelector from "./ProductVariantSelector";

// ── Group flat variant array into { Color: [...], Size: [...] } ──
function groupVariants(variants: ProductVariant[]): VariantGroups {
  return variants.reduce<VariantGroups>((acc, v) => {
    if (!acc[v.groupName]) acc[v.groupName] = [];
    acc[v.groupName].push(v);
    return acc;
  }, {});
}

// ── Pick default variant for each group ──
function defaultSelections(groups: VariantGroups): Record<string, ProductVariant> {
  const sel: Record<string, ProductVariant> = {};
  for (const [groupName, options] of Object.entries(groups)) {
    const def = options.find((v) => v.isDefault) ?? options.find((v) => v.stock > 0) ?? options[0];
    if (def) sel[groupName] = def;
  }
  return sel;
}

export default function ProductClient({ product, initialColor }: { product: Product; initialColor?: string }) {

  // ── Variants ──
  const variantGroups   = useMemo(() => groupVariants(product.variants ?? []), [product.variants]);
  const hasVariants     = Object.keys(variantGroups).length > 0;

  // Arriving from a color-swatch dot on a shop/category/search card (?color=Red)
  // preselects that option instead of the usual isDefault/in-stock/first fallback.
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>(() => {
    const base = defaultSelections(variantGroups);
    if (initialColor) {
      const colorGroupName = Object.keys(variantGroups).find((g) => g.toLowerCase() === "color");
      if (colorGroupName) {
        const match = variantGroups[colorGroupName].find(
          (v) => v.optionName.toLowerCase() === initialColor.toLowerCase()
        );
        if (match) return { ...base, [colorGroupName]: match };
      }
    }
    return base;
  });

  // Currently active variant (only meaningful if single group; for multi-group use all selections)
  const activeVariant: ProductVariant | null = useMemo(() => {
    const vals = Object.values(selectedVariants);
    return vals.length === 1 ? vals[0] : null;
  }, [selectedVariants]);

  // The variant whose OWN stock/price actually govern this purchase —
  // previously only ever used for display (effectiveStock/displayPrice
  // below); now also threaded through to cart/checkout so the server can
  // enforce the same stock limit and price it's already showing on screen,
  // instead of only ever checking the parent product's stock/price.
  const primaryVariantId: number | null = useMemo(() => {
    const vals = Object.values(selectedVariants);
    return vals[0]?.id ?? null;
  }, [selectedVariants]);

  // Derived price — use variant price if set, else base product price
  const displayPrice = useMemo(() => {
    if (activeVariant?.price != null) return activeVariant.price;
    // For multi-group: use the first group's variant price if available
    const firstVar = Object.values(selectedVariants)[0];
    if (firstVar?.price != null) return firstVar.price;
    return product.price;
  }, [activeVariant, selectedVariants, product.price]);

  const displayComparePrice = useMemo(() => {
    if (activeVariant?.comparePrice != null) return activeVariant.comparePrice;
    return product.comparePrice;
  }, [activeVariant, product.comparePrice]);

  // The parent product's own name still carries its original color suffix
  // (e.g. "Personalised Passport Cover – Navy") since merging other colors
  // into variants doesn't rename the base product. Swap that suffix for
  // whichever color is currently selected, so the heading, breadcrumb, tab
  // title and share sheet always match what's actually on screen instead
  // of staying stuck on the parent's own color — see e.g. #121.
  const nameStem = useMemo(
    () => product.name.replace(/\s[\u2013-]\s[^\u2013-]+$/, "").trim(),
    [product.name]
  );
  const displayName = useMemo(() => {
    const colorGroupName = Object.keys(variantGroups).find((g) => g.toLowerCase() === "color");
    const colorVariant = colorGroupName ? selectedVariants[colorGroupName] : null;
    return colorVariant ? `${nameStem} \u2013 ${colorVariant.optionName}` : product.name;
  }, [nameStem, variantGroups, selectedVariants, product.name]);

  useEffect(() => {
    document.title = `${displayName} \u2014 Hashtag Gifting`;
  }, [displayName]);

  // Effective stock — use variant stock if variants exist
  const effectiveStock = useMemo(() => {
    if (!hasVariants) return product.stock;
    const variantStocks = Object.values(selectedVariants).map((v) => v.stock);
    return variantStocks.length > 0 ? Math.min(...variantStocks) : product.stock;
  }, [hasVariants, selectedVariants, product.stock]);

  // Active images — a selected variant with its own photoset takes over the
  // WHOLE gallery (just that variant's photos, switchable/reorderable like
  // any other gallery), not mixed in with the product's general photos.
  // Falls back to the full product image set when the variant has none of
  // its own.
  const images = useMemo(() => {
    const variantImgs = activeVariant?.images?.length
      ? activeVariant.images
      : Object.values(selectedVariants)[0]?.images;
    if (variantImgs && variantImgs.length > 0) return variantImgs;
    return product.images.length > 0 ? product.images : ["/placeholder.jpg"];
  }, [activeVariant, selectedVariants, product.images]);

  // ── Gallery ──
  const [activeImg,   setActiveImg]   = useState(0);
  const [lightbox,    setLightbox]    = useState(false);
  const [livePreview,   setLivePreview]   = useState(false);
  const [charmOpen,     setCharmOpen]     = useState(false);
  const [selectedCharm, setSelectedCharm] = useState<any>(null);

  // Reset to first image when variant changes
  useEffect(() => { setActiveImg(0); }, [selectedVariants]);

  // ── Cart flow ──
  const [quantity,     setQuantity]     = useState(1);
  const [giftWrap,     setGiftWrap]     = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [adding,       setAdding]       = useState(false);
  const [added,        setAdded]        = useState(false);
  const [variantError, setVariantError] = useState("");

  // ── Countdown ──
  const [countdown, setCountdown] = useState({ h: 2, m: 34, s: 12 });

  const reviewsRef = useRef<HTMLDivElement>(null);

  const { addToCart }             = useCartStore();
  const { addProduct, getOthers } = useRecentlyViewed();

  const isOutOfStock = effectiveStock === 0;

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

  useEffect(() => {
    addProduct({
      id: product.id, name: product.name, slug: product.slug,
      price: product.price, comparePrice: product.comparePrice,
      images: product.images, badge: product.badge,
    });
  }, [product.id]);

  const handleSelectVariant = (groupName: string, variant: ProductVariant) => {
    setSelectedVariants((p) => ({ ...p, [groupName]: variant }));
    setVariantError("");
  };

  // Validate all groups have a selection before adding to cart
  const validateVariants = (): boolean => {
    const missing = Object.keys(variantGroups).filter((g) => !selectedVariants[g]);
    if (missing.length > 0) {
      setVariantError(`Please select a ${missing.join(" and ")}`);
      return false;
    }
    return true;
  };

  const handleAddToCart = useCallback(async () => {
    if (isOutOfStock) return;
    if (hasVariants && !validateVariants()) return;

    setAdding(true);
    try {
      // Build variant customization payload (display metadata — the actual
      // stock/price enforcement uses the separate variantId arg below)
      const variantPayload = hasVariants
        ? {
            variantSelections: Object.entries(selectedVariants).map(([groupName, v]) => ({
              groupName,
              optionName: v.optionName,
              variantId:  v.id,
              price:      v.price,
            })),
          }
        : null;

      await addToCart(product.id, quantity, variantPayload, primaryVariantId);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }, [isOutOfStock, hasVariants, selectedVariants, primaryVariantId, product.id, quantity, addToCart]);

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: displayName, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const handleScrollToReviews = (_tab: "reviews") => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const recentlyViewed = getOthers(product.id);

  // Build a product-like object with variant price + name for ProductInfo
  const productWithVariantPrice = {
    ...product,
    name:         displayName,
    price:        displayPrice,
    comparePrice: displayComparePrice,
    stock:        effectiveStock,
  };

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      <ProductPurchasedPopup images={images} productName={displayName} />
      <ProductStickyCart
        images={images}
        productName={displayName}
        price={displayPrice}
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
        productName={displayName}
      />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-8 flex-wrap">
          <Link href="/"     className="hover:text-[#c0555a] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#c0555a] transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#c0555a] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium truncate max-w-[200px]">{displayName}</span>
        </nav>

        {/* Same class of bug as the Hero fix: lg (1024px) fires on an iPad
            Pro in portrait too, squeezing the gallery into `1fr` next to a
            fixed 480px info column. Pushed to xl so the two-column split
            only kicks in on genuinely wide screens; portrait tablets keep
            the stacked (gallery-above-info) layout, which has plenty of
            room either way. */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-12 mb-20">

          {/* LEFT — Gallery */}
          <ProductGallery
            images={images}
            productName={displayName}
            badge={product.badge}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            onOpenLightbox={() => setLightbox(true)}
            onShare={handleShare}
          />

          {/* RIGHT */}
          <div className="flex flex-col gap-5">

            {/* 1. Name / rating / price — pass variant-adjusted price */}
            <ProductInfo
              product={productWithVariantPrice}
              onTabChange={handleScrollToReviews}
              onShare={handleShare}
            />

            {/* ── 2. VARIANT SELECTOR — right under price/badges, matching reference layout ── */}
            {hasVariants && (
              <div className="flex flex-col gap-1">
                <ProductVariantSelector
                  variantGroups={variantGroups}
                  selectedVariants={selectedVariants}
                  onSelect={handleSelectVariant}
                />
                {variantError && (
                  <p className="text-[12px] text-red-500 font-medium mt-1">{variantError}</p>
                )}
              </div>
            )}

            {/* 3. Pincode + trust */}
            <ProductDelivery />

            {/* 4. Freebie bar */}
            <ProductFreebieBar currentProductPrice={displayPrice} />

            {/* 5a. Charm selector */}
            {product.hasCharm && (
              <div className="flex items-center justify-between p-4 bg-[#f3efe8] rounded-2xl border border-[#e8e0d5] mb-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#1a1a1a]"><Sparkles size={14} className="text-[#c0555a]" /> Add a charm</p>
                  <p className="text-[12px] text-[#888] mt-0.5">
                    {selectedCharm ? `Selected: ${selectedCharm.name}` : "Optional — choose a charm for your product"}
                  </p>
                </div>
                <StoreButton onClick={() => setCharmOpen(true)} variant="dark" size="sm" className="flex-shrink-0">
                  {selectedCharm ? "Change charm" : "Select charm"}
                </StoreButton>
              </div>
            )}

            {/* 5. Customizable CTA */}
            {product.customizable && product.customizationFields?.length > 0 && (
              <div id="product-customizer" className="flex flex-col gap-3">
                <button
                  onClick={() => setLivePreview(true)}
                  disabled={isOutOfStock}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[15px] font-bold bg-[#c0555a] text-white hover:bg-[#a84449] disabled:opacity-50 transition-all shadow-md"
                >
                  {isOutOfStock ? "Out of stock" : <><Sparkles size={16} /> Personalise & Add to Cart</>}
                </button>
                {isOutOfStock && <NotifyMeButton productId={product.id} />}
              </div>
            )}

            {/* 5b. Non-customizable → addons + qty + CTA */}
            {!product.customizable && (
              <ProductActions
                product={productWithVariantPrice}
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

            {/* 6. Accordions */}
            <ProductAccordions product={product} />
          </div>
        </div>

        {/* Below fold */}
        <div ref={reviewsRef}>
          <ProductTabs product={product} />
        </div>

        <SimilarProducts
          currentProductId={product.id}
          categoryId={product.category?.id ?? null}
          categoryName={product.category?.name ?? ""}
          tags={product.tags || []}
        />

        <RecentlyViewed products={recentlyViewed} currentId={product.id} />
      </div>

      <CharmSelector
        open={charmOpen}
        onClose={() => setCharmOpen(false)}
        onSelect={setSelectedCharm}
        selected={selectedCharm}
      />

      {product.customizable && product.customizationFields?.length > 0 && (
        <LivePreviewModal
          open={livePreview}
          onClose={() => setLivePreview(false)}
          productName={displayName}
          productPrice={displayPrice}
          productImages={product.images || []}
          customFields={product.customizationFields || []}
          previewZones={product.previewZones || null}
          previewTemplate={product.previewTemplate || null}
          availableFonts={product.availableFonts || null}
          adding={adding}
          onAddToCart={async (customization) => {
            setAdding(true);
            try {
              // This modal is how every customizable product (which is all
              // of the imported catalog) actually gets added to cart — this
              // previously never merged in the variant selection at all, so
              // for any customizable product with variants, which design/
              // colour the customer picked was silently lost the moment it
              // hit the cart (and its stock/price were never enforced
              // either). Merging in the same variantSelections payload the
              // non-customizable add-to-cart path already builds above.
              const variantPayload = hasVariants
                ? {
                    variantSelections: Object.entries(selectedVariants).map(([groupName, v]) => ({
                      groupName,
                      optionName: v.optionName,
                      variantId:  v.id,
                      price:      v.price,
                    })),
                  }
                : {};
              const customizationWithCharm = {
                ...customization,
                ...variantPayload,
                ...(selectedCharm ? { selected_charm: selectedCharm.name, charm_number: selectedCharm.number } : {}),
              };
              await addToCart(product.id, 1, customizationWithCharm, primaryVariantId);
              setLivePreview(false);
            } finally { setAdding(false); }
          }}
        />
      )}
    </div>
  );
}