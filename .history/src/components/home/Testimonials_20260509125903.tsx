"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Priya Sharma",
    location: "Jaipur",
    rating: 5,
    date: "2 weeks ago",
    avatar: "PS",
    avatarBg: "#f4a7b9",
    text: "Absolutely loved the customized gift hamper I ordered for my boyfriend's birthday! The packaging was stunning and delivery was super fast. Will definitely order again! 💕",
    product: "Birthday Gift Hamper",
  },
  {
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    date: "1 month ago",
    avatar: "RV",
    avatarBg: "#8fb8d4",
    text: "Ordered a personalized LED lamp for our anniversary. The quality exceeded my expectations. My wife was in tears seeing it! Hashtag Gifting never disappoints.",
    product: "LED Name Lamp",
  },
  {
    name: "Sneha Agarwal",
    location: "Jaipur",
    rating: 5,
    date: "3 weeks ago",
    avatar: "SA",
    avatarBg: "#a8c5a0",
    text: "The custom photo frame I ordered was perfect. Great print quality and arrived beautifully packed with a handwritten note. Such a thoughtful touch! ✨",
    product: "Custom Photo Frame",
  },
  {
    name: "Arjun Mehta",
    location: "Mumbai",
    rating: 5,
    date: "2 months ago",
    avatar: "AM",
    avatarBg: "#f4b56a",
    text: "Ordered 50+ corporate gifts for our company event. The team handled everything professionally and all gifts were customized perfectly with our logo. Highly recommend!",
    product: "Corporate Gift Hampers",
  },
  {
    name: "Kavita Joshi",
    location: "Jaipur",
    rating: 5,
    date: "1 week ago",
    avatar: "KJ",
    avatarBg: "#b8a9d4",
    text: "Got the explosion box for my sister's birthday and she absolutely loved it! The detailing and customization was top notch. 3 hour delivery is a lifesaver! 🎁",
    product: "Explosion Box",
  },
  {
    name: "Vikram Singh",
    location: "Jaipur",
    rating: 5,
    date: "3 months ago",
    avatar: "VS",
    avatarBg: "#e07b7b",
    text: "Best gifting store in Jaipur hands down! Ordered a caricature for my parents' anniversary and it looked exactly like them. The quality and packaging was superb.",
    product: "Wedding Caricature",
  },
  {
    name: "Nisha Gupta",
    location: "Agra",
    rating: 5,
    date: "5 weeks ago",
    avatar: "NG",
    avatarBg: "#f4d35e",
    text: "Same day delivery is real! Ordered at 11am and received by 2pm. The metal wallet card was beautiful and my husband was so surprised. Amazing service! ⭐",
    product: "Metal Wallet Card",
  },
  {
    name: "Mohit Bansal",
    location: "Jaipur",
    rating: 4,
    date: "2 months ago",
    avatar: "MB",
    avatarBg: "#2f3e7a",
    text: "Really good quality products and fast delivery. The custom mug print was clear and vibrant. Would love more design options but overall very happy with the purchase!",
    product: "Personalized Mug",
  },
];


const caveatFont = { fontFamily: "var(--font-caveat)" };

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "fill-[#f4b56a] text-[#f4b56a]" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" });
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" });
    setActiveIndex((prev) => Math.min(prev + 1, reviews.length - 1));
  };

  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <section className="pt-0 pb-16 md:pb-24 relative overflow-hidden">

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-14">
          <div>
            <span
              className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
              style={caveatFont}
            >
              straight from the heart
            </span>
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a1a] leading-tight"
              style={caveatFont}
            >
              What Our Customers Say
            </h2>
          </div>

          {/* GOOGLE RATING BADGE */}
          <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 border border-[#e8e0d5] shadow-sm self-start md:self-auto flex-shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png"
              alt="Google"
              className="h-5 w-auto object-contain"
            />
            <div className="h-8 w-px bg-[#e8e0d5]" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-[#1a1a1a]" style={caveatFont}>
                  {avgRating}
                </span>
                <Star size={18} className="fill-[#f4b56a] text-[#f4b56a]" />
              </div>
              <span className="text-[11px] text-[#888]" >
                Google Reviews
              </span>
            </div>
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
            {reviews.map((review, index) => (
              <div
                key={index}
                className="min-w-[300px] md:min-w-[340px] flex-shrink-0 bg-white rounded-2xl p-6 border border-[#e8e0d5] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4"
              >
                {/* TOP ROW */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0"
                      style={{ backgroundColor: review.avatarBg, fontFamily: "var(--font-prompt)" }}
                    >
                      {review.avatar}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a]" >
                        {review.name}
                      </p>
                      <p className="text-[12px] text-[#888]" >
                        {review.location}
                      </p>
                    </div>
                  </div>

                  {/* GOOGLE ICON */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/80px-Google_2015_logo.svg.png"
                    alt="Google"
                    className="h-4 w-auto object-contain opacity-60"
                  />
                </div>

                {/* STARS + DATE */}
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <span className="text-[11px] text-[#aaa]" >
                    {review.date}
                  </span>
                </div>

                {/* REVIEW TEXT */}
                <div className="relative">
                  <Quote
                    size={20}
                    className="text-[#f3efe8] absolute -top-1 -left-1"
                    fill="#f3efe8"
                  />
                  <p
                    className="text-[13.5px] text-[#444] leading-relaxed pl-4"
                    
                  >
                    {review.text}
                  </p>
                </div>

                {/* PRODUCT TAG */}
                <div className="mt-auto pt-2 border-t border-[#f0ebe4]">
                  <span
                    className="text-[11px] text-[#c4922a] font-medium"
                    
                  >
                    ✦ {review.product}
                  </span>
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

        {/* WRITE A REVIEW CTA */}
        <div className="text-center mt-10">
          
            href="https://share.google/RFY4e3Lh2z4f1zR90"
            target="_blank"
            rel="noopener noreferrer"
            
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-black text-black font-semibold text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-full"
          >
            Read All Reviews on Google
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}