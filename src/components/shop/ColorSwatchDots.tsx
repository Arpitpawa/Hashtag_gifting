"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getColorHex } from "@/lib/colorMap";

export interface SwatchVariant {
  id:            number;
  optionName:    string;
  images:        string[];
  stock:         number;
  price?:        number | null;
  comparePrice?: number | null;
}

// Minimal shape a product-grid card needs to supply for color-tile expansion.
// Each of the shop/category/search grids defines its own local `Product`
// interface with this same shape (plus a few extras) — this is intentionally
// loose (generic + extends) so every one of them can reuse the same helper
// without importing a shared Product type.
export interface ColorTileSource {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  stock:        number;
  variants?:    SwatchVariant[];
}

// A product with 2+ "Color" variants used to render as ONE grid card with a
// row of tiny swatch dots underneath — the individual colors were only
// discoverable by noticing the dots. This expands such a product into one
// full tile PER color (its own photo, price, stock), so every color is a
// first-class, directly-clickable tile in the grid — while every tile still
// carries the full sibling `variants` list, so its own swatch row can jump
// straight to any other color without a detour back through a "parent" card.
// Products with 0-1 color variants pass through unchanged (nothing to expand).
export function expandToColorTiles<T extends ColorTileSource>(
  products: T[]
): (T & { tileKey: string; colorParam?: string })[] {
  const tiles: (T & { tileKey: string; colorParam?: string })[] = [];

  for (const p of products) {
    const colors = (p.variants || []).filter((v) => v.optionName);

    if (colors.length < 2) {
      tiles.push({ ...p, tileKey: String(p.id) });
      continue;
    }

    // Strip a trailing " – <color>" (en dash or hyphen) so every tile gets
    // a clean, consistent "<Base name> – <this color>" regardless of which
    // color the underlying product record happens to be named after.
    const nameStem = p.name.replace(/\s[–-]\s[^–-]+$/, "").trim();

    for (const v of colors) {
      tiles.push({
        ...p,
        tileKey:      `${p.id}-${v.id}`,
        name:         `${nameStem} – ${v.optionName}`,
        price:        v.price ?? p.price,
        comparePrice: v.comparePrice ?? p.comparePrice,
        images:       v.images && v.images.length > 0 ? v.images : p.images,
        stock:        v.stock,
        colorParam:   v.optionName,
      });
    }
  }

  return tiles;
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
