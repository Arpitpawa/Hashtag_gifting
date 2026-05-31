"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  { name: "Employee onboarding kit", price: "From Rs. 799", image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800", link: "/corporate/onboarding-kit" },
  { name: "Branded hamper box", price: "From Rs. 1290", image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800", link: "/corporate/hamper-box" },
  { name: "Custom mug set", price: "From Rs. 399", image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800", link: "/corporate/mug-set" },
  { name: "Festival gift box", price: "From Rs. 990", image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800", link: "/corporate/festival-box" },
  { name: "Personalized desk set", price: "From Rs. 599", image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800", link: "/corporate/desk-set" },
  { name: "Client appreciation kit", price: "From Rs. 1490", image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800", link: "/corporate/client-kit" },
];

export default function CorporateProducts() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Onboarding", "Festival", "Client gifts", "Branded"];

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" });

  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="text-center mb-10">
          <span
            className="inline-block text-[#c4922a] text-lg italic mb-2 font-light"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Curated for businesses
          </span>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1a1a1a]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Corporate gifting solutions
          </h2>
          <p className="text-[#6b6b6b] text-base mt-4 max-w-lg mx-auto">
            Premium gifts for every business need — onboarding, festivals, client appreciation & more
          </p>
        </div>

        {/* TABS */}
        <div className="flex justify-center flex-wrap gap-3 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full border-2 text-[13px] font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-[#c0555a] text-white border-[#c0555a]"
                  : "bg-white text-[#c0555a] border-[#c0555a] hover:bg-[#c0555a] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SLIDER */}
        <div className="relative">
          <button onClick={scrollLeft} className="hidden lg:flex absolute -left-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-[#c0555a] hover:text-white transition-all duration-300 border border-[#e8e0d5]">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2 px-1">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.link} className="flex-shrink-0 min-w-[260px] md:min-w-[300px] group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-[260px] overflow-hidden">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="300px" />
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">{cat.name}</h3>
                  <p className="text-[13px] font-bold text-[#c0555a]">{cat.price}</p>
                </div>
              </Link>
            ))}
          </div>

          <button onClick={scrollRight} className="hidden lg:flex absolute -right-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-[#c0555a] hover:text-white transition-all duration-300 border border-[#e8e0d5]">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link href="#inquiry" className="inline-flex items-center gap-3 px-8 py-4 bg-[#c0555a] text-white font-semibold text-[13px] rounded-full hover:bg-[#a84449] transition-all duration-300">
            Request bulk pricing
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}