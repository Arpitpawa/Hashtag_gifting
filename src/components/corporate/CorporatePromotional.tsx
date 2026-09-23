"use client";

import Link from "next/link";
import { useGroupImages } from "./useRealProducts";

// Temporary stopgap — using the homepage hero product photos here instead of
// the previous hotlinked competitor CDN (confettigifts.in). Swap these for
// real corporate product photography once available.
const HERO_IMGS = [
  "/Personalisedpassportcoverheroimage.png",
  "/personaliseddiariespensheropng.png",
  "/personalisedwalletskeychain.png",
];

// Real product groups (SKU type numbers) — photos come from real products.
const categories = [
  { title: "Diaries & pen sets", desc: "Executive diary, card holder and pen gift sets — personalised with a name or your company logo.", types: "01", link: "/category/diary-pen-combos" },
  { title: "Pens", desc: "Premium metal and crystal-twist pens in black, gold and colours — a gift that gets used every day.", types: "15", link: "/category/pens" },
  { title: "Travel", desc: "Passport covers and travel wallet organisers — personalised for business trips and welcome kits.", types: "02,03,04", link: "/category/passport-covers" },
  { title: "Wallets", desc: "Vegan leather and croc-texture wallets for him — a classic employee and client gift.", types: "11,13,14", link: "/category/mens-wallets" },
  { title: "Desk essentials", desc: "Stationery pouches and multipurpose organisers that keep every desk tidy and on-brand.", types: "06,07", link: "/category/stationery-pouches" },
];

type Card = (typeof categories)[0] & { image: string | null };

function CategoryCard({
  item,
  className = "",
}: {
  item: Card;
  className?: string;
}) {
  return (
    <Link
      href={item.link}
      className={`relative overflow-hidden rounded-2xl block group ${className}`}
    >
      {/* IMAGE */}
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-[#e8e0d5]" />
      )}

      {/* GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {/* HOVER RED TINT */}
      <div className="absolute inset-0 bg-[#c0555a]/0 group-hover:bg-[#c0555a]/15 transition-all duration-500" />

      {/* CONTENT */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <h3
          className="text-white text-2xl md:text-3xl font-normal mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {item.title}
        </h3>
        <p className="text-white/75 text-[13px] leading-relaxed max-w-xs">
          {item.desc}
        </p>
      </div>
    </Link>
  );
}

export default function CorporatePromotional() {
  const images = useGroupImages(categories.map((c) => c.types));
  const cards: Card[] = categories.map((c, i) => ({ ...c, image: images[i] }));
  return (
    <section className="pt-20 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-10 md:mb-12">
          <h2
            className="text-[42px] md:text-[56px] font-normal text-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Popular Corporate Gifts
          </h2>
          <p className="text-[black]/70 text-[14px] md:text-[15px]">
            Personalised gifts your team and clients will actually use
          </p>
        </div>

        
        <div className="flex flex-col gap-4">

          
          <div className="flex flex-col md:flex-row gap-4">

            {/* Drinkware — 2/3 width */}
            <div className="w-full md:w-2/3">
              <CategoryCard
                item={cards[0]}
                className="h-[280px] md:h-[380px] w-full"
              />
            </div>

            {/* Electronics — 1/3 width */}
            <div className="w-full md:w-1/3">
              <CategoryCard
                item={cards[1]}
                className="h-[280px] md:h-[380px] w-full"
              />
            </div>
          </div>

          {/* ── ROW 2 — Travel (large left) + Desk Essentials + Journals stacked right ── */}
          <div className="flex flex-col md:flex-row gap-4">

            {/* Travel — 1/3 width, full height of row */}
            <div className="w-full md:w-1/3">
              <CategoryCard
                item={cards[2]}
                className="h-[280px] md:h-[400px] w-full"
              />
            </div>

            {/* Right side — Desk Essentials + Journals stacked */}
            <div className="w-full md:w-2/3 flex flex-col gap-4">

              {/* Desk Essentials — top half */}
              <CategoryCard
                item={cards[3]}
                className="h-[180px] md:h-[190px] w-full"
              />

              {/* Journals — bottom half */}
              <CategoryCard
                item={cards[4]}
                className="h-[180px] md:h-[190px] w-full"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}