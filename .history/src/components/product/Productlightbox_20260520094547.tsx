"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  open:         boolean;
  onClose:      () => void;
  images:       string[];
  activeImg:    number;
  setActiveImg: (i: number) => void;
  productName:  string;
}

export default function ProductLightbox({
  open, onClose, images, activeImg, setActiveImg, productName,
}: Props) {
  const total  = images.length;
  const prevImg = () => setActiveImg((activeImg - 1 + total) % total);
  const nextImg = () => setActiveImg((activeImg + 1) % total);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prevImg();
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, activeImg]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <p className="text-white/60 text-[13px] truncate max-w-[60%]">{productName}</p>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-[13px]">{activeImg + 1} / {total}</span>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        className="flex-1 flex items-center justify-center relative px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 && (
          <button
            onClick={prevImg}
            className="absolute left-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
        )}

        <div className="relative w-full max-w-3xl aspect-square">
          <Image
            src={images[activeImg]}
            alt={productName}
            fill
            className="object-contain"
            sizes="80vw"
            priority
          />
        </div>

        {total > 1 && (
          <button
            onClick={nextImg}
            className="absolute right-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all"
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div
          className="flex-shrink-0 flex justify-center gap-2 px-6 py-4 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                activeImg === i
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
  );
}