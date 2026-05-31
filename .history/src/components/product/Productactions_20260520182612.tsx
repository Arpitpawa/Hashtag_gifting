"use client";

import Link from "next/link";
import {
  Gift,
  MessageSquare,
  CheckCircle,
  Minus,
  Plus,
  Phone,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
  quantity: number;
  setQuantity: (q: number) => void;
  giftWrap: boolean;
  setGiftWrap: (v: boolean) => void;
  greetingCard: boolean;
  setGreetingCard: (v: boolean) => void;
  adding: boolean;
  added: boolean;
  isOutOfStock: boolean;
  onAddToCart: () => void;
}

export default function ProductActions({
  product,
  quantity,
  setQuantity,
  giftWrap,
  setGiftWrap,
  greetingCard,
  setGreetingCard,
  adding,
  added,
  isOutOfStock,
  onAddToCart,
}: Props) {
  const addOns = [
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
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Gift add-ons */}
      <div>
        <p className="text-[13px] font-bold text-[#1a1a1a] mb-3">
          🎁 Gift add-ons
        </p>
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
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  item.checked
                    ? "border-[#c0555a] bg-[#c0555a]"
                    : "border-[#e8e0d5]"
                }`}
              >
                {item.checked && (
                  <CheckCircle size={12} className="text-white" />
                )}
              </div>
              <span className={item.checked ? "text-[#c0555a]" : "text-[#aaa]"}>
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
          <span className="w-12 text-center text-[15px] font-bold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#f3efe8] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        {/* ── MAIN ADD TO CART ── */}
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
              <ShoppingBag size={18} /> Add to cart
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
    </div>
  );
}
