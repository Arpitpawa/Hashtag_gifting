"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop",
    subtitle: "Your gifting story begins here",
    title: "MAKE EVERY\nMOMENT\nSPECIAL",
    description:
      "Personalized gifts crafted beautifully for birthdays, anniversaries, weddings, and unforgettable memories.",
  },

  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2000&auto=format&fit=crop",
    subtitle: "Crafted with love & emotions",
    title: "GIFTS THAT\nSPEAK\nHEARTS",
    description:
      "Premium customized gifting collections designed for your loved ones and special occasions.",
  },

  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2000&auto=format&fit=crop",
    subtitle: "Luxury gifting experience",
    title: "CREATE\nMEMORIES\nFOREVER",
    description:
      "Discover unique personalized hampers, wedding gifts, couple gifts and premium keepsakes.",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const slider = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(slider);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">

      <div className="relative h-[78vh] min-h-[650px]">

        <AnimatePresence mode="wait">

          <motion.div
            key={slides[current].id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >

            {/* Background Image */}
            <Image
              src={slides[current].image}
              alt="Hero Banner"
              fill
              priority
              className="object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content */}
            <div className="relative z-10 h-full container-custom flex items-center">

              <div className="max-w-[620px] text-white pt-10">

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#f6d77c] text-[18px] italic mb-4 font-light tracking-wide"
                >
                  {slides[current].subtitle}
                </motion.p>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[88px] leading-[0.92] font-[300] tracking-[-3px] whitespace-pre-line mb-6 uppercase"
                >
                  {slides[current].title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-[18px] leading-[1.8] text-white/90 max-w-[560px]"
                >
                  {slides[current].description}
                </motion.p>

              </div>

            </div>

          </motion.div>

        </AnimatePresence>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-8 bottom-8 z-20 w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition border border-white/50"
        >

          <ChevronLeft
            className="text-[#222]"
            strokeWidth={1.5}
            size={28}
          />

        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute left-28 bottom-8 z-20 w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition border border-white/50"
        >

          <ChevronRight
            className="text-[#222]"
            strokeWidth={1.5}
            size={28}
          />

        </button>

        {/* Dots */}
        <div className="absolute bottom-12 right-10 z-20 flex gap-3">

          {slides.map((_, index) => (

            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? "w-10 h-3 bg-white"
                  : "w-3 h-3 bg-white/50"
              }`}
            />

          ))}

        </div>

      </div>

    </section>
  );
}