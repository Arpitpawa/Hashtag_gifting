"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import type { GiftCard } from "@/types/hamper";
import { useHamperStore } from "@/lib/store/hamperStore";

// Local hero photos — stopgap in place of the previous hotlinked
// confettigifts.in competitor CDN images (legal risk). These don't actually
// depict greeting cards (we don't have real card-design photos yet) — worth
// swapping for real card mockups whenever those exist.
const HERO_IMGS = [
  "/Personalisedpassportcoverheroimage.png",
  "/personaliseddiariespensheropng.png",
  "/personalisedwalletskeychain.png",
];

const CARDS: GiftCard[] = [
  { id: "none",           name: "No Card",          price: 0,     image: HERO_IMGS[0] },
  { id: "birthday",       name: "Happy Birthday",   price: 0,     image: HERO_IMGS[1] },
  { id: "anniversary",    name: "Anniversary",      price: 0,     image: HERO_IMGS[2] },
  { id: "thankyou",       name: "Thank You",        price: 0,     image: HERO_IMGS[0] },
  { id: "love",           name: "With Love",        price: 0,     image: HERO_IMGS[1] },
  { id: "premium-floral", name: "Premium Floral",   price: 9900,  image: HERO_IMGS[2] },
  { id: "luxury-gold",    name: "Luxury Gold Foil", price: 19900, image: HERO_IMGS[0] },
  { id: "handmade",       name: "Handmade Paper",   price: 14900, image: HERO_IMGS[1] },
];

export default function Step3SelectCard() {
  const { selectedCard, selectCard } = useHamperStore();

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-[28px] text-[#1a1a1a] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Select a Card
        </h2>
        <p className="text-[14px] text-gray-500">
          Add a heartfelt message card — most are free!
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CARDS.map((card) => {
          const isSel  = selectedCard?.id === card.id || (card.id === "none" && !selectedCard);
          const isFree = card.price === 0;

          return (
            <button
              key={card.id}
              onClick={() => selectCard(card.id === "none" ? null : card)}
              className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 group ${
                isSel
                  ? "border-[#c0555a] shadow-md shadow-[#c0555a]/10"
                  : "border-transparent hover:border-gray-200"
              }`}
            >
              <div className="relative aspect-[3/4] bg-[#f3efe8]">
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {isSel && <div className="absolute inset-0 bg-[#c0555a]/10" />}
                {isSel && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#c0555a] rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" strokeWidth={2.5} />
                  </div>
                )}
                {!isFree && (
                  <div className="absolute top-2 left-2 bg-[#c4922a] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Premium
                  </div>
                )}
              </div>
              <div className="p-2.5 bg-white">
                <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{card.name}</p>
                <p className="text-[11px] font-semibold text-[#c0555a] mt-0.5">
                  {isFree ? "Free" : `Rs. ${(card.price / 100).toLocaleString("en-IN")}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}