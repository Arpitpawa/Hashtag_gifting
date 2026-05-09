"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

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
  },
  {
    name: "Pinky S",
    reviews: "7 reviews",
    rating: 5,
    time: "6 months ago",
    review:
      "I purchased 2 types of custom-made gifts for 3 of my colleagues. Their Spotify acrylic LED stand (personalised with a song and scannable) was so cool that I decided to get one for myself too! The gifts were absolutely loved by everyone.",
    avatar: "P",
    color: "#f4a7b9",
    tag: "Spotify LED Stand",
  },
  {
    name: "Rashi Pawa",
    reviews: "5 reviews",
    rating: 5,
    time: "5 months ago",
    review:
      "I wanted some unique and affordable gifts for my class children, and they gave me such wonderful ideas! They truly have amazing and creative options, all within budget. Their service was excellent — they customised everything perfectly.",
    avatar: "R",
    color: "#a8c5a0",
    tag: "Bulk Gifting",
  },
  {
    name: "Nidhima Bhuta",
    reviews: "3 reviews",
    rating: 5,
    time: "4 months ago",
    review:
      "Hashtag gift always made me way happier by customizing the product which I need. The quality of their product is always a 5 star — the bestest shop for customisation!",
    avatar: "N",
    color: "#8fb8d4",
    tag: "Personalized Gift",
  },
  {
    name: "Drvi Dhankad",
    reviews: "6 reviews",
    rating: 5,
    time: "3 months ago",
    review:
      "Best for emotional & personalized gifts. Probably it's a great option to gift someone on anniversaries or any other occasion. Staff always helpful in choosing combos. Good location in mall for gifts for every special occasion.",
    avatar: "D",
    color: "#f4b56a",
    tag: "Anniversary Gift",
  },
  {
    name: "Agya Chauhan",
    reviews: "4 reviews",
    rating: 5,
    time: "3 months ago",
    review:
      "I always have a very good experience at hashtag gift shop. A good collection of products with good quality and very reasonable price. Highly recommend visiting this store!",
    avatar: "A",
    color: "#b8a9d4",
    tag: "Quality Products",
  },
  {
    name: "Vini Pawa",
    reviews: "5 reviews",
    rating: 5,
    time: "2 months ago",
    review:
      "Bought my first customization product in it is marvelous with so much shimmer in design in every detail. We gifted it to my daughter it is magical, and adorned with the best quality which was extremely exceptional. Not only it they liked it!",
    avatar: "V",
    color: "#c4922a",
    tag: "Custom Design",
  },
  {
    name: "Nikita Sharma",
    reviews: "8 reviews",
    rating: 5,
    time: "1 month ago",
    review:
      "Amazing experience with plenty of gift options. Good work it proves to gift someone. Very patient and helpful staff who helped me choose the perfect gift for my loved ones!",
    avatar: "N",
    color: "#e07b7b",
    tag: "Gift Options",
  },
  {
    name: "Saans Minocha",
    reviews: "3 reviews",
    rating: 5,
    time: "2 months ago",
    review:
      "It is a great shop to buy gifts from. They perform so many customization facilities in a very reasonable price. I loved it highly recommend others to try them too!",
    avatar: "S",
    color: "#a8c5a0",
    tag: "Value for Money",
  },
  {
    name: "Poonam Rangnani",
    reviews: "4 reviews",
    rating: 5,
    time: "5 months ago",
    review:
      "Best shop in town. Friendly staff and beautiful items. Every product is crafted with care and love. Definitely my go-to place for all gifting needs in Jaipur!",
    avatar: "P",
    color: "#8fb8d4",
    tag: "Best Shop",
  },
  {
    name: "Shlawn Bhatt",
    reviews: "6 reviews",
    rating: 5,
    time: "3 months ago",
    review:
      "Their amazing customising exceeded my expectations with exceptional work on my word portraits. The dedication to quality and customer service is commendable. Truly one of the best gifting shops in Jaipur!",
    avatar: "S",
    color: "#f4a7b9",
    tag: "Custom Portraits",
  },
  {
    name: "Dr. Jyoti Dhaker",
    reviews: "12 reviews",
    rating: 5,
    time: "2 months ago",
    review:
      "Got some gifts flash by subscription order which was fulfilled in 2 days. Satisfied experience was observed & can be recommended to others for the same. Excellent service!",
    avatar: "D",
    color: "#b8a9d4",
    tag: "Fast Delivery",
  },
];

