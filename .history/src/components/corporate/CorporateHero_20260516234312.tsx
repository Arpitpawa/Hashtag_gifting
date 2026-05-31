"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1800&auto=format&fit=crop",
    subtitle: "built for businesses",
    title: "GIFTS THAT\nGROW BRANDS",
    description: "Premium corporate gifting solutions crafted to strengthen relationships, reward teams and leave lasting impressions.",
    button: "GET A FREE QUOTE",
    link: "#inquiry",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1800&auto=format&fit=crop",
    subtitle: "appreciate your people",
    title: "MAKE EVERY\nEMPLOYEE FEEL VALUED",
    description: "From onboarding kits to festival hampers — custom branded gifts that boost morale and build loyalty.",
    button: "EXPLORE EMPLOYEE GIFTS",
    link: "/corporate/employee-gifts",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1800&auto=format&fit=crop",
    subtitle: "impress your clients",
    title: "STRENGTHEN\nEVERY PARTNERSHIP",
    description: "Luxury hampers, branded merchandise and custom packaging — because great relationships deserve great gifts.",
    button: "BUILD YOUR HAMPER",
    link: "/build-hamper",
  },
];

const categories = [
  { label: "Employee welcome kits", image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=200", link: "/corporate/welcome-kits" },
  { label: "Eco friendly gifts", image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=200", link: "/corporate/eco-gifts" },
  { label: "Client gifts", image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=200", link: "/corporate/client-gifts" },
  { label: "Employee gifts", image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=200", link: "/corporate/employee-gifts" },
  { label: "Drinkware", image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=200", link: "/corporate/drinkware" },
  { label: "Promotional products", image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=200", link: "/corporate/promotional" },
];

export default function CorporateHero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slider);
  }, []);

  return (
    <>
      {/* ── CATEGORY CIRCLES ── */}
      <section className="py-8 bg-white border-b border-[#ececec]">
        <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex items-center justify-center gap-6 md:gap-12 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.link} className="flex flex-col items-center gap-3 flex-shrink-0 group">
                <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden border-2 border-[#e8e0d5] group-hover:border-[#c0555a] transition-all duration-300 group-hover:shadow-lg">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="text-[12px] text-center text-[#555] group-hover:text-[#c0555a] font-medium transition-colors max-w-[90px] leading-snug">
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERO SLIDER ── */}
      <section className="relative w-full bg-[#1a1a1a]">
        <div className="relative h-[92vh] lg:h-[88vh] overflow-hidden">

          {/* SLIDES */}
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  current === index
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-105 z-0"
                }`}
              >
                {/* BG IMAGE */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </div>

                {/* CONTENT */}
                <div className="relative z-20 h-full flex items-center">
                  <div className="max-w-[1450px] mx-auto px-6 md:px-12 w-full">
                    <div className="max-w-2xl text-white">

                      {/* SUBTITLE */}
                      <p
                        className="text-[#c0555a] text-xl md:text-3xl italic mb-4 font-light"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {slide.subtitle}
                      </p>

                      {/* HEADING */}
                      <h1
                        className="text-5xl sm:text-6xl md:text-7xl leading-[0.92] font-light whitespace-pre-line tracking-tight"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {slide.title}
                      </h1>

                      {/* WAVY LINE */}
                      <div className="mt-4 mb-6">
                        <svg width="160" height="18" viewBox="0 0 180 20" fill="none">
                          <path
                            d="M2 10C20 2 40 18 58 10C76 2 96 18 114 10C132 2 152 18 178 10"
                            stroke="#c0555a"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* DESCRIPTION */}
                      <p className="text-base md:text-xl leading-relaxed text-white/80 max-w-xl font-light">
                        {slide.description}
                      </p>

                      {/* CTA BUTTON */}
                      <Link
                        href={slide.link}
                        className="mt-8 inline-flex items-center gap-3 bg-white text-[#c0555a] border-2 border-white px-8 py-4 text-[12px] tracking-[2px] font-bold hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
                      >
                        {slide.button}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DOTS */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`transition-all duration-300 rounded-full ${
                  current === index
                    ? "w-10 h-[3px] bg-[#c0555a]"
                    : "w-5 h-[3px] bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}