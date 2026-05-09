"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2200&auto=format&fit=crop",

    subtitle: "Your gifting story begins here",

    title: "FIRST SMILES. FIRST STEPS.",

    description:
      "A timeless baby journal set made to cherish forever.",

    button: "SHOP BABY JOURNAL SET",
  },

  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2200&auto=format&fit=crop",

    subtitle: "Beautifully crafted memories",

    title: "EVERY GIFT TELLS A STORY.",

    description:
      "Luxury personalized gifts designed for every special occasion.",

    button: "EXPLORE COLLECTION",
  },

  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2200&auto=format&fit=crop",

    subtitle: "Crafted with love & emotions",

    title: "MAKE MOMENTS LAST FOREVER.",

    description:
      "Elegant gifting collections crafted beautifully for your loved ones.",

    button: "SHOP NOW",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden">

      <div className="relative h-[78vh] min-h-[720px]">

        <AnimatePresence mode="wait">

          <motion.div
            key={slides[current].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
            <div className="absolute inset-0 bg-black/15" />

            {/* Content */}
            <div className="relative z-10 h-full flex items-start">

              <div className="pt-[110px] pl-[70px] max-w-[760px]">

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#f3d85c] italic text-[30px] leading-none mb-5"
                  style={{
                    fontFamily: "cursive",
                  }}
                >
                  {slides[current].subtitle}
                </motion.p>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white text-[82px] leading-[0.95] mb-5"
                  style={{
                    fontFamily: "serif",
                    fontWeight: 400,
                  }}
                >
                  {slides[current].title}
                </motion.h1>

                {/* Underline */}
                <div className="w-[340px] h-[3px] bg-[#f3d85c] rounded-full mb-6" />

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-white text-[28px] leading-[1.4] mb-8"
                  style={{
                    fontWeight: 300,
                  }}
                >
                  {slides[current].description}
                </motion.p>

                {/* Button */}
                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white text-[#2f3e7a] px-7 py-4 text-[15px] tracking-[1px] hover:bg-[#f5f1e8] transition duration-300"
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {slides[current].button}
                </motion.button>

              </div>

            </div>

          </motion.div>

        </AnimatePresence>

        {/* Slider Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">

          {slides.map((_, index) => (

            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? "w-[70px] h-[4px] bg-white"
                  : "w-[14px] h-[14px] bg-white/60"
              }`}
            />

          ))}

        </div>

      </div>

    </section>
  );
}