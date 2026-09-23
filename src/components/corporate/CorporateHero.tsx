"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGroupImages } from "./useRealProducts";

// Temporary stopgap — using the homepage hero product photos here instead of
// the previous hotlinked competitor CDN (confettigifts.in) / Unsplash images.
// Swap these for real corporate product photography once available.
const HERO_IMGS = [
  "/Personalisedpassportcoverheroimage.png",
  "/personaliseddiariespensheropng.png",
  "/personalisedwalletskeychain.png",
];

const slides = [
  {
    id: 1,
    image: HERO_IMGS[0],
    button: "GET A FREE QUOTE",
    link: "#inquiry",
  },
  {
    id: 2,
    image: HERO_IMGS[1],
    button: "EXPLORE EMPLOYEE GIFTS",
    link: "/category/employee-hampers",
  },
  {
    id: 3,
    image: HERO_IMGS[2],
    button: "SHOP GIFT COMBOS",
    link: "/category/gift-combos",
  },
];

// Real product types (SKU numbers) — the tile photo is a real product of that type.
const categories = [
  { label: "Diary & pen sets",  types: "01",             link: "/category/diary-pen-combos" },
  { label: "Pens",              types: "15",             link: "/category/pens" },
  { label: "Men's wallets",     types: "11,12,13,14",    link: "/category/mens-wallets" },
  { label: "Passport covers",   types: "02,03",          link: "/category/passport-covers" },
  { label: "Stationery pouches",types: "06",             link: "/category/stationery-pouches" },
  { label: "Gift combos",       types: "19,16,17",       link: "/category/gift-combos" },
];

export default function CorporateHero() {
  const [current, setCurrent] = useState(0);
  const tileImages = useGroupImages(categories.map((c) => c.types));

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
          <div className="flex items-center justify-start xl:justify-center gap-6 md:gap-12 overflow-x-auto no-scrollbar pb-2 px-4">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.link} className="flex flex-col items-center gap-3 flex-shrink-0 group">
                <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden border-2 border-[#e8e0d5] group-hover:border-[#c0555a] transition-all duration-300 group-hover:shadow-lg">
                  {tileImages[i] ? (
                    <img src={tileImages[i] as string} alt={cat.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-[#f5f0ea]" />
                  )}
                </div>
                <p className="text-[12px] text-center text-[#555] group-hover:text-[#c0555a] font-medium transition-colors max-w-[90px] leading-snug">
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERO SLIDER — image only + button ── */}
      <section className="relative w-full">
        {/* xl: not lg: — lg (1024px) also matches iPad Pro in portrait,
            which would get treated like wide desktop and crop oddly. */}
        <div className="relative h-[92vh] xl:h-[88vh] overflow-hidden">
          {slides.map((slide, index) => (
            <div key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                current === index ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
              }`}>
              <img src={slide.image} alt="Hashtag Gifting Corporate"
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 z-20 flex items-end">
                <div className="max-w-[1450px] mx-auto px-6 md:px-12 w-full pb-20">
                  <Link href={slide.link}
                    className="inline-block bg-white text-[#c0555a] border border-white px-8 py-4 text-sm tracking-[2px] font-semibold hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300">
                    {slide.button}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {slides.map((_, index) => (
              <button key={index} onClick={() => setCurrent(index)}
                className={`transition-all duration-300 rounded-full ${
                  current === index ? "w-10 h-[3px] bg-[#c0555a]" : "w-5 h-[3px] bg-white/50 hover:bg-white/80"
                }`} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}