const promptFont = { fontFamily: "var(--font-prompt)" };
const caveatFont = { fontFamily: "var(--font-caveat)" };

const bgColors = [
  "bg-[#fdf6ee]",
  "bg-[#eef4fd]",
  "bg-[#eefdf4]",
  "bg-[#fdeef4]",
  "bg-[#f4eef d]",
  "bg-[#fdfaee]",
];

export default function Testimonials() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -380, behavior: "smooth" });
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 380, behavior: "smooth" });
    setActiveIndex((prev) => Math.min(prev + 1, testimonials.length - 1));
  };

  return (
    <section className="py-16 md:py-24 bg-[#f7f4ef]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="mb-12 md:mb-16">
          <p
            className="text-[#c4922a] text-base uppercase tracking-[3px] font-medium mb-3"
            style={promptFont}
          >
            Big Love From Our Community
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2
              className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight max-w-lg"
              style={caveatFont}
            >
              Real Stories,<br />Real Happiness
            </h2>

            {/* OVERALL RATING */}
            <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-sm border border-[#e8e0d5] w-fit">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#f4b56a] text-[#f4b56a]" />
                  ))}
                </div>
                <p className="text-[13px] text-[#888]" style={promptFont}>
                  Google Rating
                </p>
              </div>
              <div className="border-l border-[#e8e0d5] pl-4">
                <p className="text-4xl font-bold text-[#1a1a1a]" style={caveatFont}>4.9</p>
                <p className="text-[12px] text-[#888]" style={promptFont}>2,000+ reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDER */}
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
            className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-4"
          >
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="min-w-[300px] md:min-w-[360px] flex-shrink-0 bg-white rounded-3xl overflow-hidden border border-[#e8e0d5] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* TOP COLOR BAND */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: t.color }}
                />

                {/* CARD BODY */}
                <div className="p-6 flex flex-col gap-4 flex-1">

                  {/* QUOTE ICON + STARS */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-[#f4b56a] text-[#f4b56a]" />
                      ))}
                    </div>
                    <Quote size={22} className="text-[#e8e0d5]" />
                  </div>

                  {/* REVIEW TEXT */}
                  <p
                    className="text-[14px] text-[#3d3d3d] leading-relaxed flex-1"
                    style={promptFont}
                  >
                    "{t.review}"
                  </p>

                  {/* PRODUCT TAG */}
                  <span
                    className="inline-block text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit"
                    style={{
                      backgroundColor: t.color + "20",
                      color: t.color,
                      fontFamily: "var(--font-prompt)",
                    }}
                  >
                    {t.tag}
                  </span>

                  {/* DIVIDER */}
                  <div className="border-t border-[#f0ece6]" />

                  {/* AUTHOR ROW */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1a1a1a] truncate" style={promptFont}>
                        {t.name}
                      </p>
                      <p className="text-[12px] text-[#aaa]" style={promptFont}>
                        {t.reviews} · {t.time}
                      </p>
                    </div>

                    {/* GOOGLE BADGE */}
                    <div className="flex items-center gap-1.5 bg-[#f7f4ef] px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-[10px] font-semibold text-[#555]" style={promptFont}>
                        Google
                      </span>
                    </div>
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

        {/* BOTTOM CTA */}
        <div className="text-center mt-10">
          
            href="https://g.co/kgs/hashtag-gifts-jaipur"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#e8e0d5] rounded-full text-[13px] text-[#555] hover:border-black hover:text-black transition-all duration-300 bg-white"
            style={promptFont}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            View all Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
}