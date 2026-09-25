"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Minus, Plus, Trash2, ShoppingBag, Tag,
  ChevronRight, Loader2, Gift, PackageCheck,
  ArrowLeft, LogIn, ShieldCheck, RefreshCw,
  Truck, Star, X, UserCircle, Check, Headphones,
} from "lucide-react";
import { useCartStore, formatPrice } from "@/lib/store/cartStore";
import AvailableCoupons from "@/components/shared/AvailableCoupons";

// ── Freebie bar ───────────────────────────────────────────────────────────────
const TIERS = [
  { label: "1 free gift",  threshold: 99900  },
  { label: "2 free gifts", threshold: 199900 },
  { label: "3 free gifts", threshold: 299900 },
];

function FreebieBar({ subtotal }: { subtotal: number }) {
  const nextTier   = TIERS.find((t) => subtotal < t.threshold);
  const reached    = !nextTier;
  const progress   = reached ? 100 : Math.min(100, Math.round((subtotal / TIERS[2].threshold) * 100));
  const amountLeft = nextTier ? Math.ceil((nextTier.threshold - subtotal) / 100) : 0;

  return (
    <div className="bg-[#fdf9f5] border border-[#e8e0d5] rounded-2xl px-5 py-4">
      <p className="text-[13px] text-[#555] mb-2.5 flex items-center gap-2">
        <Gift size={14} className="text-[#c0555a] flex-shrink-0" />
        {reached ? (
          <span className="font-semibold text-green-700">You've unlocked all freebies!</span>
        ) : (
          <>Add <span className="font-bold text-[#c0555a] mx-1">Rs. {amountLeft}</span> more to unlock {nextTier?.label}</>
        )}
      </p>
      <div className="h-2 bg-[#e8e0d5] rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-to-r from-[#c0555a] to-[#c4922a] rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between">
        {TIERS.map((t, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 transition-all ${
              subtotal >= t.threshold ? "bg-[#c0555a] border-[#c0555a] text-white" : "bg-white border-[#e8e0d5] text-[#aaa]"
            }`}>
              {subtotal >= t.threshold ? <Check size={11} /> : i + 1}
            </div>
            <p className={`text-[10px] font-semibold text-center leading-tight ${subtotal >= t.threshold ? "text-[#c0555a]" : "text-[#aaa]"}`}>
              {t.label}
            </p>
            <p className="text-[9px] text-[#bbb]">≥Rs.{Math.round(t.threshold / 100)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Coupon ────────────────────────────────────────────────────────────────────
function CouponInput({ applied, onApply, onRemove, subtotal }: {
  applied:  { code: string; discount: number; id: number } | null;
  onApply:  (code: string, discount: number, id: number) => void;
  onRemove: () => void;
  subtotal: number;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apply = async (codeOverride?: string) => {
    const useCode = (codeOverride ?? code).trim();
    if (!useCode) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/coupons/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: useCode.toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) { onApply(useCode.toUpperCase(), data.discount, data.couponId); setCode(""); }
      else setError(data.message || "Invalid coupon code");
    } catch { setError("Could not apply coupon."); }
    finally { setLoading(false); }
  };

  if (applied) return (
    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
      <div className="flex items-center gap-2">
        <Tag size={15} className="text-green-600" />
        <span className="text-[14px] font-bold text-green-700">{applied.code}</span>
        <span className="text-[13px] text-green-600">— {formatPrice(applied.discount)} off</span>
      </div>
      <button onClick={onRemove} className="text-green-600 hover:text-red-500 transition-colors" aria-label="Close"><X size={15} /></button>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-semibold text-[#1a1a1a] flex items-center gap-2">
        <Tag size={14} className="text-[#c0555a]" /> Have a coupon?
      </p>
      <div className="flex gap-2">
        <input type="text" value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Enter code (e.g. WELCOME10)"
          className="flex-1 border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] bg-white transition-colors"
        />
        <button onClick={() => apply()} disabled={loading || !code.trim()}
          className="px-5 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-xl hover:bg-[#a84449] disabled:opacity-50 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <AvailableCoupons
        subtotal={subtotal}
        onApply={(c) => apply(c)}
        className="mt-1"
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CartPageClient() {
  const { data: session } = useSession();
  const {
    items, subtotal, itemCount, isLoading, fetchCart, updateItem, removeItem,
    appliedCoupon: coupon, setAppliedCoupon: setCoupon,
  } = useCartStore();
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (id: number) => {
    setRemoving(id); await removeItem(id); setRemoving(null);
  };

  const discount   = coupon?.discount ?? 0;
  const finalTotal = Math.max(0, subtotal - discount);
  const freeShip   = finalTotal >= 99900;

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#e8e0d5]">
            <ShoppingBag size={40} className="text-[#c0555a]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[24px] font-bold text-[#1a1a1a] mb-2">Your cart is empty</h1>
          <p className="text-[14px] text-[#888] leading-relaxed mb-8">
            Looks like you haven't added anything yet. Explore our collection of personalised gifts.
          </p>
          {!session && (
            <div className="bg-white border border-[#e8e0d5] rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3">
                <UserCircle size={20} className="text-[#c0555a] flex-shrink-0" />
                <p className="text-[13px] text-[#555]">
                  Have an account?{" "}
                  <Link href="/login" className="text-[#c0555a] font-semibold hover:underline">Log in</Link>
                  {" "}to see your saved cart
                </p>
              </div>
            </div>
          )}
          <Link href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-colors">
            <ArrowLeft size={16} /> Browse gifts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-6">
          <Link href="/" className="hover:text-[#c0555a] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium">Cart</span>
        </nav>

        <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-8 flex items-center gap-3">
          <ShoppingBag size={26} className="text-[#c0555a]" />
          Your cart
          {itemCount > 0 && (
            <span className="text-[16px] font-semibold text-[#888]">({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          )}
        </h1>

        {/* xl instead of lg — same iPad-Pro-portrait cramming issue as
            checkout's identical layout. */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── LEFT — items ── */}
          <div className="flex flex-col gap-4">

            {/* Login prompt for guests */}
            {!session && items.length > 0 && (
              <div className="bg-white border border-[#e8e0d5] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#c0555a]/10 flex items-center justify-center flex-shrink-0">
                  <UserCircle size={20} className="text-[#c0555a]" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1a1a1a]">Have an account?</p>
                  <p className="text-[12px] text-[#888] mt-0.5">Log in to checkout faster and track your orders</p>
                </div>
                <Link href="/login?callbackUrl=/checkout"
                  className="flex items-center gap-2 bg-[#c0555a] text-white text-[13px] font-bold px-4 py-2.5 rounded-full hover:bg-[#a84449] transition-colors flex-shrink-0">
                  <LogIn size={14} /> Log in
                </Link>
              </div>
            )}

            {/* Freebie bar */}
            <FreebieBar subtotal={subtotal} />

            {/* Items list */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden">
              {isLoading && items.length === 0 ? (
                <div className="p-6 flex flex-col gap-5">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-24 h-24 bg-[#e8e0d5] rounded-2xl flex-shrink-0" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 bg-[#e8e0d5] rounded-full w-2/3" />
                        <div className="h-3 bg-[#e8e0d5] rounded-full w-1/3" />
                        <div className="h-3 bg-[#e8e0d5] rounded-full w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                items.map((item, idx) => {
                  const img        = item.product.images?.[0] || "/placeholder.jpg";
                  const isRemoving = removing === item.id;
                  // A selected variant's own price/stock govern this item —
                  // falls back to the base product's when there's no variant.
                  const unitPrice     = item.variant?.price ?? item.product.price;
                  const comparePrice  = item.variant?.comparePrice ?? item.product.comparePrice;
                  const availStock    = item.variant?.stock ?? item.product.stock;
                  const discount      = comparePrice
                    ? Math.round(((comparePrice - unitPrice) / comparePrice) * 100)
                    : 0;

                  return (
                    <div key={item.id}
                      className={`flex gap-4 p-5 transition-opacity duration-200 ${
                        isRemoving ? "opacity-40" : ""
                      } ${idx < items.length - 1 ? "border-b border-[#f3efe8]" : ""}`}
                    >
                      {/* Image */}
                      <Link href={`/product/${item.product.slug}`}
                        className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-[#f8f5f0] flex-shrink-0 border border-[#e8e0d5]">
                        <Image src={img} alt={item.product.name} fill className="object-cover" sizes="112px" />
                        {discount > 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#c0555a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            -{discount}%
                          </span>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product.slug}`}
                          className="text-[14px] md:text-[15px] font-semibold text-[#1a1a1a] capitalize leading-snug hover:text-[#c0555a] transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>

                        {/* Customization */}
                        {item.customization && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {Object.entries(item.customization)
                              .filter(([k, v]) => {
                                // Keys that get their own dedicated UI (the "Custom
                                // photo" badge below) or aren't meant to be shown
                                // as a plain text tag at all — kept in sync with
                                // the equivalent lists in the admin/customer order
                                // detail pages (SPECIAL_KEYS there).
                                const excluded = [
                                  "photoUrl", "giftWrap", "greetingCard", "photo_upload", "preview_png",
                                  "variantSelections", "isHamper", "hamperRef", "role",
                                ];
                                if (excluded.includes(k)) return false;
                                if (!v) return false;
                                if (typeof v === "string" && v.startsWith("data:")) return false;
                                // Anything non-primitive (e.g. variantSelections'
                                // array of {groupName, optionName, ...} objects)
                                // can't be rendered as plain text — this crashed
                                // the whole cart page (React error #31) whenever
                                // a variant-selected product was in the cart.
                                if (typeof v === "object") return false;
                                return true;
                              })
                              .map(([k, v]) => (
                                <span key={k} className="text-[11px] bg-[#f3efe8] text-[#555] border border-[#e8e0d5] px-2 py-0.5 rounded-full capitalize">
                                  {String(v)}
                                </span>
                              ))}
                            {(item.customization.photoUrl || item.customization.photo_upload) && (
                              <span className="text-[11px] bg-[#c0555a]/10 text-[#c0555a] border border-[#c0555a]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star size={9} /> Custom photo
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                          {/* Qty controls */}
                          <div className="flex items-center border border-[#e8e0d5] rounded-full overflow-hidden">
                            <button onClick={() => updateItem(item.id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#f3efe8] transition-colors disabled:opacity-40">
                              <Minus size={12} />
                            </button>
                            <span className="w-9 text-center text-[14px] font-bold">
                              {isLoading ? <Loader2 size={12} className="animate-spin mx-auto" /> : item.quantity}
                            </span>
                            <button onClick={() => updateItem(item.id, item.quantity + 1)}
                              disabled={isLoading || item.quantity >= availStock}
                              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#f3efe8] transition-colors disabled:opacity-40">
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[16px] font-bold text-[#1a1a1a]">{formatPrice(item.subtotal)}</p>
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-[#aaa]">{formatPrice(unitPrice)} each</p>
                              )}
                            </div>
                            <button onClick={() => handleRemove(item.id)} disabled={isRemoving}
                              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
              <CouponInput applied={coupon} subtotal={subtotal}
                onApply={(c, d, id) => setCoupon({ code: c, discount: d, id })}
                onRemove={() => setCoupon(null)} />
            </div>

            {/* Continue shopping */}
            <Link href="/shop"
              className="flex items-center gap-2 text-[13px] text-[#888] hover:text-[#c0555a] transition-colors w-fit">
              <ArrowLeft size={14} /> Continue shopping
            </Link>
          </div>

          {/* ── RIGHT — order summary ── */}
          <div className="flex flex-col gap-4 xl:sticky xl:top-6">

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
              <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-4">Order summary</h2>

              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#888]">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-green-600">Coupon discount</span>
                    <span className="font-semibold text-green-600">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#888]">Delivery</span>
                  {freeShip
                    ? <span className="font-semibold text-green-600 flex items-center gap-1"><PackageCheck size={13} /> Free</span>
                    : <span className="text-[#888]">Calculated at checkout</span>}
                </div>
                {!freeShip && (
                  <p className="text-[12px] text-[#aaa] bg-[#f3efe8] px-3 py-2 rounded-xl">
                    Add <span className="font-bold text-[#c0555a]">Rs. {Math.ceil((99900 - finalTotal) / 100)}</span> more for free delivery
                  </p>
                )}

                <div className="flex justify-between text-[17px] font-bold text-[#1a1a1a] pt-3 border-t border-[#e8e0d5]">
                  <span>Total</span>
                  <span className="text-[#c0555a]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Link href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] transition-all active:scale-[0.98]">
                Proceed to checkout <ChevronRight size={18} />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
              <div className="flex flex-col gap-3">
                {[
                  { icon: <ShieldCheck size={16} className="text-[#c0555a]" />, text: "100% secure payment" },
                  { icon: <Truck       size={16} className="text-[#c0555a]" />, text: "Free delivery above Rs. 999" },
                  { icon: <RefreshCw   size={16} className="text-[#c0555a]" />, text: "Easy 7-day returns (except personalised items)" },
                  { icon: <Headphones  size={16} className="text-[#c0555a]" />, text: "Dedicated customer care" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px] text-[#555]">
                    {item.icon}
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}