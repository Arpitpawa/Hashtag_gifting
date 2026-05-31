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

// ── GIFTING SVG DECORATIONS ──

// Gift box — top right
const GiftBoxSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Box body */}
    <rect x="60" y="100" width="100" height="75" rx="4" fill="#c4922a" opacity="0.12"/>
    <rect x="60" y="100" width="100" height="75" rx="4" stroke="#c4922a" strokeWidth="1.5" opacity="0.3"/>
    {/* Box lid */}
    <rect x="52" y="82" width="116" height="22" rx="4" fill="#c4922a" opacity="0.15"/>
    <rect x="52" y="82" width="116" height="22" rx="4" stroke="#c4922a" strokeWidth="1.5" opacity="0.35"/>
    {/* Ribbon vertical */}
    <rect x="103" y="82" width="14" height="93" fill="#c4922a" opacity="0.2"/>
    {/* Ribbon horizontal on lid */}
    <rect x="52" y="88" width="116" height="10" fill="#c4922a" opacity="0.2"/>
    {/* Bow left loop */}
    <path d="M110 82 C90 65, 68 70, 75 82 C82 94, 100 88, 110 82Z" fill="#c4922a" opacity="0.25"/>
    {/* Bow right loop */}
    <path d="M110 82 C130 65, 152 70, 145 82 C138 94, 120 88, 110 82Z" fill="#c4922a" opacity="0.25"/>
    {/* Bow center knot */}
    <circle cx="110" cy="82" r="5" fill="#c4922a" opacity="0.35"/>
    {/* Stars around */}
    <path d="M170 40 L172 46 L178 46 L173 50 L175 56 L170 52 L165 56 L167 50 L162 46 L168 46Z" fill="#c4922a" opacity="0.2"/>
    <path d="M40 130 L41.5 135 L47 135 L42.5 138 L44 143 L40 140 L36 143 L37.5 138 L33 135 L38.5 135Z" fill="#c4922a" opacity="0.15"/>
    <circle cx="170" cy="150" r="3" fill="#c4922a" opacity="0.15"/>
    <circle cx="45" cy="80" r="2" fill="#c4922a" opacity="0.12"/>
  </svg>
);

// Ribbon + hearts — bottom left
const RibbonHeartsSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Large heart */}
    <path d="M60 120 C60 100, 40 90, 40 110 C40 130, 60 145, 80 160 C100 145, 120 130, 120 110 C120 90, 100 100, 80 120 C75 113, 68 110, 60 120Z" fill="#c0555a" opacity="0.1"/>
    <path d="M60 120 C60 100, 40 90, 40 110 C40 130, 60 145, 80 160 C100 145, 120 130, 120 110 C120 90, 100 100, 80 120 C75 113, 68 110, 60 120Z" stroke="#c0555a" strokeWidth="1.2" opacity="0.25" fill="none"/>
    {/* Small hearts */}
    <path d="M140 50 C140 43, 132 40, 132 47 C132 54, 140 59, 148 65 C156 59, 164 54, 164 47 C164 40, 156 43, 148 50 C146 47, 143 45, 140 50Z" fill="#c0555a" opacity="0.15"/>
    <path d="M25 50 C25 46, 20 44, 20 48 C20 52, 25 55, 30 58 C35 55, 40 52, 40 48 C40 44, 35 46, 30 50 C29 48, 27 46, 25 50Z" fill="#c4922a" opacity="0.2"/>
    {/* Wavy ribbon */}
    <path d="M10 100 C30 90, 50 110, 70 100 C90 90, 110 110, 130 100" stroke="#c4922a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.25"/>
    <path d="M10 115 C30 105, 50 125, 70 115 C90 105, 110 125, 130 115" stroke="#c4922a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.18"/>
    {/* Sparkles */}
    <path d="M155 100 L157 106 L163 108 L157 110 L155 116 L153 110 L147 108 L153 106Z" fill="#c4922a" opacity="0.2"/>
    <circle cx="30" cy="160" r="3" fill="#c0555a" opacity="0.15"/>
    <circle cx="170" cy="80" r="2" fill="#c4922a" opacity="0.12"/>
  </svg>
);

