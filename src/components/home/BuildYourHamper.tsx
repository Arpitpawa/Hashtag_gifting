"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

const PASTEL_RED = "#6B4F3F";

interface ImageTile {
  src: string;
  alt: string;
}

const steps = [
  { number: "01", title: "Pick your products",    desc: "Choose from our full catalogue — no minimums" },
  { number: "02", title: "Personalize each piece", desc: "Names, photos, messages — fully bespoke" },
  { number: "03", title: "We pack & deliver",      desc: "Same day delivery within Jaipur, Pan India shipping" },
];

interface BuildYourHamperProps {
  // Live ACTIVE product count (rounded for marketing copy), passed down from
  // the homepage's server-side fetch — kept optional/fallback-safe since this
  // component can render standalone too.
  productCount?: number;
}

export default function BuildYourHamper({ productCount }: BuildYourHamperProps) {
  const [images, setImages] = useState<ImageTile[]>([]);

  // This 2×2 collage was 4 hotlinked competitor photos with fabricated
  // captions — swapped for real product photos from the catalog.
  useEffect(() => {
    fetch("/api/home/mix?limit=4&seed=2")
      .then((r) => r.json())
      .then((data) => {
        const products = (data.products || []).filter((p: any) => p.images?.[0]);
        setImages(products.map((p: any) => ({ src: p.images[0], alt: p.name })));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="pt-0 pb-0 relative overflow-hidden">
      {/* lg (1024px) fires on an iPad Pro in portrait too — splitting into
          two 512px columns and forcing 700px of min-height on a screen
          that's actually tall and narrow, not wide. Pushed to xl so only
          genuinely wide screens get the two-column split, and dropped the
          fixed min-h in favor of natural content height via padding on
          each side. */}
      <div className="grid grid-cols-1 xl:grid-cols-2">

        {/* LEFT — content */}
        <div
          className="flex flex-col justify-center px-8 md:px-14 lg:px-16 py-16 md:py-20"
          style={{ backgroundColor: PASTEL_RED }}
        >
          <p className="text-white/60 text-[11px] font-medium tracking-[4px] uppercase mb-6">
            Build something truly yours
          </p>

          <h2
            className="text-white text-[42px] md:text-[66px] font-normal leading-[1.1] mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em" }}
          >
            Make your own
            <br />
            <span
              className="italic"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "rgba(255,255,255,0.75)" }}
            >
              hamper
            </span>
          </h2>

          <p className="text-white/60 text-[14px] md:text-[15px] leading-relaxed max-w-md mb-10">
            Mix and match from {productCount && productCount > 0 ? `${productCount}+ ` : ""}personalised products — wallets, passport covers, pens,
            diaries, and more. Every piece customised with your name, photo, or
            message. One piece or a thousand — we make it happen.
          </p>

          <div className="flex flex-col gap-6 mb-12">
            {steps.map(step => (
              <div key={step.number} className="flex items-start gap-5">
                <span className="text-white/40 text-[13px] font-bold tracking-widest flex-shrink-0 mt-0.5">
                  {step.number}
                </span>
                <div>
                  <p className="text-white text-[14px] md:text-[15px] font-semibold mb-0.5">{step.title}</p>
                  <p className="text-white/50 text-[13px] md:text-[14px]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/build-hamper"
            className="inline-flex items-center justify-center gap-3 bg-white text-[13px] font-semibold tracking-wider px-10 py-5 hover:bg-white/90 transition-all duration-300 w-full md:w-auto rounded-full"
            style={{ color: PASTEL_RED }}
          >
            Build your hamper
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* RIGHT — 2x2 image grid */}
        <div
          className="grid grid-cols-2 grid-rows-2 gap-3 p-3"
          style={{ backgroundColor: PASTEL_RED }}
        >
          {/* aspect-square instead of a fixed minHeight — the tile keeps its
              proportions no matter how the column width changes across
              breakpoints (previously a fixed 200px minHeight against a
              variable-width column produced portrait-cropped tiles rather
              than the intended square collage look). */}
          {(images.length > 0 ? images : Array.from({ length: 4 })).map((img: any, i) => (
            <div key={i} className="relative overflow-hidden group rounded-2xl bg-white/10 aspect-square">
              {img?.src ? (
                <>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gift size={28} className="text-white/30" />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}