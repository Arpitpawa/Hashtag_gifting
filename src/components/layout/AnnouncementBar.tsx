"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

// Static lines, unrelated to catalog size.
const STATIC_MESSAGES = [
  "3-Hour Express Delivery in Jaipur",
  "Dedicated Customer Care, Always Here to Help",
  "100% Customized & Made with Love",
  "Easy Returns — Excludes Personalised Items",
  "Same Day Delivery Available in Jaipur",
  "Designed for Every Mood & Occasion",
  "Ready to Gift — Straight from the Heart",
];

interface AnnouncementBarProps {
  // Live count of ACTIVE products (already rounded to a marketing-friendly
  // step like "200"), fetched server-side in the root layout — never a
  // hardcoded figure that drifts as the catalog grows. Undefined only if
  // that fetch failed, in which case the line is dropped rather than
  // showing a stale number.
  productCount?: number;
}

export default function AnnouncementBar({ productCount }: AnnouncementBarProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  if (!visible || pathname?.startsWith("/admin")) return null;

  const catalogMessage =
    productCount && productCount > 0
      ? `Explore ${productCount}+ Personalized Gift Ideas`
      : "Explore Our Personalized Gift Ideas";

  const messages = [...STATIC_MESSAGES, catalogMessage];

  return (
    <div className="relative bg-[#f3efe8] border-b border-[#ddd8cf] overflow-hidden">

      {/* MARQUEE TRACK */}
      <div className="flex items-center h-[40px] overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {messages.map((msg, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 mx-6 text-[13px] font-medium tracking-wide text-black"
            >
              <Sparkles size={12} className="text-[#c0555a] flex-shrink-0" /> {msg}
            </span>
          ))}
        </div>

        {/* DUPLICATE for seamless loop */}
        <div className="flex animate-marquee whitespace-nowrap" aria-hidden>
          {messages.map((msg, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 mx-6 text-[13px] font-medium tracking-wide text-black"
            >
              <Sparkles size={12} className="text-[#c0555a] flex-shrink-0" /> {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
