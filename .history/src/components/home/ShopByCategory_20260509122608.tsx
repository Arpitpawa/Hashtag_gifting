"use client";

import Link from "next/link";
import Image from "next/image";
import { Gift, Zap, Pencil, RotateCcw } from "lucide-react";

const categories = [
  {
    name: "Birthday Gifts",
    count: "120+ Gifts",
    tag: "Most Loved",
    image:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    link: "/category/birthday",
    accent: "#f4a7b9",
  },
  {
    name: "Anniversary",
    count: "85+ Gifts",
    tag: "Romantic",
    image:
      "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/category/anniversary",
    accent: "#e07b7b",
  },
  {
    name: "Personalized Mugs",
    count: "80+ Designs",
    tag: "Bestseller",
    image:
      "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/category/mugs",
    accent: "#f4b56a",
  },
  {
    name: "Photo Frames",
    count: "65+ Frames",
    tag: "Trending",
    image:
      "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/category/photo-frames",
    accent: "#a8c5a0",
  },
  {
    name: "LED Name Lamps",
    count: "50+ Styles",
    tag: "Glowing ✨",
    image:
      "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    link: "/category/led-lamps",
    accent: "#f4d35e",
  },
  {
    name: "Cushion Covers",
    count: "70+ Prints",
    tag: "Cozy",
    image:
      "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/category/cushions",
    accent: "#b8a9d4",
  },
  {
    name: "Gift Hampers",
    count: "45+ Hampers",
    tag: "Premium",
    image:
      "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/category/hampers",
    accent: "#8fb8d4",
  },
];

const trustSignals = [
  {
    icon: Gift,
    label: "Free Gift Wrapping",
    sub: "On every order",
  },
  {
    icon: Zap,
    label: "3-Hour Delivery",
    sub: "Within Jaipur",
  },
  {
    icon: Pencil,
    label: "100% Customized",
    sub: "Made with love",
  },
  {
    icon: RotateCcw,
    label: "Easy Returns",
    sub: "Hassle-free refunds",
  },
];

const promptFont = { fontFamily: "var(--font-prompt)" };
const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function ShopByCategory() {
  return (
    <section className="pt-0 pb-20 md:pb-28 bg-[#f3efe8] relative overflow-hidden">

      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "#2f3e7a", filter: "blur(80px)", transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "#c4922a", filter: "blur(80px)", transform: "translate(-30%, 30%)" }}
      />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-14 md:mb-16">
          <span
            className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
            style={caveatFont}
          >
            something for everyone
          </span>
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a1a] leading-tight"
            style={caveatFont}
          >
            Shop by Category
          </h2>
          <p
            className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto"
            style={promptFont}
          >
            Handpicked categories for every occasion, every person, every emotion.
          </p>
          <Link
            href="/categories"
            style={promptFont}
            className="inline-flex items-center gap-2 mt-5 text-[13px] font-semibold text-[#2f3e7a] uppercase tracking-[2px] border-b border-[#2f3e7a] pb-0.5 hover:opacity-70 transition-opacity"
          >
            View All Categories
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[220px]">
          <CategoryCard cat={categories[0]} className="col-span-2 row-span-2" textSize="large" />
          <CategoryCard cat={categories[1]} className="col-span-1 row-span-2" textSize="medium" />
          <CategoryCard cat={categories[2]} className="col-span-1 row-span-1" textSize="small" />
          <CategoryCard cat={categories[3]} className="col-span-1 row-span-1" textSize="small" />
          <CategoryCard cat={categories[4]} className="col-span-2 row-span-1" textSize="medium" />
          <CategoryCard cat={categories[5]} className="col-span-1 row-span-1" textSize="small" />
          <CategoryCard cat={categories[6]} className="col-span-1 row-span-1" textSize="small" />
        </div>

        {/* ── TRUST SIGNALS ── */}
        <div className="mt-14 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustSignals.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border border-[#e8e0d5]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#2f3e7a]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} strokeWidth={1.8} className="text-[#2f3e7a]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]" style={promptFont}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-[#888]" style={promptFont}>
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* ── CARD COMPONENT ── */
function CategoryCard({
  cat,
  className = "",
  textSize = "small",
}: {
  cat: (typeof categories)[0];
  className?: string;
  textSize: "large" | "medium" | "small";
}) {
  return (
    <Link
      href={cat.link}
      className={`relative rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer block ${className}`}
    >
      <Image
        src={cat.image}
        alt={cat.name}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* BASE GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* ACCENT TINT on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{ backgroundColor: cat.accent }}
      />

      {/* TAG PILL */}
      {cat.tag && (
        <div className="absolute top-3 left-3 md:top-4 md:left-4">
          <span
            className="inline-block px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-semibold tracking-wide text-white"
            style={{
              backgroundColor: cat.accent + "cc",
              backdropFilter: "blur(8px)",
              fontFamily: "var(--font-prompt)",
            }}
          >
            {cat.tag}
          </span>
        </div>
      )}

      {/* CONTENT */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <h3
          className={`font-bold text-white leading-tight mb-1 ${
            textSize === "large"
              ? "text-3xl md:text-4xl lg:text-5xl"
              : textSize === "medium"
              ? "text-2xl md:text-3xl"
              : "text-lg md:text-xl"
          }`}
          style={caveatFont}
        >
          {cat.name}
        </h3>
        <p className="text-white/70 text-xs md:text-sm" style={promptFont}>
          {cat.count}
        </p>
        <div
          className="flex items-center gap-1.5 mt-2 text-white text-xs font-semibold uppercase tracking-widest opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          style={promptFont}
        >
          Explore
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}