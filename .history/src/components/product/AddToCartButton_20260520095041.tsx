"use client";

import { Loader2, ShoppingBag, CheckCircle } from "lucide-react";

interface Props {
  adding:       boolean;
  added:        boolean;
  isOutOfStock: boolean;
  customizable: boolean;
  onClick:      () => void;
  className?:   string;
}

export default function AddToCartButton({
  adding, added, isOutOfStock, customizable, onClick, className = "",
}: Props) {
  const label = isOutOfStock
    ? "Out of stock"
    : added
    ? "Added to cart!"
    : customizable
    ? "Add personalized gift to cart"
    : "Add to cart";

  return (
    <button
      onClick={onClick}
      disabled={isOutOfStock || adding}
      className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold transition-all duration-300 shadow-md ${
        isOutOfStock
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : added
          ? "bg-green-500 text-white"
          : "bg-[#c0555a] text-white hover:bg-[#a84449] active:scale-[0.98]"
      } ${className}`}
    >
      {adding ? (
        <><Loader2 size={18} className="animate-spin" /> Adding...</>
      ) : added ? (
        <><CheckCircle size={18} /> {label}</>
      ) : (
        <><ShoppingBag size={18} /> {label}</>
      )}
    </button>
  );
}