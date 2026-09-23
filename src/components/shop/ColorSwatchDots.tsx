"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getColorHex } from "@/lib/colorMap";

export interface SwatchVariant {
  id:         number;
  optionName: string;
  images:     string[];
  stock:      number;
}

interface Props {
  variants:    SwatchVariant[];
  productSlug: string;
  className?:  string;
}

// Small color-dot row shown under a product card's image (shop/category/search
// grids). Clicking a dot takes the shopper straight to that product page with
// that color pre-selected — it does NOT change anything on the card itself,
// it's just a shortcut into the right variant.
export default function ColorSwatchDots({ variants, productSlug, className }: Props) {
  const router = useRouter();

  // Only worth showing if there's an actual choice to make.
  if (!variants || variants.length < 2) return null;

  const shown   = variants.slice(0, 6);
  const overflow = variants.length - shown.length;

  return (
    <div className={`w-full flex items-center justify-center gap-2 sm:gap-2.5 ${className || ""}`}>
      {shown.map((v) => {
        const hex = getColorHex(v.optionName);
        const oos = v.stock === 0;
        return (
          <button
            key={v.id}
            type="button"
            title={`${v.optionName}${oos ? " (out of stock)" : ""}`}
            disabled={oos}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/product/${productSlug}?color=${encodeURIComponent(v.optionName)}`);
            }}
            className={`relative w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 overflow-hidden transition-transform flex-shrink-0 ${
              oos ? "opacity-30 cursor-not-allowed" : "hover:scale-125"
            }`}
            style={{
              backgroundColor: hex || "#e8e0d5",
              borderColor: !v.images?.[0] && (hex === "#ffffff" || !hex) ? "#ddd" : "transparent",
            }}
          >
            {v.images?.[0] && (
              <Image src={v.images[0]} alt="" fill className="object-cover" sizes="32px" />
            )}
          </button>
        );
      })}
      {overflow > 0 && (
        <span className="text-[11px] text-[#aaa] font-medium">+{overflow}</span>
      )}
    </div>
  );
}
