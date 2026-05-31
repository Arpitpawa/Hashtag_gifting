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

export default function GiftsByRelationship() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <section className="pt-0 pb-16 md:pb-20 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-12 md:mb-14">
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
                className="flex-shrink-0 flex flex-col items-center gap-4 group"
              >
                {/* ARCH IMAGE */}
                <div
                  className="relative overflow-hidden w-[150px] md:w-[180px] bg-[#f0ebe3] transition-transform duration-500 group-hover:scale-105"
                  style={{
                    height: "190px",
                    borderRadius: "100px 100px 16px 16px",
                  }}
                >
                  <Image
                    src={rel.image}
                    alt={rel.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 150px, 180px"
                  />
                  {/* subtle overlay */}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all duration-300" />
                </div>

                {/* LABEL */}
                <p className="text-[14px] md:text-[15px] font-medium text-[#1a1a1a] group-hover:text-[#c0555a] transition-colors duration-200 text-center">
                  {rel.label}
                </p>
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