// Confetti + star — top left small
const ConfettiSVG = () => (
  <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Confetti pieces */}
    <rect x="20" y="30" width="10" height="14" rx="2" fill="#c4922a" opacity="0.2" transform="rotate(-25 20 30)"/>
    <rect x="50" y="15" width="8" height="12" rx="2" fill="#c0555a" opacity="0.18" transform="rotate(15 50 15)"/>
    <rect x="80" y="25" width="9" height="13" rx="2" fill="#2f3e7a" opacity="0.12" transform="rotate(-10 80 25)"/>
    <rect x="110" y="10" width="7" height="11" rx="2" fill="#c4922a" opacity="0.18" transform="rotate(30 110 10)"/>
    <circle cx="35" cy="70" r="5" fill="#c0555a" opacity="0.12"/>
    <circle cx="100" cy="50" r="4" fill="#c4922a" opacity="0.15"/>
    <circle cx="130" cy="80" r="3" fill="#2f3e7a" opacity="0.1"/>
    {/* Star */}
    <path d="M65 90 L67.5 98 L76 98 L69.5 103 L72 111 L65 106 L58 111 L60.5 103 L54 98 L62.5 98Z" fill="#c4922a" opacity="0.2"/>
    {/* Wavy lines */}
    <path d="M10 120 C25 115, 40 125, 55 120" stroke="#c4922a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.2"/>
  </svg>
);

// Sparkle wand — bottom right small  
const SparkleSVG = () => (
  <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Wand */}
    <line x1="30" y1="120" x2="100" y2="50" stroke="#c4922a" strokeWidth="2" strokeLinecap="round" opacity="0.25"/>
    {/* Wand tip star */}
    <path d="M100 50 L103 58 L112 58 L105 64 L108 72 L100 66 L92 72 L95 64 L88 58 L97 58Z" fill="#c4922a" opacity="0.3"/>
    {/* Sparkles */}
    <path d="M120 90 L121.5 95 L127 96.5 L121.5 98 L120 103 L118.5 98 L113 96.5 L118.5 95Z" fill="#c4922a" opacity="0.22"/>
    <path d="M50 30 L51 33 L54 34 L51 35 L50 38 L49 35 L46 34 L49 33Z" fill="#c0555a" opacity="0.22"/>
    <circle cx="135" cy="50" r="3" fill="#c4922a" opacity="0.18"/>
    <circle cx="80" cy="120" r="2.5" fill="#c0555a" opacity="0.15"/>
    <circle cx="110" cy="120" r="2" fill="#c4922a" opacity="0.12"/>
  </svg>
);

export default function GiftsByRelationship() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <section className="pt-0 pb-16 md:pb-20 relative overflow-hidden">

      {/* ── GIFTING SVG DECORATIONS ── */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] pointer-events-none">
        <GiftBoxSVG />
      </div>
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] pointer-events-none">
        <RibbonHeartsSVG />
      </div>
      <div className="absolute top-0 left-0 w-[140px] h-[140px] pointer-events-none">
        <ConfettiSVG />
      </div>
      <div className="absolute bottom-0 right-0 w-[140px] h-[140px] pointer-events-none">
        <SparkleSVG />
      </div>

      {/* ── SUBTLE DOT PATTERN ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
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
            className="text-[42px] md:text-[56px] font-normal text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
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
                  className="relative overflow-hidden w-[150px] md:w-[175px] shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1"
                  style={{
                    height: "185px",
                    borderRadius: "100px 100px 16px 16px",
                    border: "2px solid rgba(196,146,42,0.2)",
                  }}
                >
                  <Image
                    src={rel.image}
                    alt={rel.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 150px, 175px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* ── LABEL BUTTON — white bg, red text → red bg, white text on hover ── */}
                <div className="mt-4 px-5 py-2 rounded-full bg-white border-2 border-[#c0555a] group-hover:bg-[#c0555a] transition-all duration-300">
                  <p className="text-[13px] md:text-[14px] font-semibold text-[#c0555a] group-hover:text-white transition-colors duration-300 whitespace-nowrap tracking-wide">
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