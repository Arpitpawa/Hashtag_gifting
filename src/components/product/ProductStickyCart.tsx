"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";

interface Props {
  images:          string[];
  productName:     string;
  price:           number;
  adding:          boolean;
  added:           boolean;
  isOutOfStock:    boolean;
  customizable:    boolean;
  onAddToCart:     () => void;
}

export default function ProductStickyCart({
  images, productName, price, adding, added, isOutOfStock, customizable, onAddToCart,
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (!show) return null;

  const handleClick = () => {
    if (customizable) {
      // Scroll user to the customizer section instead of blindly adding
      document.getElementById("product-customizer")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    onAddToCart();
  };

  const label = isOutOfStock
    ? "Out of stock"
    : added
    ? "Added!"
    : customizable
    ? "Customize & buy"
    : "Add to cart";

  return (
    // env(safe-area-inset-bottom) keeps this off the iPhone home-indicator
    // gesture bar — without it, the CTA sat flush against/under it.
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e0d5] shadow-2xl px-4 pt-3 flex items-center gap-4" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
      <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
        <Image src={images[0]} alt="" fill className="object-cover" sizes="40px" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-[#1a1a1a] truncate">{productName}</p>
        <p className="text-[13px] font-bold text-[#c0555a]">{formatPrice(price)}</p>
      </div>

      <button
        onClick={handleClick}
        disabled={isOutOfStock || adding}
        className="flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-50 flex-shrink-0"
       aria-label="Open cart">
        {adding
          ? <Loader2 size={14} className="animate-spin" />
          : <ShoppingBag size={14} />}
        {label}
      </button>
    </div>
  );
}