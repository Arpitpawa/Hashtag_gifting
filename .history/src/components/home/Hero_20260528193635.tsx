"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1513201099705-a9746072f418?w=1600&q=80&fit=crop",
    subtitle: "crafted with emotions",
    title: "GIFTS THAT\nSPEAK LOVE",
    description: "Thoughtfully curated gifting experiences made to turn every moment into a memory.",
    button: "SHOP COLLECTION",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1600&q=80&fit=crop",
    subtitle: "celebrate every bond",
    title: "MAKE EVERY\nMOMENT SPECIAL",
    description: "From birthdays to surprises, discover personalized gifts designed with heart.",
    button: "EXPLORE GIFTS",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&q=80&fit=crop",
    subtitle: "wrapped with happiness",
    title: "CREATE\nUNFORGETTABLE JOY",
    description: "Premium custom gifting collections crafted beautifully for your loved ones.",
    button: "DISCOVER NOW",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slider);
  }, []);

  return (
    <section className="relative w-full bg-[#f6f1eb] ">

      {/* HERO AREA */}
      <div className="relative h-[92vh] lg:h-[88vh] overflow-hidden">

        {/* Slides */}
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

              {/* Background */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>

              {/* Content — button only */}
              <div className="relative z-20 h-full flex items-end justify-center pb-24">
                <a href="/shop">
                  <button className="bg-white text-[#c0555a] border border-white px-10 py-4 text-sm tracking-[2px] font-semibold hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300">
                    {slide.button}
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? "w-10 h-[3px] bg-[#f4d35e]"
                  : "w-5 h-[3px] bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}