"use client";

import Link from "next/link";



const images = [
  {
    src: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    alt: "Custom socks",
  },
  {
    src: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    alt: "Gift box",
  },
  {
    src: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    alt: "Souvenir box",
  },
  {
    src: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    alt: "Hamper",
  },
];

const steps = [
  {
    number: "01",
    title: "Pick your products",
    desc: "Choose from our full catalogue — no minimums",
  },
  {
    number: "02",
    title: "Personalize each piece",
    desc: "Names, photos, messages — fully bespoke",
  },
  {
    number: "03",
    title: "We pack & deliver",
    desc: "Same day delivery within Jaipur, Pan India shipping",
  },
];

export default function BuildYourHamper() {
  return (
    <section className="pt-0 pb-0 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] md:min-h-[700px]">
        {/* ── LEFT — red content side ── */}
        <div
          className="flex flex-col justify-center px-8 md:px-14 lg:px-16 py-16 md:py-20"
          style={{ backgroundColor: "#c0392b" }}
        >
          {/* EYEBROW */}
          <p className="text-white/60 text-[11px] font-semibold sma,case tracking-[4px] mb-6">
            Build something truly yours
          </p>

          {/* HEADING */}
          <h2
            className="text-white text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
            style={caveatFont}
          >
            Make your own
            <br />
            <span
              className="italic font-normal"
              style={{ ...caveatFont, color: "rgba(255,255,255,0.75)" }}
            >
              hamper
            </span>
          </h2>

          {/* DESCRIPTION */}
          <p className="text-white/60 text-[14px] md:text-[15px] leading-relaxed max-w-md mb-10">
            Mix and match from 500+ personalised products — mugs, frames, lamps,
            cushions, and more. Every piece customised with your name, photo, or
            message. One piece or a thousand — we make it happen.
          </p>

          {/* STEPS */}
          <div className="flex flex-col gap-6 mb-12">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-5">
                <span className="text-white/40 text-[13px] font-bold tracking-widest flex-shrink-0 mt-0.5">
                  {step.number}
                </span>
                <div>
                  <p className="text-white text-[14px] md:text-[15px] font-semibold mb-0.5">
                    {step.title}
                  </p>
                  <p className="text-white/50 text-[13px] md:text-[14px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/build-hamper"
            className="inline-flex items-center justify-center gap-3 bg-white text-[#c0392b] text-[12px] font-bold uppercase tracking-[3px] px-10 py-5 hover:bg-white/90 transition-all duration-300 w-full md:w-auto"
          >
            Build Your Hamper
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── RIGHT — 2x2 image grid with gaps and borders like reference ── */}
        <div
          className="grid grid-cols-2 grid-rows-2 gap-3 p-3"
          style={{ backgroundColor: "#c0392b" }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden group rounded-sm"
              style={{
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ minHeight: "200px" }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
