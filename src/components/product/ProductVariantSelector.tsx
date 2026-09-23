"use client";

import Image from "next/image";
import { Check, Flame } from "lucide-react";
import type { ProductVariant, VariantGroups } from "@/types/product";
import { getColorHex } from "@/lib/colorMap";

interface Props {
  variantGroups:    VariantGroups;
  selectedVariants: Record<string, ProductVariant>;
  onSelect:         (groupName: string, variant: ProductVariant) => void;
}

export default function ProductVariantSelector({
  variantGroups, selectedVariants, onSelect,
}: Props) {
  const groups = Object.entries(variantGroups);
  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([groupName, options]) => {
        const selected    = selectedVariants[groupName];
        const isColorGroup = groupName.toLowerCase() === "color";

        return (
          <div key={groupName}>
            {/* Group label */}
            <div className="flex items-center gap-2 mb-2.5">
              <p className="text-[13px] font-bold text-[#1a1a1a]">{groupName}</p>
              {selected && (
                <p className="text-[13px] text-[#555]">
                  — <span className="font-medium">{selected.optionName}</span>
                  {selected.price != null && selected.price !== 0 && (
                    <span className="text-[#c0555a] ml-1">
                      · Rs. {(selected.price / 100).toLocaleString("en-IN")}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Color swatches */}
            {isColorGroup ? (
              <div className="flex flex-wrap gap-2.5">
                {options.map((variant) => {
                  const hex       = getColorHex(variant.optionName);
                  const isSel     = selected?.id === variant.id;
                  const isOOS     = variant.stock === 0;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => !isOOS && onSelect(groupName, variant)}
                      title={`${variant.optionName}${isOOS ? " (Out of stock)" : ""}`}
                      disabled={isOOS}
                      className={`relative transition-all duration-200 ${isOOS ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {/* If variant has image(s) — show the first as a circular photo swatch */}
                      {variant.images?.[0] ? (
                        <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                          isSel ? "border-[#c0555a] scale-110 shadow-md" : "border-[#e8e0d5] hover:border-[#c0555a]/50"
                        }`}>
                          <Image src={variant.images[0]} alt={variant.optionName} fill className="object-cover" sizes="56px" />
                          {isSel && (
                            <div className="absolute inset-0 bg-[#c0555a]/20 flex items-center justify-center">
                              <Check size={14} className="text-white drop-shadow" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      ) : hex ? (
                        // Color circle swatch
                        <div
                          className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSel ? "border-[#c0555a] scale-110 shadow-md ring-2 ring-[#c0555a]/30" : "border-[#e8e0d5] hover:scale-105"
                          }`}
                          style={{ backgroundColor: hex }}
                        >
                          {isSel && (
                            <Check
                              size={14}
                              strokeWidth={3}
                              className={hex === "#ffffff" || hex === "#fef9ef" || hex === "#f5e6d3" ? "text-[#c0555a]" : "text-white"}
                            />
                          )}
                        </div>
                      ) : (
                        // Fallback: pill button
                        <div className={`px-3 py-1.5 rounded-full border-2 text-[12px] font-medium transition-all ${
                          isSel ? "border-[#c0555a] bg-[#c0555a] text-white" : "border-[#e8e0d5] text-[#555] hover:border-[#c0555a]"
                        }`}>
                          {variant.optionName}
                        </div>
                      )}

                      {/* Out of stock slash */}
                      {isOOS && hex && !variant.images?.[0] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-red-400 rotate-45 absolute" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Size / Material / other — pill buttons */
              <div className="flex flex-wrap gap-2">
                {options.map((variant) => {
                  const isSel = selected?.id === variant.id;
                  const isOOS = variant.stock === 0;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => !isOOS && onSelect(groupName, variant)}
                      disabled={isOOS}
                      className={`relative px-4 py-2 rounded-xl border-2 text-[13px] font-medium transition-all ${
                        isOOS
                          ? "border-[#e8e0d5] text-[#ccc] cursor-not-allowed line-through"
                          : isSel
                          ? "border-[#c0555a] bg-[#c0555a] text-white shadow-sm"
                          : "border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
                      }`}
                    >
                      {variant.optionName}
                      {variant.price != null && variant.price !== 0 && (
                        <span className={`ml-1 text-[11px] ${isSel ? "text-white/80" : "text-[#aaa]"}`}>
                          +Rs.{((variant.price) / 100).toLocaleString("en-IN")}
                        </span>
                      )}
                      {isOOS && (
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-red-100 text-red-500 px-1 py-0.5 rounded-full font-bold">
                          OOS
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Low stock warning */}
            {selected && selected.stock > 0 && selected.stock <= 5 && (
              <p className="flex items-center gap-1 text-[11px] text-orange-600 font-semibold mt-1.5">
                <Flame size={12} /> Only {selected.stock} left in {selected.optionName}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}