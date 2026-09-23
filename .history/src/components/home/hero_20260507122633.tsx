"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-[72vh] overflow-hidden bg-[#f6f1eb]">
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
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/25" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                <div className="max-w-4xl text-white">
                  {/* Subtitle */}
                  <p
                    className="
                      text-[#f4d35e]
                      text-3xl
                      md:text-5xl
                      italic
                      mb-5
                      font-light
                    "
                    style={{
                      fontFamily: "cursive",
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* Main Heading */}
                  <h1
                    className="
                      text-5xl
                      sm:text-6xl
                      md:text-7xl
                      lg:text-8xl
                      leading-[0.95]
                      font-light
                      whitespace-pre-line
                      tracking-tight
                      drop-shadow-lg
                    "
                    style={{
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {slide.title}
                  </h1>

                  {/* Decorative Line */}
                  <div className="mt-5 mb-6">
                    <svg
                      width="180"
                      height="20"
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

                  {/* Description */}
                  <p
                    className="
                      text-lg
                      md:text-2xl
                      leading-relaxed
                      text-white/95
                      max-w-xl
                      font-light
                    "
                  >
                    {slide.description}
                  </p>

                  {/* Button */}
                  <button
                    className="
                      mt-8
                      bg-white
                      text-[#3d4fa3]
                      px-8
                      py-4
                      text-sm
                      md:text-base
                      tracking-[3px]
                      font-semibold
                      hover:bg-[#f4d35e]
                      hover:text-black
                      transition-all
                      duration-300
                      shadow-lg
                    "
                  >
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="
          absolute
          left-5
          top-1/2
          -translate-y-1/2
          z-30
          w-12
          h-12
          rounded-full
          bg-white/20
          backdrop-blur-md
          border border-white/30
          flex items-center justify-center
          text-white
          hover:bg-white
          hover:text-black
          transition-all
        "
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="
          absolute
          right-5
          top-1/2
          -translate-y-1/2
          z-30
          w-12
          h-12
          rounded-full
          bg-white/20
          backdrop-blur-md
          border border-white/30
          flex items-center justify-center
          text-white
          hover:bg-white
          hover:text-black
          transition-all
        "
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
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
                  : "w-5 h-[4px] bg-white/60"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}