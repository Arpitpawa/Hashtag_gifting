"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop",
    subtitle: "crafted with emotions",
    title: "GIFTS THAT\nSPEAK LOVE",
    description:
      "Thoughtfully curated gifting experiences made to turn every moment into a memory.",
    button: "SHOP COLLECTION",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop",
    subtitle: "celebrate every bond",
    title: "MAKE EVERY\nMOMENT SPECIAL",
    description:
      "From birthdays to surprises, discover personalized gifts designed with heart.",
    button: "EXPLORE GIFTS",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop",
    subtitle: "wrapped with happiness",
    title: "CREATE\nUNFORGETTABLE JOY",
    description:
      "Premium custom gifting collections crafted beautifully for your loved ones.",
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
    <section className="relative w-full h-screen min-h-[850px] overflow-hidden bg-black">
      
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
            
            {/* IMAGE */}

            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                className="object-cover"
              />

              {/* PREMIUM OVERLAY */}

              <div className="absolute inset-0 bg-black/45" />

              {/* GRADIENT */}

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            </div>

            {/* CONTENT */}

            <div className="relative z-20 h-full flex items-center">
              <div className="max-w-[1450px] mx-auto px-6 md:px-10 lg:px-16 w-full">
                
                <div className="max-w-2xl pt-24 md:pt-32">
                  
                  {/* SUBTITLE */}

                  <p
                    className="
                      text-[#f4d35e]
                      text-lg
                      md:text-2xl
                      italic
                      mb-5
                      font-light
                      tracking-wide
                    "
                    style={{
                      fontFamily: "cursive",
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* TITLE */}

                  <h1
                    className="
                      text-5xl
                      sm:text-6xl
                      md:text-7xl
                      lg:text-8xl
                      leading-[0.9]
                      font-light
                      whitespace-pre-line
                      tracking-[-3px]
                      text-white
                    "
                    style={{
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {slide.title}
                  </h1>

                  {/* DECORATIVE LINE */}

                  <div className="mt-6 mb-7">
                    <svg
                      width="170"
                      height="18"
                      viewBox="0 0 180 20"
                      fill="none"
                    >
                      <path
                        d="M2 10C20 2 40 18 58 10C76 2 96 18 114 10C132 2 152 18 178 10"
                        stroke="#f4d35e"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      text-base
                      md:text-xl
                      leading-relaxed
                      text-white/85
                      max-w-xl
                      font-light
                    "
                  >
                    {slide.description}
                  </p>

                  {/* BUTTONS */}

                  <div className="flex flex-wrap gap-4 mt-10">
                    
                    <button
                      className="
                        bg-white
                        text-black
                        px-8
                        py-4
                        text-sm
                        tracking-[2px]
                        font-semibold
                        hover:bg-[#f4d35e]
                        transition-all
                        duration-300
                      "
                    >
                      {slide.button}
                    </button>

                    <button
                      className="
                        border
                        border-white/40
                        text-white
                        px-8
                        py-4
                        text-sm
                        tracking-[2px]
                        font-semibold
                        hover:bg-white
                        hover:text-black
                        transition-all
                        duration-300
                      "
                    >
                      VIEW COLLECTION
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLIDER DOTS */}

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`
              transition-all duration-300 rounded-full
              ${
                current === index
                  ? "w-10 h-[4px] bg-[#f4d35e]"
                  : "w-4 h-[4px] bg-white/50"
              }
            `}
          />
        ))}
      </div>

      {/* BOTTOM FADE */}

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f8f5f0] to-transparent z-20" />
    </section>
  );
}