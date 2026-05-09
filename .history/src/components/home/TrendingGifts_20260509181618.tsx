"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Play, Pause, Volume2, VolumeX, X, Heart, ShoppingCart } from "lucide-react";

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const reels = [
  {
    video: "/reels/reel1.mp4",
    thumbnail: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
    views: "3.2k",
    likes: "412",
    product: "Custom LED Name Lamp",
    price: "Rs. 590",
    oldPrice: "Rs. 799",
    link: "/product/led-lamp",
    productImage: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
  },
  {
    video: "/reels/reel2.mp4",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
    views: "2.5k",
    likes: "298",
    product: "CineMagic Clap Board",
    price: "Rs. 690",
    oldPrice: "Rs. 890",
    link: "/product/cinemagic-clap",
    productImage: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
  },
  {
    video: "/reels/reel3.mp4",
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    views: "4.1k",
    likes: "531",
    product: "Wedding Caricature",
    price: "Rs. 490",
    oldPrice: "Rs. 590",
    link: "/product/wedding-caricature",
    productImage: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
  },
  {
    video: "/reels/reel4.mp4",
    thumbnail: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=600&auto=format&fit=crop",
    views: "1.8k",
    likes: "187",
    product: "Metal Wallet Card",
    price: "Rs. 990",
    oldPrice: "Rs. 1090",
    link: "/product/metal-wallet-card",
    productImage: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
  },
  {
    video: "/reels/reel5.mp4",
    thumbnail: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=600&auto=format&fit=crop",
    views: "3.7k",
    likes: "463",
    product: "Travel Memory Box",
    price: "Rs. 1290",
    oldPrice: "Rs. 1490",
    link: "/product/travel-memory-box",
    productImage: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
  },
];

