"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

interface Props {
  images:         string[];
  productName:    string;
  badge:          string | null;
  activeImg:      number;
  setActiveImg:   (i: number) => void;
  onOpenLightbox: () => void;
  onShare:        () => void;
}

export default function ProductGallery({
  images, productName, badge, activeImg, setActiveImg, onOpenLightbox, onShare,
}: Props) {
  const [zoomed,     setZoomed]     = useState(false);
  const [zoomPos,    setZoomPos]    = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [imgLoaded,  setImgLoaded]  = useState(true);

  const imgRef    = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const total     = images.length;

  const prevImg = () => setActiveImg((activeImg - 1 + total) % total);
  const nextImg = () => setActiveImg((activeImg + 1) % total);

  // Smooth image swap
  const switchTo = (i: number) => {
    if (i === activeImg) return;
    setImgLoaded(false);
    setTimeout(() => { setActiveImg(i); setImgLoaded(true); }, 120);
  };

  // Scroll active thumb into view
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[activeImg] as HTMLElement;
    if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeImg]);

  // Mouse zoom — cursor follows pointer
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImg() : prevImg();
    setTouchStart(null);
  };

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div className="flex gap-3">

        {/* ── VERTICAL THUMBNAIL STRIP ── */}
        <div
          ref={thumbsRef}
          className="hidden md:flex flex-col gap-2.5 overflow-y-auto"
          style={{ scrollbarWidth: "none", maxHeight: "clamp(280px, 36vw, 560px)" }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => switchTo(i)}
              className={`
                relative flex-shrink-0 rounded-xl overflow-hidden
                transition-all duration-200
                w-[78px] h-[78px]
                border-2 bg-white
                ${activeImg === i
                  ? "border-[#c0555a] opacity-100"
                  : "border-[#e8e0d5] opacity-80 hover:opacity-100 hover:border-[#c0555a]/50"
                }
              `}
            >
              <Image
                src={img}
                alt={`View ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="78px"
              />
              {/* Active overlay line */}
              {activeImg === i && (
                <div className="absolute inset-0 ring-2 ring-inset ring-[#c0555a]/20 rounded-[10px]" />
              )}
            </button>
          ))}
        </div>

        {/* ── MAIN IMAGE ── */}
        <div className="flex-1 min-w-0">
          <div
            ref={imgRef}
            className="
              relative w-full aspect-square
              rounded-2xl overflow-hidden
              bg-white
              group
              cursor-crosshair
              select-none
            "
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={onOpenLightbox}
          >
            {/* Main image */}
            <Image
              key={activeImg}
              src={images[activeImg]}
              alt={productName}
              fill
              priority
              className={`
                object-contain
                transition-all duration-300 ease-out
                ${imgLoaded ? "opacity-100" : "opacity-0"}
                ${zoomed ? "scale-[1.18]" : "scale-100"}
              `}
              style={zoomed
                ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transition: "transform 0.1s ease-out, opacity 0.3s" }
                : {}}
              sizes="(max-width: 568px) 70vw, (max-width: 1024px) 30vw, 44vw"
            />

            {/* Zoom hint — shows briefly on hover */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                🔍 Hover to zoom · Click to expand
              </span>
            </div>

            {/* Prev / Next arrows (appear on hover) */}
            {total > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImg(); }}
                  aria-label="Previous image"
                  className="
                    absolute left-3 top-1/2 -translate-y-1/2 z-20
                    w-9 h-9 rounded-full
                    bg-white/90 backdrop-blur-sm shadow-md
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-all duration-200
                    hover:bg-white hover:shadow-lg hover:scale-110
                  "
                >
                  <ChevronLeft size={17} className="text-[#222]" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImg(); }}
                  aria-label="Next image"
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2 z-20
                    w-9 h-9 rounded-full
                    bg-white/90 backdrop-blur-sm shadow-md
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-all duration-200
                    hover:bg-white hover:shadow-lg hover:scale-110
                  "
                >
                  <ChevronRight size={17} className="text-[#222]" />
                </button>
              </>
            )}

            {/* Mobile dot indicators */}
            {total > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex md:hidden gap-1.5 z-20">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); switchTo(i); }}
                    className={`transition-all duration-300 rounded-full ${
                      activeImg === i
                        ? "w-5 h-1.5 bg-[#c0555a]"
                        : "w-1.5 h-1.5 bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Expand button */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenLightbox(); }}
              aria-label="View fullscreen"
              className="
                absolute top-3 right-3 z-20
                w-9 h-9 rounded-full
                bg-white/90 backdrop-blur-sm shadow-md
                flex items-center justify-center
                opacity-0 group-hover:opacity-100
                transition-all duration-200
                hover:bg-white hover:shadow-lg hover:scale-110
              "
            >
              <Expand size={15} className="text-[#333]" />
            </button>

            {/* Badge */}
            {badge && (
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-[#c0555a] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                  {badge}
                </span>
              </div>
            )}

            {/* Image counter */}
            {total > 1 && (
              <div className="absolute top-3 right-14 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/50 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {activeImg + 1} / {total}
                </span>
              </div>
            )}
          </div>

          {/* ── MOBILE THUMBNAILS (below main image) ── */}
          {total > 1 && (
            <div
              className="flex md:hidden gap-2 overflow-x-auto mt-3"
              style={{ scrollbarWidth: "none" }}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => switchTo(i)}
                  className={`
                    relative flex-shrink-0 w-[68px] h-[68px] rounded-xl overflow-hidden
                    border-2 transition-all duration-200
                    ${activeImg === i
                      ? "border-[#c0555a] opacity-100"
                      : "border-[#e8e0d5] opacity-60"}
                  `}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="68px" />
                </button>
              ))}
            </div>
          )}

          {/* ── SHARE ROW ── */}
          <div className="flex items-center justify-end mt-3">
            {total > 1 && (
              <p className="text-[12px] text-[#aaa]">{activeImg + 1} / {total} photos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}