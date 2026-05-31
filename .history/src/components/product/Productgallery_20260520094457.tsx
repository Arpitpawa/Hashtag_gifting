"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Share2 } from "lucide-react";

interface Props {
  images:          string[];
  productName:     string;
  badge:           string | null;
  activeImg:       number;
  setActiveImg:    (i: number) => void;
  onOpenLightbox:  () => void;
  onShare:         () => void;
}

export default function ProductGallery({
  images, productName, badge, activeImg, setActiveImg, onOpenLightbox, onShare,
}: Props) {
  const [zoomed,     setZoomed]     = useState(false);
  const [zoomPos,    setZoomPos]    = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const imgRef   = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const total     = images.length;

  const prevImg = () => setActiveImg((activeImg - 1 + total) % total);
  const nextImg = () => setActiveImg((activeImg + 1) % total);

  // Scroll active thumb into view
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[activeImg] as HTMLElement;
    if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeImg]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImg() : prevImg();
    setTouchStart(null);
  };

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div className="flex gap-4">

        {/* Desktop thumbnails */}
        <div
          ref={thumbsRef}
          className="hidden md:flex flex-col gap-4 max-h-[760px] overflow-y-auto pr-1"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`relative w-[82px] h-[82px] rounded-2xl overflow-hidden border flex-shrink-0 transition-all duration-300 ${
                activeImg === i
                  ? "border-[#1a1a1a] shadow-lg scale-[1.02]"
                  : "border-[#ece7df] hover:border-[#c0555a]/40"
              }`}
            >
              <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="82px" />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="flex-1">
          <div
            ref={imgRef}
            className="relative w-full aspect-[0.92] rounded-[28px] overflow-hidden bg-[#f8f5f0] group cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={onOpenLightbox}
          >
            <Image
              src={images[activeImg]}
              alt={productName}
              fill
              priority
              className={`object-cover transition-transform duration-500 ease-out ${
                zoomed ? "scale-[1.45]" : "scale-100 group-hover:scale-[1.03]"
              }`}
              style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/[0.03] via-transparent to-transparent pointer-events-none" />

            {/* Prev / Next arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImg(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
                >
                  <ChevronLeft size={18} className="text-[#222]" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImg(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
                >
                  <ChevronRight size={18} className="text-[#222]" />
                </button>
              </>
            )}

            {/* Mobile dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex md:hidden gap-2 z-20">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                  className={`transition-all rounded-full ${
                    activeImg === i ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/60"
                  }`}
                />
              ))}
            </div>

            {/* Expand button */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenLightbox(); }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20"
            >
              <Expand size={16} className="text-[#222]" />
            </button>

            {/* Badge */}
            {badge && (
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-[#c0555a] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {badge}
                </span>
              </div>
            )}
          </div>

          {/* Mobile thumbnail strip */}
          {total > 1 && (
            <div className="flex md:hidden gap-3 overflow-x-auto mt-4" style={{ scrollbarWidth: "none" }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-[74px] h-[74px] rounded-2xl overflow-hidden border flex-shrink-0 transition-all ${
                    activeImg === i ? "border-[#1a1a1a]" : "border-[#ece7df]"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="74px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share + count row */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={onShare}
          className="flex items-center gap-2 text-[14px] text-[#555] hover:text-[#c0555a] transition-colors"
        >
          <Share2 size={16} />
          Share
        </button>
        {total > 1 && (
          <p className="text-[13px] text-[#888]">{activeImg + 1}/{total} photos</p>
        )}
      </div>
    </div>
  );
}