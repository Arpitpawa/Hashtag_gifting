"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X, Minus, Plus, Trash2, ShoppingBag,
  Tag, ChevronRight, Loader2, Gift,
  ArrowRight, PackageCheck,
} from "lucide-react";
import { useCartStore, formatPrice } from "@/lib/store/cartStore";

// ── Freebie progress bar ──────────────────────────────────────────────────────
const TIERS = [
  { label: "1 free gift",  threshold: 99900  },
  { label: "2 free gifts", threshold: 199900 },
  { label: "3 free gifts", threshold: 299900 },
];

function FreebieBar({ subtotal }: { subtotal: number }) {
  const nextTier  = TIERS.find((t) => subtotal < t.threshold);
  const reached   = !nextTier;
  const topTier   = TIERS[TIERS.length - 1];
  const progress  = reached ? 100 : Math.min(100, Math.round((subtotal / topTier.threshold) * 100));
  const amountLeft = nextTier ? Math.ceil((nextTier.threshold - subtotal) / 100) : 0;

  return (
    <div className="px-5 py-3 bg-[#fdf9f5] border-b border-[#e8e0d5]">
      <p className="text-[12px] text-[#555] mb-2 flex items-center gap-1.5">
        <Gift size={13} className="text-[#c0555a] flex-shrink-0" />
        {reached ? (
          <span className="font-semibold text-green-700">You've unlocked all freebies!</span>
        ) : (
          <>
            Add <span className="font-bold text-[#c0555a] mx-0.5">Rs. {amountLeft}</span> more to unlock {nextTier?.label}
          </>
        )}
      </p>
      <div className="h-1.5 bg-[#e8e0d5] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#c0555a] to-[#c4922a] rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ── Coupon input ──────────────────────────────────────────────────────────────
function CouponInput({ onApply, applied, onRemove }: {
  onApply:  (code: string, discount: number) => void;
  applied:  { code: string; discount: number } | null;
  onRemove: () => void;
}) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/coupons/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.valid) {
        onApply(code.trim().toUpperCase(), data.discount);
        setCode("");
      } else {
        setError(data.message || "Invalid coupon code");
      }
    } catch { setError("Could not apply coupon. Try again."); }
    finally   { setLoading(false); }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-green-600" />
          <span className="text-[13px] font-semibold text-green-700">{applied.code}</span>
          <span className="text-[12px] text-green-600">— {formatPrice(applied.discount)} off</span>
        </div>
        <button onClick={onRemove} className="text-green-600 hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Coupon code"
            className="w-full pl-8 pr-3 py-2.5 border border-[#e8e0d5] rounded-xl text-[13px] outline-none focus:border-[#c0555a] transition-colors bg-white"
          />
        </div>
        <button
          onClick={apply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-[#c0555a] text-white text-[12px] font-bold rounded-xl hover:bg-[#a84449] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500 pl-1">{error}</p>}
    </div>
  );
}