const promptFont = { fontFamily: "var(--font-prompt)" };
const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function InstagramReels() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [activeModal, setActiveModal] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);

  const scrollRight = () => sliderRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -320, behavior: "smooth" });

  const openModal = (index: number) => {
    setActiveModal(index);
    setIsPlaying(true);
    setIsMuted(true);
    setLiked(false);
    setProgress(0);
  };

  const closeModal = () => {
    if (modalVideoRef.current) modalVideoRef.current.pause();
    setActiveModal(null);
    setIsPlaying(false);
    setProgress(0);
  };

  const goNext = () => {
    if (activeModal === null) return;
    setActiveModal((activeModal + 1) % reels.length);
    setIsPlaying(true);
    setProgress(0);
    setLiked(false);
  };

  const goPrev = () => {
    if (activeModal === null) return;
    setActiveModal((activeModal - 1 + reels.length) % reels.length);
    setIsPlaying(true);
    setProgress(0);
    setLiked(false);
  };

  useEffect(() => {
    if (activeModal !== null && modalVideoRef.current) {
      modalVideoRef.current.load();
      modalVideoRef.current.muted = isMuted;
      if (isPlaying) modalVideoRef.current.play().catch(() => {});
    }
  }, [activeModal]);

  const togglePlay = () => {
    if (!modalVideoRef.current) return;
    if (isPlaying) {
      modalVideoRef.current.pause();
    } else {
      modalVideoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!modalVideoRef.current) return;
    const { currentTime, duration } = modalVideoRef.current;
    if (duration) setProgress((currentTime / duration) * 100);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeModal]);

  useEffect(() => {
    document.body.style.overflow = activeModal !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeModal]);

  const currentReel = activeModal !== null ? reels[activeModal] : null;

  return (
    <>
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
                
              href="https://www.instagram.com/hashtagifting/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[13px] font-medium rounded-full hover:bg-[#2f3e7a] transition-all duration-300 w-fit"
              style={promptFont}
            >
              <InstagramIcon size={16} />
              Follow on Instagram
            </a>
          </div>

          {/* ── SLIDER ── */}
          <div className="relative">

            {/* LEFT ARROW */}
            <button
              onClick={scrollLeft}
              className="hidden lg:flex absolute -left-5 top-[42%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
            >
              <ChevronRight size={20} strokeWidth={2} className="rotate-180" />
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={scrollRight}
              className="hidden lg:flex absolute -right-5 top-[42%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>

            {/* CARDS — px-1 fixes left clip + right extra space */}
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2 px-1"
            >
              {reels.map((reel, index) => (
                <div key={index} className="flex-shrink-0 w-[220px] md:w-[260px] flex flex-col">

                  {/* THUMBNAIL CARD */}
                  <div
                    className="relative rounded-2xl overflow-hidden group cursor-pointer bg-black"
                    onClick={() => openModal(index)}
                  >
                    <div className="relative h-[360px] md:h-[400px]">
                      <img
                        src={reel.thumbnail}
                        alt={reel.product}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-all duration-300" />

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                          <Play size={18} className="text-black fill-black ml-1" />
                        </div>
                      </div>

                      {/* Instagram badge */}
                      <div className="absolute top-3 left-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shadow"
                          style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
                        >
                          <InstagramIcon size={13} className="text-white" />
                        </div>
                      </div>

                      {/* Views */}
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full"
                        style={promptFont}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {reel.views}
                      </div>

                      {/* Product overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-[12px] font-medium line-clamp-1" style={promptFont}>
                          {reel.product}
                        </p>
                        <p className="text-white text-[13px] font-bold" style={promptFont}>
                          {reel.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SHOP THIS */}
                  <Link
                    href={reel.link}
                    className="mt-3 w-full bg-black text-white text-[12px] font-medium py-2.5 rounded-xl text-center hover:bg-[#2f3e7a] transition-all duration-300 block"
                    style={promptFont}
                  >
                    Shop This
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL ── */}
      {activeModal !== null && currentReel && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={closeModal}
        >
          <div
            className="relative flex items-center justify-center gap-4 md:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PREV */}
            <button
              onClick={goPrev}
              className="hidden md:flex w-11 h-11 bg-white/15 hover:bg-white/30 rounded-full items-center justify-center text-white transition-all duration-200 flex-shrink-0"
            >
              <ChevronRight size={22} className="rotate-180" />
            </button>

            {/* VIDEO CARD */}
            <div
              className="relative w-[320px] md:w-[360px] rounded-[28px] overflow-hidden bg-black shadow-2xl"
              style={{ height: "calc(100vh - 80px)", maxHeight: "680px" }}
            >
              {/* VIDEO */}
              <video
                ref={modalVideoRef}
                src={currentReel.video}
                poster={currentReel.thumbnail}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
              />

              {/* PROGRESS BAR */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* TOP BAR */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
                  >
                    <InstagramIcon size={15} className="text-white" />
                  </div>
                  <span className="text-white text-[13px] font-semibold" style={promptFont}>
                    hashtagifting
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* CENTER PLAY/PAUSE */}
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
              >
                {!isPlaying && (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play size={28} className="text-white fill-white ml-1" />
                  </div>
                )}
              </div>

              {/* RIGHT SIDE ACTIONS */}
              <div className="absolute right-4 bottom-44 flex flex-col items-center gap-5">
                <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Heart size={18} className={liked ? "fill-red-500 text-red-500" : "text-white"} />
                  </div>
                  <span className="text-white text-[10px]" style={promptFont}>{currentReel.likes}</span>
                </button>
                <button onClick={toggleMute} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
                  </div>
                </button>
              </div>

              {/* BOTTOM PRODUCT BAR */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4">
                <p className="text-[11px] text-[#888] mb-2 font-medium uppercase tracking-wider" style={promptFont}>
                  Featured Product
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#e8e0d5]">
                    <img src={currentReel.productImage} alt={currentReel.product} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] line-clamp-1" style={promptFont}>
                      {currentReel.product}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[14px] font-bold text-[#1a1a1a]" style={promptFont}>{currentReel.price}</span>
                      <span className="text-[12px] text-gray-400 line-through" style={promptFont}>{currentReel.oldPrice}</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={currentReel.link}
                  onClick={closeModal}
                  className="mt-3 w-full bg-black text-white text-[13px] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2f3e7a] transition-all duration-300"
                  style={promptFont}
                >
                  <ShoppingCart size={15} />
                  Add to Cart
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* NEXT */}
            <button
              onClick={goNext}
              className="hidden md:flex w-11 h-11 bg-white/15 hover:bg-white/30 rounded-full items-center justify-center text-white transition-all duration-200 flex-shrink-0"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* DOT INDICATORS */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {reels.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveModal(i); setProgress(0); setLiked(false); }}
                className={`rounded-full transition-all duration-300 ${
                  i === activeModal ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}