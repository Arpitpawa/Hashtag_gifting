"use client";

import { useState } from "react";
import {
  Gift, CheckCircle, Minus, Plus,
  Phone, Loader2, ShoppingBag, Clock, Bell, Mail,
  X, Flame, Zap,
} from "lucide-react";
import type { Product } from "@/types/product";
import { StoreButton } from "@/components/ui/StoreButton";

// ── Notify me component ────────────────────────────────────────────────────────
export function NotifyMeButton({ productId }: { productId: number }) {
  const [email,   setEmail]   = useState("");
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/stock-notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), productId }),
      });
      const data = await res.json();
      if (res.ok) { setDone(true); }
      else setError(data.error || "Something went wrong");
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[14px] font-semibold">
      <CheckCircle size={16} /> We'll email you when it's back!
    </div>
  );

  return (
    <div className="w-full">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[15px] font-bold border-2 border-[#c0555a] text-[#c0555a] hover:bg-[#c0555a] hover:text-white transition-all duration-200">
          <Bell size={18} /> Notify me when available
        </button>
      ) : (
        <div className="w-full bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-4">
          <p className="text-[13px] font-semibold text-[#1a1a1a] mb-1 flex items-center gap-2">
            <Bell size={14} className="text-[#c0555a]" /> Get notified when back in stock
          </p>
          <p className="text-[12px] text-[#888] mb-3">We'll send you one email the moment it's available</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="Enter your email"
                className="w-full pl-8 pr-3 py-2.5 border border-[#e8e0d5] rounded-xl text-[13px] outline-none focus:border-[#c0555a] bg-white" />
            </div>
            <button onClick={submit} disabled={loading || !email.trim()}
              className="px-4 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-xl hover:bg-[#a84449] disabled:opacity-50 transition-all whitespace-nowrap flex items-center gap-1.5">
              {loading ? <Loader2 size={13} className="animate-spin" /> : "Notify me"}
            </button>
          </div>
          {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

interface Countdown { h: number; m: number; s: number; }

interface Props {
  product:         Product;
  quantity:        number;
  setQuantity:     (q: number) => void;
  giftWrap:        boolean;
  setGiftWrap:     (v: boolean) => void;
  adding:          boolean;
  added:           boolean;
  isOutOfStock:    boolean;
  onAddToCart:     () => void;
  countdown:       Countdown;
}

export default function ProductActions({
  product, quantity, setQuantity,
  giftWrap, setGiftWrap,
  adding, added, isOutOfStock, onAddToCart, countdown,
}: Props) {
  const addOns = [
    {
      checked:  giftWrap,
      onChange: setGiftWrap,
      icon:     <Gift size={14} />,
      title:    "Premium gift wrapping",
      sub:      "Beautiful box + ribbon",
      price:    "+Rs. 99",
    },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Stock + countdown */}
      <div className="flex items-center gap-3 flex-wrap">
        {isOutOfStock ? (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
            <X size={13} /> Out of stock
          </span>
        ) : product.stock <= 5 ? (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            <Flame size={13} /> Only {product.stock} left!
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <CheckCircle size={13} /> In stock
          </span>
        )}
        {!isOutOfStock && (
          <span className="text-[12px] text-[#6b6b6b] flex items-center gap-1">
            <Clock size={12} className="text-[#c0555a]" />
            Order in{" "}
            <span className="font-bold text-[#c0555a]">
              {String(countdown.h).padStart(2,"0")}:{String(countdown.m).padStart(2,"0")}:{String(countdown.s).padStart(2,"0")}
            </span>{" "}
            for same-day dispatch
          </span>
        )}
      </div>

      {/* Gift add-ons */}
      <div>
        <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#888] uppercase tracking-wider mb-2"><Gift size={13} /> Gift add-ons</p>
        <div className="flex flex-col gap-2">
          {addOns.map((item, i) => (
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
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                item.checked ? "border-[#c0555a] bg-[#c0555a]" : "border-[#e8e0d5]"
              }`}>
                {item.checked && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className={item.checked ? "text-[#c0555a]" : "text-[#aaa]"}>{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1a1a1a]">{item.title}</p>
                <p className="text-[11px] text-[#aaa]">{item.sub}</p>
              </div>
              <span className="text-[12px] font-bold text-[#c0555a] flex-shrink-0">{item.price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-[13px] font-semibold text-[#555]">Quantity</span>
        <div className="flex items-center border-2 border-[#e8e0d5] rounded-full overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#f3efe8] transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-[15px] font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#f3efe8] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock || adding}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold transition-all duration-300 shadow-md active:scale-[0.98] ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
              ? "bg-green-500 text-white"
              : "bg-[#c0555a] text-white hover:bg-[#a84449]"
          }`}
         aria-label="Open cart">
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

        {/* Notify me when back in stock */}
        {isOutOfStock && (
          <NotifyMeButton productId={product.id} />
        )}

        {!isOutOfStock && (
          <StoreButton href="/checkout" variant="dark-outline" size="lg" fullWidth>
            <Zap size={16} /> Buy now
          </StoreButton>
        )}

        <StoreButton
          href={`https://wa.me/917665909909?text=Hi! I'm interested in ${encodeURIComponent(product.name)}`}
          variant="whatsapp"
          size="lg"
          fullWidth
        >
          <Phone size={16} /> Order on WhatsApp
        </StoreButton>
      </div>
    </div>
  );
}