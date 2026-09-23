"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import type { SelectedHamperItem } from "@/types/hamper";
import { useHamperStore } from "@/lib/store/hamperStore";

// Local hero photos — stopgap in place of the previous hotlinked
// confettigifts.in competitor CDN images (legal risk).
const HERO_IMGS = [
  "/Personalisedpassportcoverheroimage.png",
  "/personaliseddiariespensheropng.png",
  "/personalisedwalletskeychain.png",
];

// Shown while real DB products load
const FALLBACK: SelectedHamperItem[] = [
  { productId: -1, name: "Classic Beige Box",    slug: "classic-beige-box",    price: 49900,  image: HERO_IMGS[0] },
  { productId: -2, name: "Black Gift Box",        slug: "black-gift-box",        price: 79900,  image: HERO_IMGS[1] },
  { productId: -3, name: "Floral Gift Box",       slug: "floral-gift-box",       price: 59900,  image: HERO_IMGS[2] },
  { productId: -4, name: "Explosion Box",         slug: "explosion-box",         price: 149900, image: HERO_IMGS[0] },
  { productId: -5, name: "Kraft Paper Box",       slug: "kraft-paper-box",       price: 39900,  image: HERO_IMGS[1] },
  { productId: -6, name: "Premium Hamper Basket", slug: "premium-hamper-basket", price: 99900,  image: HERO_IMGS[2] },
];

export default function Step1ChooseBox() {
  const { selectedBox, selectBox } = useHamperStore();
  const [boxes, setBoxes]         = useState<SelectedHamperItem[]>(FALLBACK);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/products?category=gift-hampers&limit=12")
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length > 0) {
          setBoxes(
            data.products.map((p: any) => ({
              productId: p.id,
              name:      p.name,
              slug:      p.slug,
              price:     p.price,
              image:     p.images?.[0] ?? "",
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-[28px] text-[#1a1a1a] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Choose Your Box
        </h2>
        <p className="text-[14px] text-gray-500">
          Select the packaging that sets the vibe
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[13px] text-gray-400 mb-4">
          <Loader2 size={14} className="animate-spin" /> Loading boxes…
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {boxes.map((box) => {
          const isSel = selectedBox?.productId === box.productId;
          return (
            <button
              key={box.productId}
              onClick={() => selectBox(box)}
              className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 group ${
                isSel
                  ? "border-[#c0555a] shadow-md shadow-[#c0555a]/10"
                  : "border-transparent hover:border-gray-200"
              }`}
            >
              <div className="relative aspect-square bg-[#f3efe8]">
                <Image
                  src={box.image}
                  alt={box.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {isSel && <div className="absolute inset-0 bg-[#c0555a]/10" />}
                {isSel && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#c0555a] rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <div className="p-3 bg-white">
                <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{box.name}</p>
                <p className="text-[13px] font-semibold text-[#c0555a] mt-0.5">
                  Rs. {(box.price / 100).toLocaleString("en-IN")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}