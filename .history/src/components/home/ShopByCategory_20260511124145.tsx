"use client";

import Link from "next/link";
import Image from "next/image";
import { Gift, Zap, Pencil, RotateCcw } from "lucide-react";

const categories = [
  {
    name: "Birthday gifts",
    count: "120+ gifts",
    image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    link: "/category/birthday",
  },
  {
    name: "Anniversary",
    count: "85+ gifts",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/category/anniversary",
  },
  {
    name: "Personalized mugs",
    count: "80+ designs",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/category/mugs",
  },
  {
    name: "Photo frames",
    count: "65+ frames",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/category/photo-frames",
  },
  {
    name: "LED name lamps",
    count: "50+ styles",
    image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    link: "/category/led-lamps",
  },
  {
    name: "Gift hampers",
    count: "45+ hampers",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/category/hampers",
  },
  {
    name: "Cushion covers",
    count: "70+ prints",
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/category/cushions",
  },
  {
    name: "Couple gifts",
    count: "60+ gifts",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/category/couple",
  },
  {
    name: "Wedding gifts",
    count: "55+ gifts",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/category/wedding",
  },
  {
    name: "Bulk gifting",
    count: "45+ options",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/category/bulk",
  },
];

const trustSignals = [
  { icon: Gift, label: "Free gift wrapping", sub: "On every order" },
  { icon: Zap, label: "3-hour delivery", sub: "Within Jaipur" },
  { icon: Pencil, label: "100% customized", sub: "Made with love" },
  { icon: RotateCcw, label: "Easy returns", sub: "Hassle-free refunds" },
];

// Pastel red — warm dusty rose instead of harsh #c0392b
const PASTEL_RED = "#c0555a";
const PASTEL_RED_LIGHT = "#cd6b6f";

export default function ShopByCategory() {
  return (
    <section className="pt-0 pb-0 relative overflow-hidden">

      {/* ── PASTEL RED TOP SECTION ── */}
      <div
        className="pt-14 md:pt-16 pb-16 md:pb-20 px-4 md:px-6 lg:px-10"
        style={{ backgroundColor: PASTEL_RED }}
      >
        {/* HEADING */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-white/50 text-[11px] font-medium uppercase tracking-[4px] mb-3">
            Something for everyone
          </p>
          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-[2px]">
            Shop by category
          </h2>
        </div>

        {/* ── GRID ── */}
        <div className="max-w-[1450px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, index) => (
              <Link
                href={cat.link}
                key={index}
                className="group block bg-white overflow-hidden rounded-md hover:shadow-xl transition-all duration-300"
              >
                {/* IMAGE */}
                <div className="relative h-[160px] md:h-[190px] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>

                {/* NAME */}
                <div className="px-3 py-3">
                  <h3
                    className="text-[13px] md:text-[14px] font-semibold text-[#1a1a1a] leading-snug transition-colors duration-200"
                    style={{ ["--hover-color" as string]: PASTEL_RED }}
                  >
                    <span className={`group-hover:text-[${PASTEL_RED}]`}>
                      {cat.name}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {cat.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* VIEW ALL */}
          <div className="text-center mt-10 small">
            <Link
              href="/categories"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white font-semibold text-[13px] tracking-wider hover:bg-white/90 transition-all duration-300 rounded-full"
              style={{ color: PASTEL_RED }}
            >
              View all categories
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── TRUST SIGNALS ── */}
      <div className="px-4 md:px-6 lg:px-10 py-10 md:py-12">
        <div className="max-w-[1450px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-[#888]">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}