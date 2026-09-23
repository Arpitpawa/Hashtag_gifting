"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Pooja Khandel",
    review:
      "Such a wonderful place to buy gifts! They provide so many customization choices, all at affordable prices. I absolutely loved it and highly recommend everyone to give them a try.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    bg: "#dbe6dc",
  },
  {
    name: "Pinky S",
    review:
      "I purchased custom-made gifts for my colleagues. Their Spotify acrylic LED stand was so cool that I decided to get one for myself too.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop",
    bg: "#ead8d2",
  },
  {
    name: "Rashi Pawa",
    review:
      "They truly have amazing and creative gifting options within budget. Their service was excellent and they customised everything perfectly.",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop",
    bg: "#dfe3ea",
  },
  {
    name: "Ridhima Sharma",
    review:
      "Hashtag gifts always make me happy by customizing the product which I need. The quality is superb.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    bg: "#ece1d1",
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

    let animationFrame: number;
    let scrollAmount = 0;

    const autoScroll = () => {
      if (!slider) return;

      scrollAmount += 0.4;

      if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
        scrollAmount = 0;
      }

      slider.scrollTo({
        left: scrollAmount,
      });

      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="py-24 bg-[#f7f4ef] overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* HEADING */}
        <div className="text-center mb-16">
          <span className="text-[#c69a63] text-2xl italic" style={caveatFont}>
            stories from our community
          </span>

          <h2
            className="text-5xl md:text-7xl text-[#1f2b46] leading-none mt-2"
            style={caveatFont}
          >
            Loved By Real People
          </h2>

          <p className="text-[#5d6677] text-lg mt-5">
            Real Google reviews from customers who gifted with love
          </p>

          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={17}
                  className="fill-[#e7a856] text-[#e7a856]"
                />
              ))}
            </div>

            <span className="font-semibold text-[#1f2b46]">4.9/5</span>

            <span className="text-[#5d6677]">from 2,000+ customers</span>
          </div>
        </div>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-7 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {[...testimonials, ...testimonials].map((item, index) => (
            <div
              key={index}
              className="min-w-[850px] rounded-[34px] overflow-hidden flex-shrink-0 bg-white"
            >
              {/* IMAGE */}
              <div className="h-[380px] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div
                className="p-10"
                style={{
                  backgroundColor: item.bg,
                }}
              >
                {/* STARS */}
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className="fill-[#e7a856] text-[#e7a856]"
                    />
                  ))}
                </div>

                {/* REVIEW */}
                <p className="text-[28px] leading-[1.6] text-[#24324a] max-w-[95%]">
                  “{item.review}”
                </p>

                {/* AUTHOR */}
                <div className="mt-10">
                  <h3 className="text-4xl text-[#1f2b46]" style={caveatFont}>
                    {item.name}
                  </h3>

                  <p className="text-[#5d6677] mt-2 text-[15px]">
                    Google Verified Review
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
