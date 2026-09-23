"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Pooja Khandal",
    reviews: "4 reviews",
    rating: 5,
    time: "5 months ago",
    review:
      "Such a wonderful place to buy gifts! They provide so many customization choices, all at affordable prices. I absolutely loved it and highly recommend everyone to give them a try. They offer a wide range of customization options at very reasonable prices.",
    avatar: "P",
    color: "#e07b7b",
    tag: "Customized Gifts",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Pinky S",
    reviews: "7 reviews",
    rating: 5,
    time: "6 months ago",
    review:
      "I purchased 2 types of custom-made gifts for 3 of my colleagues. Their Spotify acrylic LED stand was so cool that I decided to get one for myself too! The gifts were absolutely loved by everyone.",
    avatar: "P",
    color: "#8fb8d4",
    tag: "Spotify LED Stand",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Rashi Pawa",
    reviews: "5 reviews",
    rating: 5,
    time: "5 months ago",
    review:
      "I wanted some unique and affordable gifts for my class children, and they gave me such wonderful ideas! They truly have amazing and creative options, all within budget. Their service was excellent.",
    avatar: "R",
    color: "#a8c5a0",
    tag: "Bulk Gifting",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Nidhima Bhuta",
    reviews: "3 reviews",
    rating: 5,
    time: "4 months ago",
    review:
      "Hashtag gift always made me way happier by customizing the product which I need. The quality of their product is always a 5 star — the bestest shop for customisation!",
    avatar: "N",
    color: "#f4b56a",
    tag: "Personalized Gift",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop",
  },
];

const caveatFont = { fontFamily: "var(--font-caveat)" };

const GoogleIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24bg-[#f3efe8]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        {/* HEADING */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight mb-2"
            style={caveatFont}
          >
            Gifted with Love
          </h2>
          <p className="text-[#c4922a] text-sm uppercase tracking-[3px] font-medium">
            Big Love From Our Community
          </p>
        </div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, index) => (
            <div key={index} className="flex flex-col">
              {/* PHOTO */}
              <div
                className="relative overflow-hidden rounded-xl mb-5"
                style={{ backgroundColor: t.color + "30" }}
              >
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-[280px] object-cover"
                />
                {/* COLOR OVERLAY on bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-16"
                  style={{
                    background: `linear-gradient(to top, ${t.color}99, transparent)`,
                  }}
                />
              </div>

              {/* NAME + TAG */}
              <div className="mb-3">
                <p className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wide">
                  {t.name}
                </p>
                <p
                  className="text-[12px] font-semibold uppercase tracking-wide mt-0.5"
                  style={{ color: t.color, fontFamily: "var(--font-prompt)" }}
                >
                  {t.tag}
                </p>
              </div>

              {/* STARS */}
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className="fill-[#f4b56a] text-[#f4b56a]"
                  />
                ))}
              </div>

              {/* REVIEW */}
              <p className="text-[13.5px] text-[#555] leading-relaxed flex-1">
                "{t.review}"
              </p>

              {/* FOOTER */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0ece6]">
                <p className="text-[11px] text-[#aaa]">
                  {t.reviews} · {t.time}
                </p>
                <div className="flex items-center gap-1 bg-[#f7f4ef] px-2 py-1 rounded-full">
                  <GoogleIcon size={12} />
                  <span className="text-[10px] text-[#555] font-medium">
                    Google
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM — rating + CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-14 pt-8 border-t border-[#e8e0d5] gap-6">
          {/* RATING */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
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
            <span className="text-[14px] text-[#888]">
              from 2,000+ happy customers on Google
            </span>
          </div>

          {/* CTA */}

          <a
            href="https://maps.app.goo.gl/hashtag-gifts-jaipur"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#e8e0d5] rounded-full text-[13px] text-[#555] hover:border-black hover:text-black transition-all duration-300 bg-white whitespace-nowrap"
          >
            <GoogleIcon size={16} />
            View all Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
}
