"use client";

import { useState } from "react";
import { X } from "lucide-react";

const messages = [
  "✦ 3-Hour Express Delivery in Jaipur",
  "✦ Free Gift Wrapping on Every Order",
  "✦ 100% Customized & Made with Love",
  "✦ Easy Returns & Hassle-Free Refunds",
  "✦ Same Day Delivery Available in Jaipur",
  "✦ Designed for Every Mood & Occasion",
  "✦ Ready to Gift — Straight from the Heart",
  "✦ Explore 500+ Personalized Gift Ideas",
  "✦ 3-Hour Express Delivery in Jaipur",
  "✦ Free Gift Wrapping on Every Order",
  "✦ 100% Customized & Made with Love",
  "✦ Easy Returns & Hassle-Free Refunds",
  "✦ Same Day Delivery Available in Jaipur",
  "✦ Designed for Every Mood & Occasion",
  "✦ Ready to Gift — Straight from the Heart",
  "✦ Explore 500+ Personalized Gift Ideas",
];

import { usePathname } from "next/navigation";

export default function AnnouncementBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  if (!visible || pathname?.startsWith("/admin")) return null;

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
              {msg}
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
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}