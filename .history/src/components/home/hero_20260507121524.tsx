"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
    button: "SHOP COLLECTION",
  },

  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2000&auto=format&fit=crop",
    subtitle: "Crafted with love & emotions",
    title: "GIFTS THAT\nSPEAK\nHEARTS",
    description:
      "Premium customized gifting collections designed for your loved ones and special occasions.",
    button: "EXPLORE GIFTS",
  },

  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2000&auto=format&fit=crop",
    subtitle: "Luxury gifting experience",
    title: "CREATE\nMEMORIES\nFOREVER",
    description:
      "Discover unique personalized hampers, wedding gifts, couple gifts and premium keepsakes.",
    button: "VIEW COLLECTION",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(slider);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">

      <div className="relative h-[82vh] min-h-[720px]">

        <AnimatePresence mode="wait">

          <motion.div
            key={slides[current].id}
            initial={{ opacity: 0, scale: 1.05 }}
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
            <div className="absolute inset-0 bg-black/35" />

            {/* Content */}
            <div className="relative z-10 h-full container-custom flex items-center">

              <div className="max-w-[650px] text-white">

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#f6d77c] text-[20px] italic mb-5 font-light tracking-wide"
                >
                  {slides[current].subtitle}
                </motion.p>

                {/* Main Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[92px] leading-[0.9] tracking-[-4px] font-[300] uppercase whitespace-pre-line mb-8"
                >
                  {slides[current].title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-[22px] leading-[1.7] text-white/90 max-w-[620px] mb-10 font-light"
                >
                  {slides[current].description}
                </motion.p>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white text-[#2f3e7a] px-9 py-4 text-[14px] tracking-[2px] uppercase hover:bg-[#f5f1e8] transition duration-300"
                >
                  {slides[current].button}
                </motion.button>

              </div>

            </div>

          </motion.div>

        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-10 right-10 z-20 flex items-center gap-3">

          {slides.map((_, index) => (

            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? "w-10 h-[6px] bg-white"
                  : "w-[6px] h-[6px] bg-white/50"
              }`}
            />

          ))}

        </div>

      </div>

    </section>
  );
}