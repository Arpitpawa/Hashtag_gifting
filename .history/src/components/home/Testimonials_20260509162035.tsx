"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Jaipur",
    rating: 5,
    product: "Custom LED Name Lamp",
    review:
      "Absolutely loved it! The LED lamp with my boyfriend's name looked stunning. Delivered within 3 hours as promised. Will definitely order again for every occasion!",
    avatar: "PS",
    color: "#f4a7b9",
  },
  {
    name: "Rahul Verma",
    location: "Jaipur",
    rating: 5,
    product: "Photo Memory Box",
    review:
      "Ordered a memory box for my parents' anniversary. The quality was beyond expectations and the packaging was so premium. My mom literally cried happy tears!",
    avatar: "RV",
    color: "#8fb8d4",
  },
  {
    name: "Sneha Agarwal",
    location: "Jaipur",
    rating: 5,
    product: "Couple Photo Frame",
    review:
      "The frame came out so beautiful! Got it customized with our photo and a special message. Same day delivery is a lifesaver. Hashtag Gifting is my go-to now!",
    avatar: "SA",
    color: "#a8c5a0",
  },
  {
    name: "Arjun Mehta",
    location: "Jaipur",
    rating: 5,
    product: "Metal Wallet Card",
    review:
      "Got the metal wallet card for my best friend's birthday. He was completely surprised — said it was the most unique gift he'd ever received. Super happy with it!",
    avatar: "AM",
    color: "#f4b56a",
  },
  {
    name: "Divya Joshi",
    location: "Jaipur",
    rating: 5,
    product: "Wedding Caricature",
    review:
      "The caricature was spot on and looked exactly like us! Great attention to detail. The team was very responsive and made changes as requested. Highly recommend!",
    avatar: "DJ",
    color: "#b8a9d4",
  },
  {
    name: "Karan Gupta",
    location: "Jaipur",
    rating: 5,
    product: "Custom Spotify Frame",
    review:
      "Gifted this to my girlfriend on Valentine's Day with our favourite song. She absolutely loved it! The print quality is top notch and delivery was super fast.",
    avatar: "KG",
    color: "#e07b7b",
  },
  {
    name: "Ananya Singh",
    location: "Jaipur",
    rating: 5,
    product: "Gift Hamper",
    review:
      "Ordered a customized hamper for my sister's birthday. Everything was perfectly curated and wrapped so beautifully. She couldn't stop talking about it all day!",
    avatar: "AS",
    color: "#f4d35e",
  },
  {
    name: "Vikram Rao",
    location: "Jaipur",
    rating: 5,
    product: "Personalized Mug",
    review:
      "Simple but so thoughtful. Got a mug with a custom photo and message for my mom on Mother's Day. The colours were vibrant and it arrived perfectly on time!",
    avatar: "VR",
    color: "#2f3e7a",
  },
];

const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function Testimonials() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" });
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" });
    setActiveIndex((prev) => Math.min(prev + 1, testimonials.length - 1));
  };

  return (
    <section className="pt-0 pb-16 md:pb-24 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        {/* ── HEADING ── */}
        <div className="text-center mb-12 md:mb-14">
          <span
            className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
            style={caveatFont}
          >
            straight from the heart
          </span>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight"
            style={caveatFont}
          >
            What Our Customers Say
          </h2>
          <p className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto">
            Real stories from real people who gifted with love
          </p>

          {/* OVERALL RATING */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className="fill-[#f4b56a] text-[#f4b56a]"
                />
              ))}
            </div>
            <span className="text-[15px] font-semibold text-[#1a1a1a]">
              4.9
            </span>
            <span className="text-[14px] text-[#6b6b6b]">
              from 2,000+ happy customers
            </span>
          </div>
        </div>

        {/* ── SLIDER ── */}
        <div className="relative">
          {/* LEFT ARROW */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* CARDS */}
          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2"
          >
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="min-w-[300px] md:min-w-[340px] flex-shrink-0 bg-white rounded-2xl p-6 border border-[#e8e0d5] flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300"
              >
                {/* STARS */}
                <div className="flex items-center gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[#f4b56a] text-[#f4b56a]"
                    />
                  ))}
                </div>

                {/* REVIEW */}
                <p className="text-[14px] md:text-[15px] text-[#3d3d3d] leading-relaxed flex-1">
                  "{t.review}"
                </p>

                {/* PRODUCT TAG */}
                <div>
                  <span
                    className="inline-block text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: t.color + "22",
                      color: t.color === "#f4d35e" ? "#a07c00" : t.color,
                      fontFamily: "var(--font-prompt)",
                    }}
                  >
                    {t.product}
                  </span>
                </div>

                {/* DIVIDER */}
                <div className="border-t border-[#f0ece6]" />

                {/* AUTHOR */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                    style={{
                      backgroundColor:
                        t.color === "#f4d35e" ? "#c4922a" : t.color,
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">
                      {t.name}
                    </p>
                    <p className="text-[12px] text-[#888]">📍 {t.location}</p>
                  </div>
                  {/* VERIFIED */}
                  <div className="ml-auto">
                    <span className="text-[10px] font-semibold text-[#2f3e7a] bg-[#2f3e7a]/10 px-2 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
