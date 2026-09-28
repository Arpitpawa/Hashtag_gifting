"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Props {
  images:          string[];
  productName:     string;
  // Real timestamp of this product's most recent genuine order (see
  // recentPurchases.lastPurchasedAt on the /api/products/[slug] response --
  // excludes FAILED payments and CANCELLED deliveries). This used to be a
  // hardcoded "Someone from Jaipur just bought this, 2 minutes ago" that
  // fired on every single page load regardless of whether that was true --
  // fixed to only ever show a real purchase, or nothing at all.
  lastPurchasedAt: string | null;
}

function timeAgo(iso: string): string {
  const ms  = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1)     return "just now";
  if (min < 60)    return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24)    return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // don't surface a "recent" purchase that's over a month old

export default function ProductPurchasedPopup({ images, productName, lastPurchasedAt }: Props) {
  const [visible, setVisible] = useState(false);

  // The recency check (Date.now()) has to happen inside the effect, not
  // during render -- calling an impure function like Date.now() directly
  // in the component body is a React purity violation (unstable results
  // across re-renders).
  useEffect(() => {
    if (!lastPurchasedAt) return;
    const isRecentEnough = Date.now() - new Date(lastPurchasedAt).getTime() < MAX_AGE_MS;
    if (!isRecentEnough) return;
    const show = setTimeout(() => setVisible(true),  5000);
    const hide = setTimeout(() => setVisible(false), 10000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [lastPurchasedAt]);

  if (!visible || !lastPurchasedAt) return null;

  return (
    <div className="fixed bottom-24 left-4 z-50 animate-in slide-in-from-left-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-[#e8e0d5] max-w-[280px]">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={images[0]} alt="" fill className="object-cover" sizes="48px" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#6b6b6b]">Someone recently bought</p>
          <p className="text-[12px] font-bold text-[#1a1a1a] truncate">{productName}</p>
          <p className="text-[11px] text-[#c0555a]">{timeAgo(lastPurchasedAt)}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-[#aaa] hover:text-[#555] flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