// ── Main CartDrawer ───────────────────────────────────────────────────────────
interface Props {
  open:    boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, subtotal, itemCount, isLoading, fetchCart, updateItem, removeItem } = useCartStore();
  const [coupon,   setCoupon]   = useState<{ code: string; discount: number } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fetch on open
  useEffect(() => { if (open) fetchCart(); }, [open]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleRemove = async (itemId: number) => {
    setRemoving(itemId);
    await removeItem(itemId);
    setRemoving(null);
  };

  const handleQty = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    await updateItem(itemId, qty);
  };

  const discount    = coupon?.discount ?? 0;
  const finalTotal  = Math.max(0, subtotal - discount);
  const freeDelivery = finalTotal >= 99900;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full z-[160] w-full max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5] flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#c0555a]" />
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Your cart</h2>
            {itemCount > 0 && (
              <span className="text-[12px] font-semibold text-white bg-[#c0555a] px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3efe8] flex items-center justify-center hover:bg-[#e8e0d5] transition-colors"
          >
            <X size={16} className="text-[#555]" />
          </button>
        </div>

        {/* ── FREEBIE BAR ── */}
        {items.length > 0 && <FreebieBar subtotal={subtotal} />}

        {/* ── ITEMS ── */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && items.length === 0 ? (
            /* Loading skeleton */
            <div className="p-5 flex flex-col gap-4">
              {[1,2].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-20 h-20 bg-[#e8e0d5] rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 bg-[#e8e0d5] rounded-full w-3/4" />
                    <div className="h-3 bg-[#e8e0d5] rounded-full w-1/2" />
                    <div className="h-3 bg-[#e8e0d5] rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <div className="w-20 h-20 bg-[#f3efe8] rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-[#c0555a]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#1a1a1a] mb-1">Your cart is empty</p>
                <p className="text-[13px] text-[#888] leading-relaxed">
                  Add something special for someone special
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white text-[13px] font-semibold rounded-full hover:bg-[#a84449] transition-colors"
              >
                <ArrowRight size={15} />
                Browse gifts
              </button>
            </div>
          ) : (
            /* Cart items */
            <div className="p-5 flex flex-col gap-4">
              {items.map((item) => {
                const img  = item.product.images?.[0] || "/placeholder.jpg";
                const isRemoving = removing === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex gap-3 transition-opacity duration-200 ${isRemoving ? "opacity-40" : "opacity-100"}`}
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={onClose}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#f8f5f0] flex-shrink-0 border border-[#e8e0d5]"
                    >
                      <Image src={img} alt={item.product.name} fill className="object-cover" sizes="80px" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={onClose}
                        className="text-[13px] font-semibold text-[#1a1a1a] capitalize line-clamp-2 leading-snug hover:text-[#c0555a] transition-colors"
                      >
                        {item.product.name}
                      </Link>

                      {/* Customization preview */}
                      {item.customization && (
                        <p className="text-[11px] text-[#888] mt-0.5 truncate">
                          {Object.entries(item.customization)
                            .filter(([k, v]) => v && k !== "photoUrl" && k !== "giftWrap" && k !== "greetingCard")
                            .map(([_, v]) => v)
                            .join(" · ")}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center border border-[#e8e0d5] rounded-full overflow-hidden">
                          <button
                            onClick={() => handleQty(item.id, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#f3efe8] transition-colors disabled:opacity-40"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-7 text-center text-[13px] font-bold">
                            {isLoading ? <Loader2 size={11} className="animate-spin mx-auto" /> : item.quantity}
                          </span>
                          <button
                            onClick={() => handleQty(item.id, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= item.product.stock}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#f3efe8] transition-colors disabled:opacity-40"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Price + remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-bold text-[#1a1a1a]">
                            {formatPrice(item.subtotal)}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={isRemoving}
                            className="text-[#ccc] hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Coupon */}
              <div className="border-t border-[#e8e0d5] pt-4 mt-1">
                <CouponInput
                  applied={coupon}
                  onApply={(code, disc) => setCoupon({ code, discount: disc })}
                  onRemove={() => setCoupon(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER — totals + CTA ── */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-[#e8e0d5] px-5 pt-4 pb-6 bg-white">

            {/* Totals */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#888]">Subtotal</span>
                <span className="font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-green-600">Coupon discount</span>
                  <span className="font-semibold text-green-600">- {formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[13px]">
                <span className="text-[#888]">Delivery</span>
                {freeDelivery ? (
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <PackageCheck size={13} /> Free
                  </span>
                ) : (
                  <span className="text-[#888]">
                    Calculated at checkout
                  </span>
                )}
              </div>

              {!freeDelivery && (
                <p className="text-[11px] text-[#aaa]">
                  Add Rs. {Math.ceil((99900 - finalTotal) / 100)} more for free delivery
                </p>
              )}

              <div className="flex justify-between text-[15px] font-bold text-[#1a1a1a] pt-2 border-t border-[#e8e0d5]">
                <span>Total</span>
                <span className="text-[#c0555a]">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] transition-all active:scale-[0.98]"
            >
              Proceed to checkout
              <ChevronRight size={18} />
            </Link>

            <button
              onClick={onClose}
              className="w-full text-center text-[13px] text-[#888] hover:text-[#c0555a] transition-colors mt-3"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}