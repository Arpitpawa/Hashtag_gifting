"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Pooja Khandel",
    role: "Google Review",
    review:
      "Such a wonderful place to buy gifts! They provide so many customization choices, all at affordable prices. I absolutely loved it and highly recommend everyone to give them a try.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    bg: "#d9e6dc",
  },
  {
    name: "Pinky S",
    role: "Google Review",
    review:
      "I purchased custom-made gifts for my colleagues. Their Spotify acrylic LED stand was so cool that I decided to get one for myself too.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop",
    bg: "#f3dfd7",
  },
  {
    name: "Rashi Pawa",
    role: "Google Review",
    review:
      "They truly have amazing and creative gifting options within budget. Their service was excellent and they customised everything perfectly.",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop",
    bg: "#d8dce8",
  },
  {
    name: "Ridhima Sharma",
    role: "Google Review",
    review:
      "Hashtag gifts always make me happy by customizing the product which I need. The quality is superb.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    bg: "#efe4d3",
  },
  {
    name: "Aqua Chauhan",
    role: "Google Review",
    review:
      "I always have a very good experience at Hashtag gift shop. A good amount of variety with very friendly and humble staff.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
    bg: "#dfe7d8",
  },
];

const promptFont = {
  fontFamily: "var(--font-prompt)",
};

const caveatFont = {
  fontFamily: "var(--font-caveat)",
};

export default function Testimonials() {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    let scrollAmount = 0;

    const autoScroll = setInterval(() => {
      if (!slider) return;

      scrollAmount += 1;

      slider.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });

      if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
        scrollAmount = 0;
      }
    }, 25);

    return () => clearInterval(autoScroll);
  }, []);

  return (
    <section className="py-24 overflow-hidden bg-[#f8f4ee]">
      <div className="max-w-[1500px] mx-auto px-5 lg:px-10">
        {/* HEADING */}
        <div className="text-center mb-16">
          <span className="text-[#c89b63] text-2xl italic" style={caveatFont}>
            stories from our community
          </span>

          <h2
            className="text-5xl md:text-7xl text-[#1f2937] mt-3 leading-none"
            style={caveatFont}
          >
            Loved By Real People
          </h2>

          <p className="text-[#6b7280] mt-5 text-lg">
            Real Google reviews from customers who gifted with love
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className="fill-[#f4b56a] text-[#f4b56a]"
                />
              ))}
            </div>

            <span className="font-semibold text-[#111827]">4.9/5</span>

            <span className="text-[#6b7280]">from 2,000+ customers</span>
          </div>
        </div>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {[...testimonials, ...testimonials].map((item, index) => (
            <div
              key={index}
              className="min-w-[320px] md:min-w-[380px] rounded-[32px] overflow-hidden flex-shrink-0 transition-all duration-500 hover:-translate-y-2 hover:rotate-1"
              style={{
                backgroundColor: item.bg,
              }}
            >
              {/* IMAGE */}
              <div className="h-[280px] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-7">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className="fill-[#f4b56a] text-[#f4b56a]"
                    />
                  ))}
                </div>

                <p className="text-[16px] leading-[1.9] text-[#374151] mb-7">
                  “{item.review}”
                </p>

                <div>
                  <h3 className="text-2xl text-[#111827]" style={caveatFont}>
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-sm text-[#6b7280]">
                    <span>Google Verified Review</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
