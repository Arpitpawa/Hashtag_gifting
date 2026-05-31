"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft, ChevronRight, ZoomIn, X, Expand
} from "lucide-react";

interface Props {
  images:      string[];
  productName: string;
  badge?:      string | null;
  customizable?: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  badge,
  customizable,
}: Props) {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [zoomed,      setZoomed]        = useState(false);
  const [zoomPos,     setZoomPos]       = useState({ x: 50, y: 50 });
  const [lightbox,    setLightbox]      = useState(false);
  const [touchStart,  setTouchStart]    = useState<number | null>(null);
  const imgRef                          = useRef<HTMLDivElement>(null);
  const thumbsRef                       = useRef<HTMLDivElement>(null);

  const total = images.length;

  // ── KEYBOARD NAVIGATION ──
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, activeIndex]);

  // ── LOCK BODY SCROLL WHEN LIGHTBOX OPEN ──
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  // ── SCROLL THUMBNAIL INTO VIEW ──
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[activeIndex] as HTMLElement;
    if (thumb) {
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  const prev = () => setActiveIndex((i) => (i - 1 + total) % total);
  const next = () => setActiveIndex((i) => (i + 1) % total);

  // ── HOVER ZOOM ──
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x    = ((e.clientX - rect.left)  / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)   / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  // ── SWIPE (MOBILE) ──
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setTouchStart(null);
  };

  return (
    <>
      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
          onClick={() => setLightbox(false)}
        >
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <p className="text-white/60 text-[13px] truncate max-w-[60%]">{productName}</p>
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-[13px]">
                {activeIndex + 1} / {total}
              </span>
              <button
                onClick={() => setLightbox(false)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* MAIN IMAGE */}
          <div
            className="flex-1 flex items-center justify-center relative px-16"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* PREV */}
            {total > 1 && (
              <button
                onClick={prev}
                className="absolute left-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronLeft size={22} className="text-white" />
              </button>
            )}

            <div className="relative w-full max-w-3xl aspect-square">
              <Image
                src={images[activeIndex]}
                alt={`${productName} — image ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="80vw"
                priority
              />
            </div>

            {/* NEXT */}
            {total > 1 && (
              <button
                onClick={next}
                className="absolute right-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronRight size={22} className="text-white" />
              </button>
            )}
          </div>

          {/* THUMBNAIL STRIP */}
          {total > 1 && (
            <div
              className="flex-shrink-0 flex justify-center gap-2 px-6 py-4 overflow-x-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    activeIndex === i
                      ? "border-[#c0555a] scale-105"
                      : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GALLERY LAYOUT ── */}
      <div className="flex flex-col gap-3">

        {/* MAIN IMAGE */}
        <div
          ref={imgRef}
          className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-sm cursor-zoom-in group`}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setLightbox(true)}
        >
          {/* IMAGE */}
          <Image
            src={images[activeIndex]}
            alt={`${productName} — image ${activeIndex + 1}`}
            fill
            className={`object-cover transition-all duration-300 ${
              zoomed ? "scale-[1.6]" : "scale-100"
            }`}
            style={
              zoomed
                ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                : {}
            }
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />

          {/* BADGES */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {badge && (
              <span className="bg-[#c0555a] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow">
                {badge}
              </span>
            )}
            {customizable && (
              <span className="bg-[#1a1a1a]/80 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1">
                ✏️ Customizable
              </span>
            )}
          </div>

          {/* TOP RIGHT ACTIONS */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {/* FULLSCREEN */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              title="View fullscreen"
            >
              <Expand size={15} className="text-[#555]" />
            </button>
          </div>

          {/* ZOOM HINT */}
          <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ZoomIn size={11} /> Hover to zoom · Click to expand
          </div>

          {/* DOT INDICATORS */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    activeIndex === i
                      ? "w-5 h-2 bg-[#c0555a]"
                      : "w-2 h-2 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}

          {/* ARROW NAVIGATION */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* IMAGE COUNTER */}
          {total > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10">
              {activeIndex + 1} / {total}
            </div>
          )}
        </div>

        {/* THUMBNAIL STRIP */}
        {total > 1 && (
          <div
            ref={thumbsRef}
            className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1"
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                  activeIndex === i
                    ? "border-[#c0555a] shadow-md scale-105"
                    : "border-[#e8e0d5] hover:border-[#c0555a]/50"
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
                {/* ACTIVE OVERLAY */}
                {activeIndex === i && (
                  <div className="absolute inset-0 bg-[#c0555a]/10" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
