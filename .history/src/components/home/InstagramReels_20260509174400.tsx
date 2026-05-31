"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";

const InstagramIcon = ({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const reels = [
  {
    // Replace these with your actual .mp4 files in /public/reels/
    video: "/reels/reel1.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
    views: "3.2k",
    product: "Custom LED Name Lamp",
    price: "Rs. 590",
    link: "/product/led-lamp",
  },
  {
    video: "/reels/reel2.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
    views: "2.5k",
    product: "CineMagic Clap Board",
    price: "Rs. 690",
    link: "/product/cinemagic-clap",
  },
  {
    video: "/reels/reel3.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    views: "4.1k",
    product: "Wedding Caricature",
    price: "Rs. 490",
    link: "/product/wedding-caricature",
  },
  {
    video: "/reels/reel4.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=600&auto=format&fit=crop",
    views: "1.8k",
    product: "Metal Wallet Card",
    price: "Rs. 990",
    link: "/product/metal-wallet-card",
  },
  {
    video: "/reels/reel5.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=600&auto=format&fit=crop",
    views: "3.7k",
    product: "Travel Memory Box",
    price: "Rs. 1290",
    link: "/product/travel-memory-box",
  },
];

const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function InstagramReels() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [mutedIndex, setMutedIndex] = useState<number[]>([0, 1, 2, 3, 4]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const scrollRight = () =>
    sliderRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  const scrollLeft = () =>
    sliderRef.current?.scrollBy({ left: -320, behavior: "smooth" });

  const handlePlay = (index: number) => {
    // Pause all others
    videoRefs.current.forEach((v, i) => {
      if (v && i !== index) {
        v.pause();
      }
    });

    const video = videoRefs.current[index];
    if (!video) return;

    if (playingIndex === index) {
      video.pause();
      setPlayingIndex(null);
    } else {
      video.play();
      setPlayingIndex(index);
    }
  };

  const toggleMute = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = !video.muted;
    setMutedIndex((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <section className="pt-0 pb-16 md:pb-24 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        {/* ── HEADING ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span
              className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-2 font-light"
              style={caveatFont}
            >
              as seen on instagram
            </span>
            <h2
              className="text-5xl md:text-6xl font-bold text-[#1a1a1a]"
              style={caveatFont}
            >
              @hashtagifting
            </h2>
          </div>

          <a
            href="https://www.instagram.com/hashtagifting/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[13px] font-medium rounded-full hover:bg-[#2f3e7a] transition-all duration-300 w-fit"
          >
            <InstagramIcon size={16} />
            Follow on Instagram
          </a>
        </div>

        {/* ── SLIDER ── */}
        <div className="relative">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 bottom-16 w-16 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, var(--background), transparent)",
            }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-16 w-32 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, var(--background), transparent)",
            }}
          />

          {/* LEFT BUTTON */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronRight size={20} strokeWidth={2} className="rotate-180" />
          </button>

          {/* RIGHT BUTTON */}
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          {/* CARDS */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
          >
            {reels.map((reel, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[260px] md:w-[280px] flex flex-col"
              >
                {/* VIDEO CARD */}
                <div
                  className="relative rounded-2xl overflow-hidden group cursor-pointer bg-black"
                  onClick={() => handlePlay(index)}
                >
                  {/* VIDEO */}
                  <div className="relative h-[420px] md:h-[460px]">
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={reel.video}
                      poster={reel.thumbnail}
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onEnded={() => setPlayingIndex(null)}
                    />

                    {/* OVERLAY — only when paused */}
                    <div
                      className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${
                        playingIndex === index
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-100"
                      }`}
                    />

                    {/* PLAY / PAUSE BUTTON */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                        playingIndex === index
                          ? "opacity-0 group-hover:opacity-100"
                          : "opacity-100"
                      }`}
                    >
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        {playingIndex === index ? (
                          <Pause size={20} className="text-black fill-black" />
                        ) : (
                          <Play
                            size={20}
                            className="text-black fill-black ml-1"
                          />
                        )}
                      </div>
                    </div>

                    {/* INSTAGRAM BADGE — top left */}
                    <div className="absolute top-3 left-3 z-10">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                        style={{
                          background:
                            "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                        }}
                      >
                        <InstagramIcon size={14} className="text-white" />
                      </div>
                    </div>

                    {/* VIEWS — top right */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {reel.views}
                    </div>

                    {/* MUTE BUTTON — bottom right, only when playing */}
                    {playingIndex === index && (
                      <button
                        onClick={(e) => toggleMute(e, index)}
                        className="absolute bottom-3 right-3 z-10 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all"
                      >
                        {mutedIndex.includes(index) ? (
                          <VolumeX size={14} />
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* PRODUCT INFO */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#e8e0d5]">
                    <img
                      src={reel.thumbnail}
                      alt={reel.product}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug line-clamp-2">
                      {reel.product}
                    </p>
                    <p className="text-[13px] font-bold text-[#1a1a1a] mt-0.5">
                      {reel.price}
                    </p>
                  </div>
                </div>

                {/* ADD TO CART */}
                <Link
                  href={reel.link}
                  className="mt-3 w-full bg-black text-white text-[13px] font-medium py-3 rounded-xl text-center hover:bg-[#2f3e7a] transition-all duration-300 block"
                >
                  Shop This
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
