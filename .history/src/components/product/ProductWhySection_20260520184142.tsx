"use client";

import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export default function ProductWhySection({ product }: Props) {
  // derive context from product flags
  const isCustomizable = product.customizable;
  const categoryName   = product.category?.name || "Gift";

  const panels = [
    {
      tag:   "WHY THIS GIFT",
      emoji: "🎁",
      title: `The perfect ${categoryName.toLowerCase()} they'll treasure`,
      desc:  "Designed with love, crafted with precision. This isn't just another gift — it's a personalised keepsake they'll cherish for years.",
      highlight: null,
    },
    {
      tag:   "MAKE IT PERSONAL",
      emoji: "✨",
      title: isCustomizable ? "Add their name, photo or message" : "A gift they'll always remember",
      desc:  isCustomizable
        ? "Our live preview shows exactly how it will look before you order. Every detail, exactly as you imagined."
        : "Thoughtfully chosen, beautifully packaged. Give a gift that feels truly special.",
      highlight: isCustomizable ? "Unique to them. Every single time." : null,
    },
    {
      tag:   "PERFECT FOR",
      emoji: "💝",
      title: "Any occasion, any relationship",
      desc:  null,
      occasions: [
        "Birthdays", "Anniversaries", "Weddings",
        "Graduations", "Corporate Gifts", "Festivals",
        "Baby Showers", "Housewarmings",
      ],
    },
  ];

  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {panels.map((panel, i) => (
          <div
            key={i}
            className="bg-white border border-[#e8e0d5] rounded-3xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300"
          >
            {/* Tag */}
            <div className="inline-flex">
              <span className="text-[10px] font-bold tracking-[0.15em] text-[#c0555a] uppercase bg-[#c0555a]/10 px-3 py-1 rounded-full">
                {panel.tag}
              </span>
            </div>

            {/* Emoji */}
            <div className="text-5xl">{panel.emoji}</div>

            {/* Title */}
            <h3 className="text-[18px] font-bold text-[#1a1a1a] leading-snug">
              {panel.title}
            </h3>

            {/* Body */}
            {panel.desc && (
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{panel.desc}</p>
            )}

            {/* Highlight */}
            {panel.highlight && (
              <p className="text-[13px] font-semibold text-[#c0555a] italic">{panel.highlight}</p>
            )}

            {/* Occasions grid */}
            {panel.occasions && (
              <div className="flex flex-wrap gap-2">
                {panel.occasions.map((occ) => (
                  <span
                    key={occ}
                    className="text-[11px] font-semibold text-[#1a1a1a] bg-[#f3efe8] border border-[#e8e0d5] px-2.5 py-1 rounded-full"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}