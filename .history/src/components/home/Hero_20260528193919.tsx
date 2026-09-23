"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: "https://aicagifts.com/cdn/shop/files/Generative_Fill_3_06168f08-294e-41d7-9a34-acd09592c0c6.jpg?crop=center&height=800&v=1753897752&width=1600",
    button: "SHOP COLLECTION",
    link: "/shop",
  },
  {
    id: 2,
    image: "https://aicagifts.com/cdn/shop/files/Generative_Fill_65f2a7d3-c62c-48eb-a8c3-ed057dbd6bb0.jpg?crop=center&height=800&v=1753897752&width=1600",
    button: "EXPLORE GIFTS",
    link: "/shop",
  },
  {
    id: 3,
    image: "https://aicagifts.com/cdn/shop/files/Generative_Fill_3_06168f08-294e-41d7-9a34-acd09592c0c6.jpg?crop=center&height=800&v=1753897752&width=1600",
    button: "DISCOVER NOW",
    link: "/shop",
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
    <section className="relative w-full bg-[#f6f1eb]">
      <div className="relative h-[92vh] lg:h-[88vh] overflow-hidden">

        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              current === index ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
            }`}
          >
            <img
              src={slide.image}
              alt="Hashtag Gifting"
              className="w-full h-full object-cover"
            />
            <div className="relative z-20 h-full flex items-end justify-start absolute inset-0">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full pb-20">
                <Link
                  href={slide.link}
                  className="inline-block bg-white text-[#c0555a] border border-white px-8 py-4 text-sm tracking-[2px] font-semibold hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300"
                >
                  {slide.button}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index ? "w-10 h-[3px] bg-[#f4d35e]" : "w-5 h-[3px] bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}