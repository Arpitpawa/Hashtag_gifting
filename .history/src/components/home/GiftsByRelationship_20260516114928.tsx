"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const relationships = [
  {
    label: "For her",
    link: "/category/gifts-for-her",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
  },
  {
    label: "For him",
    link: "/category/gifts-for-him",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
  },
  {
    label: "For couple",
    link: "/category/gifts-for-couple",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
  },
  {
    label: "For girlfriend",
    link: "/category/gifts-for-girlfriend",
    image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
  },
  {
    label: "For boyfriend",
    link: "/category/gifts-for-boyfriend",
    image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
  },
  {
    label: "For parents",
    link: "/category/gifts-for-parents",
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
  },
  {
    label: "For kids",
    link: "/category/gifts-for-kids",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
  },
  {
    label: "For friends",
    link: "/category/gifts-for-friends",
    image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
  },
  {
    label: "For wife",
    link: "/category/gifts-for-wife",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
  },
  {
    label: "For husband",
    link: "/category/gifts-for-husband",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
  },
];

// ── BOTANICAL SVG DECORATIONS ──
const BotanicalTopRight = () => (
  <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M280 20 C240 60, 180 40, 160 100 C140 160, 200 180, 180 240" stroke="#c4922a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
    <path d="M260 10 C220 50, 200 30, 220 90" stroke="#c4922a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
    <path d="M180 20 C200 60, 240 50, 260 90 C240 70, 200 80, 180 20Z" fill="#c4922a" opacity="0.08"/>
    <path d="M220 40 C250 80, 280 60, 290 100 C270 80, 240 90, 220 40Z" fill="#c4922a" opacity="0.06"/>
    <path d="M160 100 C180 80, 220 90, 240 70" stroke="#c4922a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25"/>
    <path d="M170 140 C190 120, 230 130, 250 110" stroke="#c4922a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.2"/>
    <circle cx="270" cy="30" r="3" fill="#c4922a" opacity="0.2"/>
    <circle cx="250" cy="55" r="2" fill="#c4922a" opacity="0.15"/>
    <circle cx="285" cy="70" r="2" fill="#c4922a" opacity="0.15"/>
  </svg>
);

const BotanicalBottomLeft = () => (
  <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M20 280 C60 240, 40 180, 100 160 C160 140, 180 200, 240 180" stroke="#c4922a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
    <path d="M10 260 C50 220, 30 200, 90 220" stroke="#c4922a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
    <path d="M20 180 C60 200, 50 240, 90 260 C70 240, 80 200, 20 180Z" fill="#c4922a" opacity="0.08"/>
    <path d="M40 220 C80 250, 60 280, 100 290 C80 270, 90 240, 40 220Z" fill="#c4922a" opacity="0.06"/>
    <path d="M100 160 C80 180, 90 220, 70 240" stroke="#c4922a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25"/>
    <circle cx="30" cy="270" r="3" fill="#c4922a" opacity="0.2"/>
    <circle cx="55" cy="250" r="2" fill="#c4922a" opacity="0.15"/>
    <circle cx="15" cy="230" r="2" fill="#c4922a" opacity="0.15"/>
  </svg>
);

const BotanicalTopLeft = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M10 10 C40 50, 20 90, 60 110" stroke="#2f3e7a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.15"/>
    <path d="M10 10 C50 30, 70 10, 80 50 C60 30, 30 40, 10 10Z" fill="#2f3e7a" opacity="0.05"/>
    <circle cx="15" cy="80" r="2" fill="#2f3e7a" opacity="0.12"/>
    <circle cx="40" cy="100" r="1.5" fill="#2f3e7a" opacity="0.1"/>
  </svg>
);

export default function GiftsByRelationship() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <section className="pt-0 pb-16 md:pb-20 relative overflow-hidden">

      {/* ── BOTANICAL DECORATIONS ── */}
      <div className="absolute top-0 right-0 w-[220px] h-[220px] pointer-events-none">
        <BotanicalTopRight />
      </div>
      <div className="absolute bottom-0 left-0 w-[220px] h-[220px] pointer-events-none">
        <BotanicalBottomLeft />
      </div>
      <div className="absolute top-0 left-0 w-[120px] h-[120px] pointer-events-none">
        <BotanicalTopLeft />
      </div>

      {/* ── SUBTLE DOT PATTERN ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #c4922a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 relative z-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Find the perfect match
          </span>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Gifts by relationship
          </h2>
          <p className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto">
            Perfect picks for every person in your life
          </p>
        </div>

        {/* ── SLIDER ── */}
        <div className="relative">

          {/* LEFT ARROW */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* CARDS */}
          <div
            ref={sliderRef}
            className="flex gap-6 md:gap-10 overflow-x-auto scroll-smooth no-scrollbar pb-4 px-1"
          >
            {relationships.map((rel, index) => (
              <Link
                key={index}
                href={rel.link}
                className="flex-shrink-0 flex flex-col items-center gap-0 group"
              >
                {/* ARCH IMAGE */}
                <div
                  className="relative overflow-hidden w-[150px] md:w-[175px] shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:scale-105"
                  style={{
                    height: "185px",
                    borderRadius: "100px 100px 16px 16px",
                    border: "3px solid rgba(196,146,42,0.15)",
                  }}
                >
                  <Image
                    src={rel.image}
                    alt={rel.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 150px, 175px"
                  />
                  {/* warm overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* LABEL — pill with contrast bg */}
                <div className="mt-4 px-5 py-2 rounded-full bg-white border border-[#e8e0d5] shadow-sm group-hover:bg-[#1a1a1a] group-hover:border-[#1a1a1a] transition-all duration-300">
                  <p className="text-[13px] md:text-[14px] font-medium text-[#1a1a1a] group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                    {rel.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

      </div>
    </section>
  );
}