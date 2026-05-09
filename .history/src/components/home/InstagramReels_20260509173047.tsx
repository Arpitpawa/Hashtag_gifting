"use client";

import { useRef } from "react";
import { ChevronRight, Instagram, Play } from "lucide-react";

const reels = [
  {
    thumbnail: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
    views: "3.2k",
    product: "Custom LED Name Lamp",
    price: "Rs. 590",
    link: "/product/led-lamp",
    reelUrl: "https://www.instagram.com/hashtagifting/",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
    views: "2.5k",
    product: "CineMagic Clap Board",
    price: "Rs. 690",
    link: "/product/cinemagic-clap",
    reelUrl: "https://www.instagram.com/hashtagifting/",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    views: "4.1k",
    product: "Wedding Caricature",
    price: "Rs. 490",
    link: "/product/wedding-caricature",
    reelUrl: "https://www.instagram.com/hashtagifting/",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=600&auto=format&fit=crop",
    views: "1.8k",
    product: "Metal Wallet Card",
    price: "Rs. 990",
    link: "/product/metal-wallet-card",
    reelUrl: "https://www.instagram.com/hashtagifting/",
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=600&auto=format&fit=crop",
    views: "3.7k",
    product: "Travel Memory Box",
    price: "Rs. 1290",
    link: "/product/travel-memory-box",
    reelUrl: "https://www.instagram.com/hashtagifting/",
  },
];

const promptFont = { fontFamily: "var(--font-prompt)" };
const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function InstagramReels() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 bg-[#f7f4ef]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p
              className="text-[#c4922a] text-sm uppercase tracking-[3px] font-medium mb-2"
              style={promptFont}
            >
              Follow Us
            </p>
            <h2
              className="text-5xl md:text-6xl font-bold text-[#1a1a1a]"
              style={caveatFont}
            >
              @hashtagifting
            </h2>
          </div>

          
            href="https://www.instagram.com/hashtagifting/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[13px] font-medium rounded-full hover:bg-[#2f3e7a] transition-all duration-300 w-fit"
            style={promptFont}
          >
            <Instagram size={16} />
            Follow on Instagram
          </a>
        </div>

        {/* REELS SLIDER */}
        <div className="relative">

          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-16 w-32 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #f7f4ef, transparent)" }}
          />

          {/* NEXT BUTTON */}
          <button
            onClick={scrollRight}
            className="absolute -right-4 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
          >
            {reels.map((reel, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[280px] md:w-[300px] flex flex-col"
              >
                {/* REEL CARD */}
                
                  href={reel.reelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative rounded-2xl overflow-hidden group cursor-pointer block"
                >
                  {/* THUMBNAIL */}
                  <div className="relative h-[420px] md:h-[460px] overflow-hidden">
                    <img
                      src={reel.thumbnail}
                      alt={reel.product}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* DARK OVERLAY */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />

                    {/* PLAY BUTTON */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play size={22} className="text-black fill-black ml-1" />
                      </div>
                    </div>

                    {/* VIEWS */}
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[12px] px-2.5 py-1 rounded-full"
                      style={promptFont}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {reel.views}
                    </div>

                    {/* INSTAGRAM ICON */}
                    <div className="absolute top-3 left-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] rounded-full flex items-center justify-center shadow">
                        <Instagram size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                </a>

                {/* PRODUCT INFO */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#e8e0d5]">
                    <img
                      src={reel.thumbnail}
                      alt={reel.product}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-medium text-[#1a1a1a] leading-snug line-clamp-2"
                      style={promptFont}
                    >
                      {reel.product}
                    </p>
                    <p
                      className="text-[13px] font-bold text-[#1a1a1a] mt-0.5"
                      style={promptFont}
                    >
                      {reel.price}
                    </p>
                  </div>
                </div>

                {/* ADD TO CART */}
                
                  href={reel.link}
                  className="mt-3 w-full bg-black text-white text-[13px] font-medium py-3 rounded-xl text-center hover:bg-[#2f3e7a] transition-all duration-300 block"
                  style={promptFont}
                >
                  Add to Cart
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}