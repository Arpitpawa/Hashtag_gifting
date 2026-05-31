"use client";

import { Gift } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

const TIERS = [
  { label: "1 Free gift",   threshold: 99900  }, // Rs. 999
  { label: "2 Free gifts",  threshold: 199900 }, // Rs. 1999
  { label: "3 Free gifts",  threshold: 299900 }, // Rs. 2999
];

interface Props {
  currentProductPrice: number; // paise
}

export default function ProductFreebieBar({ currentProductPrice }: Props) {
  const { subtotal } = useCartStore();

  // Use cart subtotal + current product if not in cart yet
  const effective = subtotal > 0 ? subtotal : currentProductPrice;

  // Find next tier
  const nextTier  = TIERS.find((t) => effective < t.threshold);
  const topTier   = TIERS[TIERS.length - 1];
  const reached   = !nextTier; // all tiers unlocked

  const progress = reached
    ? 100
    : Math.min(100, Math.round((effective / topTier.threshold) * 100));

  // How much more to unlock next tier
  const amountLeft = nextTier
    ? Math.ceil((nextTier.threshold - effective) / 100) // in rupees
    : 0;

  // Current tier label
  const currentTier = [...TIERS].reverse().find((t) => effective >= t.threshold);

  return (
    <div className="bg-white border border-[#e8e0d5] rounded-2xl px-4 py-3">
      {/* Message */}
      <p className="text-[12px] text-[#555] mb-2.5 flex items-center gap-1.5">
        <Gift size={13} className="text-[#c0555a] flex-shrink-0" />
        {reached ? (
          <span className="font-semibold text-green-700">
            🎉 You've unlocked all freebies!
          </span>
        ) : currentTier ? (
          <>
            <span className="font-semibold text-[#c0555a]">{currentTier.label} unlocked!</span>
            <span className="text-[#888]">Add Rs. {amountLeft} more to get {nextTier?.label}</span>
          </>
        ) : (
          <>
            Add{" "}
            <span className="font-semibold text-[#c0555a]">Rs. {amountLeft}</span>
            {" "}more to unlock a free gift 🎁
          </>
        )}
      </p>

      {/* Progress bar */}
      <div className="relative h-2 bg-[#f0ece6] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#c0555a] to-[#c4922a] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tier markers */}
      <div className="flex items-center justify-between">
        {TIERS.map((tier, i) => {
          const unlocked = effective >= tier.threshold;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 transition-all ${
                  unlocked
                    ? "bg-[#c0555a] border-[#c0555a] text-white"
                    : "bg-white border-[#e8e0d5] text-[#aaa]"
                }`}
              >
                {unlocked ? "✓" : i + 1}
              </div>
              <p className={`text-[9px] font-semibold text-center leading-tight ${unlocked ? "text-[#c0555a]" : "text-[#aaa]"}`}>
                {tier.label}
              </p>
              <p className="text-[9px] text-[#bbb]">
                ≥Rs.{Math.round(tier.threshold / 100)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}