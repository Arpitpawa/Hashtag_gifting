"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: "/Personalisedpassportcoverheroimage.png",
    button: "Shop passport covers",
    link: "/shop?search=passport",
  },
  {
    id: 2,
    image: "/personaliseddiariespensheropng.png",
    button: "Shop diaries & pens",
    link: "/shop?search=diary",
  },
  {
    id: 3,
    image: "/personalisedwalletskeychain.png",
    button: "Shop wallets & keychains",
    link: "/shop?search=wallet",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // Slides join the DOM ahead of when they're actually shown, not exactly
  // when — always the current slide PLUS the one coming up next. All 3 sit
  // "absolute inset-0" (i.e. inside the viewport, just opacity: 0), so
  // mounting all 3 up front (an earlier version of this) meant the browser
  // fetched all 3 full-bleed hero images immediately, tripling the payload
  // competing with the page's real LCP element. But mounting a slide only
  // at the exact moment autoplay switches to it (a later version) was
  // worse: that slide's <img> didn't even start its network request until
  // the rotation fired, so on anything slower than a fast connection the
  // hero box would rotate to a blank slide and sit there mid-fetch — and
  // if THAT half-loaded slide happened to still be painting when Lighthouse
  // (or a real slow session) measured page load, it became the page's LCP
  // element with a multi-second "resource load delay", which is exactly
  // what was making mobile Lighthouse runs show a ~10s LCP on this page.
  // Mounting current+1 always gives the next slide the full 5s autoplay
  // interval to fetch in the background (low priority, invisible at
  // opacity 0) before it's ever asked to actually display.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1 % slides.length]));

  const mountThrough = (index: number) => {
    const after = (index + 1) % slides.length;
    setMounted((m) => (m.has(index) && m.has(after) ? m : new Set(m).add(index).add(after)));
  };

  // Kept in a ref (not a plain setInterval in useEffect) so a manual
  // navigation — swipe or dot tap — can restart the 5s countdown instead of
  // the autoplay yanking to the next slide a moment after someone just
  // picked one themselves.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % slides.length;
        mountThrough(next);
        return next;
      });
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoplay]);

  const goTo = (index: number) => {
    const wrapped = (index + slides.length) % slides.length;
    setCurrent(wrapped);
    mountThrough(wrapped);
    startAutoplay();
  };

  // ── Touch swipe ──
  // Slides were only auto-rotating on a timer with no way to flick between
  // them by hand, which feels broken on a touchscreen. This tracks the
  // horizontal drag distance and swaps slides once it clears a small
  // threshold — swipe left for next, right for previous.
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX  = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    const SWIPE_THRESHOLD = 40;
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD) {
      goTo(current + (touchDeltaX.current < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section className="relative w-full bg-[#f6f1eb]">
      {/* One fixed aspect ratio for every slide — sizing the box to each
          slide's own exact ratio (a previous version of this) meant the
          section's height visibly shifted every time it rotated, which
          reads as a layout jump/glitch rather than a smooth slider. A
          single ratio keeps the box height constant across all 3 slides
          and every screen width. object-contain (below) still shows each
          full image with no cropping — any gap between an image's own
          shape and this box just letterboxes instead of moving the box. */}
      <div
        className="relative overflow-hidden touch-pan-y aspect-[16/9]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {slides.map((slide, index) => mounted.has(index) && (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              current === index ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
            }`}
          >
            {/* Mobile/tablet keep object-contain — no cropping, full photo
                visible with letterboxing where needed. From xl (1280px,
                genuine laptop/desktop widths — not xl: lg would also catch
                an iPad Pro in portrait at exactly 1024px) it switches to
                object-cover so the image fills the whole box edge-to-edge
                on wide screens, cropping slightly rather than letterboxing. */}
            <Image
              src={slide.image}
              alt="Hashtag Gifting"
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "low"}
              // Every mounted slide is either on screen now (index 0 on
              // first paint) or about to be within one autoplay interval —
              // never "maybe visible eventually", which is what
              // loading="lazy" is for. Fetching it immediately (just at
              // low priority once it's not index 0) is what actually gets
              // it ready in time; lazy here was the bug.
              loading={index === 0 ? undefined : "eager"}
              sizes="100vw"
              className="object-contain xl:object-cover"
            />
            {/* Button was sized for the old near-full-height box (px-8
                py-4 text-sm) — in the new, much shorter mobile box it ran
                wide enough to crowd the centered dots below it. Shrunk on
                mobile and given extra bottom clearance so the two never
                share the same strip; it scales back up to the original
                size from md onward where the box is roomier. */}
            <div className="relative z-20 h-full flex items-end justify-start absolute inset-0">
              {/* justify-end — the product mockups sit on the left side of
                  every slide's photo, so a left-anchored button was landing
                  right on top of them. Right-anchoring puts it over the
                  empty/text side of the image instead. */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pb-9 sm:pb-10 lg:pb-14 xl:pb-20 flex justify-end">
                <Link
                  href={slide.link}
                  // Solid fill instead of a white-ghost button: a
                  // white-on-white-ish outline button sitting over a busy
                  // photo background reads as low-contrast/low-affordance.
                  // Filling it with the brand color gives it real visual
                  // weight against any image behind it.
                  className="inline-block bg-[#c0555a] text-white border border-[#c0555a] px-4 py-2 text-[11px] sm:px-6 sm:py-3 sm:text-[13px] md:px-8 md:py-4 md:text-sm tracking-[1px] sm:tracking-[1.5px] font-semibold shadow-lg hover:bg-white hover:text-[#c0555a] transition-all duration-300"
                >
                  {slide.button}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Dots — thicker + a dark ring so they stay visible as
            interactive elements against any photo behind them, not just
            the light-colored slides. */}
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 xl:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.15)] ${
                current === index ? "w-10 h-[5px] bg-[#f4d35e]" : "w-6 h-[5px] bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}