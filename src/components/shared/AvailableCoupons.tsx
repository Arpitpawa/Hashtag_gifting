"use client";

import { useEffect, useState } from "react";
import { Tag, ChevronDown, Loader2, Lock } from "lucide-react";

interface ActiveCoupon {
  code:          string;
  type:          "PERCENT" | "FLAT";
  value:         number;
  minAmount:     number;
  applyTo:       string;
  discountLabel: string;
  description:   string;
  eligible:      boolean | null; // null when subtotal wasn't provided
}

interface Props {
  subtotal?: number;                 // current cart subtotal in paise, optional
  onApply:   (code: string) => void; // parent owns the actual apply/validate call
  className?: string;
  collapsedCount?: number;           // how many to show before "View all" — default 2
}

export default function AvailableCoupons({
  subtotal, onApply, className = "", collapsedCount = 2,
}: Props) {
  const [coupons, setCoupons] = useState<ActiveCoupon[] | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const url = subtotal != null
      ? `/api/coupons/active?subtotal=${Math.round(subtotal)}`
      : `/api/coupons/active`;

    fetch(url)
      .then(res => res.json())
      .then(data => { if (!cancelled) setCoupons(data.coupons || []); })
      .catch(() => { if (!cancelled) setCoupons([]); });

    return () => { cancelled = true; };
  }, [subtotal]);

  // Loading — small skeleton, avoids layout jump
  if (coupons === null) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: collapsedCount }).map((_, i) => (
          <div key={i} className="h-16 bg-[#f3efe8] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Nothing to show — render nothing, don't clutter the page with an empty state
  if (coupons.length === 0) return null;

  const visible = expanded ? coupons : coupons.slice(0, collapsedCount);
  const hasMore = coupons.length > collapsedCount;

  return (
    <div className={className}>
      <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-2">
        Available offers
      </p>
      <div className="flex flex-col gap-2">
        {visible.map(c => (
          <div
            key={c.code}
            className={`flex items-center gap-3 bg-white border border-dashed rounded-xl p-3 transition-colors ${
              c.eligible === false ? "border-[#e8e0d5] opacity-60" : "border-[#e8e0d5] hover:border-[#c0555a]"
            }`}
          >
            <div className="flex flex-col items-center justify-center w-16 flex-shrink-0 border-r border-dashed border-[#e8e0d5] pr-3">
              <Tag size={14} className="text-[#c0555a] mb-0.5" />
              <span className="text-[9px] font-bold tracking-wide text-[#c0555a] font-mono truncate max-w-full">
                {c.code}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#1a1a1a]">{c.discountLabel}</p>
              <p className="text-[11px] text-[#888] truncate">{c.description}</p>
            </div>
            {c.eligible === false ? (
              <span className="text-[10px] text-[#aaa] font-medium flex items-center gap-1 flex-shrink-0">
                <Lock size={10} />
                Add Rs. {Math.ceil((c.minAmount * 100 - (subtotal || 0)) / 100)} more
              </span>
            ) : (
              <button
                onClick={() => onApply(c.code)}
                className="text-[12px] text-[#c0555a] font-bold hover:underline flex-shrink-0"
              >
                Apply
              </button>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[12px] text-[#c0555a] font-semibold mt-2 hover:underline"
        >
          {expanded ? "Show less" : `View all ${coupons.length} coupons`}
          <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}