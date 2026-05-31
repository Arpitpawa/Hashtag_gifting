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
    name: "Gift Hampers",
    count: "45+ Hampers",
    tag: "Premium",
    image:
      "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/category/hampers",
    accent: "#8fb8d4",
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
    name: "Couple Gifts",
    count: "60+ Gifts",
    tag: "Romantic",
    image:
      "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/category/couple",
    accent: "#e07b7b",
  },
  {
    name: "Wedding Gifts",
    count: "55+ Gifts",
    tag: "Special",
    image:
      "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/category/wedding",
    accent: "#f4a7b9",
  },
  {
    name: "Bulk Gifting",
    count: "45+ Options",
    tag: "Corporate",
    image:
      "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/category/bulk",
    accent: "#8fb8d4",
  },
];

const trustSignals = [
  { icon: Gift, label: "Free Gift Wrapping", sub: "On every order" },
  { icon: Zap, label: "3-Hour Delivery", sub: "Within Jaipur" },
  { icon: Pencil, label: "100% Customized", sub: "Made with love" },
  { icon: RotateCcw, label: "Easy Returns", sub: "Hassle-free refunds" },
];

const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function ShopByCategory() {
  return (
    <section className="pt-0 pb-0 relative overflow-hidden">
      {/* ── RED BACKGROUND TOP SECTION ── */}
      <div className="bg-[#c0392b] pt-14 md:pt-16 pb-16 md:pb-20 px-4 md:px-6 lg:px-10">
        {/* HEADING */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[4px] mb-3">
            something for everyone
          </p>
          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[3px]">
            Shop by Category
          </h2>
        </div>

        {/* ── GRID — equal cards, white bg, image + name below ── */}
        <div className="max-w-[1450px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, index) => (
              <Link
                href={cat.link}
                key={index}
                className="group block bg-white overflow-hidden rounded-sm hover:shadow-xl transition-all duration-300"
              >
                {/* IMAGE */}
                <div className="relative h-[160px] md:h-[200px] overflow-hidden">
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
                  <h3 className="text-[13px] md:text-[14px] font-semibold text-[#1a1a1a] group-hover:text-[#c0392b] transition-colors duration-200 leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {cat.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* VIEW ALL */}
          <div className="text-center mt-10">
            <Link
              href="/categories"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#c0392b] font-bold text-[12px] uppercase tracking-[3px] hover:bg-white/90 transition-all duration-300 rounded-sm"
            >
              View All Categories
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── TRUST SIGNALS — on warm beige below ── */}
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
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#2f3e7a]"
                  />
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
