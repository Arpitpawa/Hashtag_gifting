"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2200&auto=format&fit=crop",

    subtitle: "Your gifting story begins here",

    title: "FIRST SMILES.\nFIRST STEPS.",

    description:
      "A timeless baby journal set made to cherish forever.",

    button: "SHOP BABY JOURNAL SET",
  },

  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2200&auto=format&fit=crop",

    subtitle: "Let your words flow",

    title: "FROM PLANS TO\nDREAMS.",

    description:
      "A pen that turns thoughts into lasting words.",

    button: "SHOP PEN",
  },

  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2200&auto=format&fit=crop",

    subtitle: "Crafted with love",

    title: "MAKE EVERY\nMOMENT SPECIAL.",

    description:
      "Luxury personalized gifts for unforgettable memories.",

    button: "SHOP COLLECTION",
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

      <div className="relative h-[82vh] min-h-[700px] w-full">

        <AnimatePresence mode="wait">

          <motion.div
            key={slides[current].id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >

            {/* IMAGE */}
            <Image
              src={slides[current].image}
              alt="Hero Banner"
              fill
              priority
              className="object-cover"
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/25" />

            {/* CONTENT */}
            <div className="relative z-10 h-full flex items-start">

              <div className="max-w-[760px] pt-[90px] pl-[85px]">

                {/* SUBTITLE */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="
                    text-[#f0d14b]
                    italic
                    text-[30px]
                    md:text-[34px]
                    leading-none
                    mb-4
                  "
                  style={{
                    fontFamily: "cursive",
                  }}
                >
                  {slides[current].subtitle}
                </motion.p>

                {/* HEADING */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="
                    whitespace-pre-line
                    text-white
                    text-[82px]
                    md:text-[96px]
                    leading-[0.9]
                    tracking-[-2px]
                    font-light
                  "
                  style={{
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {slides[current].title}
                </motion.h1>

                {/* WAVY LINE */}
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "340px" }}
                  transition={{ delay: 0.5 }}
                  className="
                    h-[4px]
                    bg-[#f0d14b]
                    rounded-full
                    mt-4
                    mb-6
                  "
                />

                {/* DESCRIPTION */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="
                    text-white
                    text-[26px]
                    md:text-[30px]
                    leading-[1.35]
                    font-light
                    mb-8
                    max-w-[760px]
                  "
                >
                  {slides[current].description}
                </motion.p>

                {/* BUTTON */}
                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="
                    bg-white
                    text-[#39458a]
                    px-8
                    py-4
                    text-[18px]
                    tracking-[1px]
                    uppercase
                    hover:bg-[#f6f1e8]
                    transition-all
                    duration-300
                    shadow-md
                  "
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

        {/* DOTS */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">

          {slides.map((_, index) => (

            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`
                transition-all duration-300 rounded-full
                ${
                  current === index
                    ? "w-[48px] h-[4px] bg-white"
                    : "w-[10px] h-[10px] bg-white/70"
                }
              `}
            />

          ))}

        </div>

      </div>

    </section>
  );
}