"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, ExternalLink } from "lucide-react";

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// ── Map to REAL product slugs that exist in DB ────────────────────────────────
const posts = [
  {
    thumbnail: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=600",
    likes:      "2.4k",
    caption:    "Glow up their room ✨ Custom LED name lamp just landed!",
    product:    "Name LED desk lamp",
    price:      "Rs. 899",
    oldPrice:   "Rs. 1,299",
    link:       "/product/name-led-desk-lamp",
    tag:        "New arrival",
  },
  {
    thumbnail: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=600",
    likes:      "3.1k",
    caption:    "When she cries happy tears 😭💝 This explosion box hits different",
    product:    "Classic explosion box",
    price:      "Rs. 1,499",
    oldPrice:   "Rs. 1,999",
    link:       "/product/classic-explosion-box",
    tag:        "Best seller",
  },
  {
    thumbnail: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=600",
    likes:      "4.2k",
    caption:    "Couple frames that actually look premium 💑 Personalised with your names + date",
    product:    "Couple anniversary frame",
    price:      "Rs. 799",
    oldPrice:   "Rs. 1,199",
    link:       "/product/couple-anniversary-frame",
    tag:        "Trending",
  },
  {
    thumbnail: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=600",
    likes:      "1.8k",
    caption:    "Your pet's face on everything 🐾 Custom photo cushion they'll love",
    product:    "Personalised photo cushion",
    price:      "Rs. 499",
    oldPrice:   "Rs. 699",
    link:       "/product/personalised-photo-cushion",
    tag:        "Popular",
  },
  {
    thumbnail: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=600",
    likes:      "2.9k",
    caption:    "That mug that starts every morning right ☕ With their name on it",
    product:    "Classic personalised photo mug",
    price:      "Rs. 399",
    oldPrice:   "Rs. 599",
    link:       "/product/classic-personalised-photo-mug",
    tag:        "Best seller",
  },
  {
    thumbnail: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=600",
    likes:      "3.6k",
    caption:    "Premium hampers that look like Rs. 5k but aren't 😏 Corporate gifting sorted!",
    product:    "Premium gift hamper",
    price:      "Rs. 2,499",
    oldPrice:   "Rs. 3,499",
    link:       "/product/premium-gift-hamper",
    tag:        "Premium",
  },
];

export default function InstagramReels() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span
              className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-2 font-light"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              As seen on instagram
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#1a1a1a]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              @hashtagifting
            </h2>
          </div>

          <a
            href="https://www.instagram.com/hashtagifting/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-[13px] font-medium rounded-full hover:opacity-80 transition-all duration-300 w-fit"
          >
            <InstagramIcon />
            Follow on Instagram
          </a>
        </div>

        {/* ── SLIDER ── */}
        <div className="relative">

          {/* Arrows */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-[#c0555a] hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-[#c0555a] hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronRight size={18} />
          </button>

          {/* Cards */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {posts.map((post, i) => (
              <div key={i} className="flex-shrink-0 w-[220px] md:w-[250px] flex flex-col group">

                {/* Image card */}
                <div className="relative rounded-2xl overflow-hidden bg-[#f8f5f0] aspect-[4/5]">
                  <Image
                    src={post.thumbnail}
                    alt={post.product}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="250px"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                  {/* Instagram badge top-left */}
                  <div className="absolute top-3 left-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
                    >
                      <InstagramIcon />
                    </div>
                  </div>

                  {/* Tag top-right */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold text-white bg-[#c0555a] px-2 py-0.5 rounded-full">
                      {post.tag}
                    </span>
                  </div>

                  {/* Likes bottom-right */}
                  <div className="absolute bottom-16 right-3 flex items-center gap-1">
                    <Heart size={13} className="fill-white text-white" />
                    <span className="text-white text-[11px] font-semibold">{post.likes}</span>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-3">
                    <p className="text-white text-[11px] leading-snug line-clamp-2">{post.caption}</p>
                  </div>
                </div>

                {/* Product info */}
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug line-clamp-1 flex-1">
                      {post.product}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#1a1a1a]">{post.price}</span>
                    <span className="text-[12px] text-gray-400 line-through">{post.oldPrice}</span>
                  </div>

                  {/* Shop button */}
                  <Link
                    href={post.link}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-semibold rounded-xl hover:bg-[#c0555a] transition-all duration-300"
                  >
                    <ShoppingBag size={13} />
                    Shop this
                  </Link>
                </div>
              </div>
            ))}

            {/* View all on Instagram card */}
            <div className="flex-shrink-0 w-[220px] md:w-[250px]">
              <a
                href="https://www.instagram.com/hashtagifting/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full rounded-2xl border-2 border-dashed border-[#e8e0d5] hover:border-[#c0555a] transition-all duration-300 gap-4 p-6 group min-h-[340px]"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
                >
                  <InstagramIcon />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">See more on</p>
                  <p className="text-[14px] font-bold text-[#c0555a]">@hashtagifting</p>
                  <p className="text-[12px] text-[#888] mt-2 leading-relaxed">
                    100+ happy customers share their unboxing every day
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#c0555a]">
                  <ExternalLink size={13} />
                  Open Instagram
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}