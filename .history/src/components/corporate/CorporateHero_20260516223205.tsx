"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Gift } from "lucide-react";

const slides = [
  {
    tag: "Bulk gifting deals",
    heading: "Save big on",
    highlight: "bulk gift deals",
    sub: "Save upto 15% on orders above 25 pieces",
    desc: "Premium corporate gifts with custom branding, Pan India delivery and dedicated account manager.",
    cta: "Get a free quote",
    ctaLink: "#inquiry",
    secondaryCta: "View bulk pricing",
    secondaryLink: "#pricing",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1800&auto=format&fit=crop",
    discount: [
      { percent: "5% OFF", label: "05–20 hampers" },
      { percent: "8% OFF", label: "21–50 hampers" },
      { percent: "10% OFF", label: "51–100 hampers" },
      { percent: "15% OFF", label: "100+ hampers" },
    ],
  },
  {
    tag: "Employee gifting",
    heading: "Gifts that make",
    highlight: "your team feel valued",
    sub: "Onboarding kits, work anniversaries & festival hampers",
    desc: "From custom mugs to premium hampers — every gift branded with your logo and delivered on time.",
    cta: "Explore employee gifts",
    ctaLink: "/corporate/employee-gifting",
    secondaryCta: "Chat on WhatsApp",
    secondaryLink: "https://wa.me/917665909909",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1800&auto=format&fit=crop",
    discount: null,
  },
  {
    tag: "Client appreciation",
    heading: "Strengthen bonds with",
    highlight: "premium client gifts",
    sub: "Luxury hampers, branded merchandise & custom packaging",
    desc: "Leave a lasting impression on clients and partners with thoughtfully curated, beautifully packaged gifts.",
    cta: "Build your hamper",
    ctaLink: "/build-hamper",
    secondaryCta: "Get bulk quote",
    secondaryLink: "#inquiry",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1800&auto=format&fit=crop",
    discount: null,
  },
];

const categories = [
  {
    label: "Employee welcome kits",
    image:
      "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=200",
    link: "/corporate/welcome-kits",
  },
  {
    label: "Eco friendly gifts",
    image:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=200",
    link: "/corporate/eco-gifts",
  },
  {
    label: "Client gifts",
    image:
      "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=200",
    link: "/corporate/client-gifts",
  },
  {
    label: "Employee gifts",
    image:
      "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=200",
    link: "/corporate/employee-gifts",
  },
  {
    label: "Drinkware",
    image:
      "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=200",
    link: "/corporate/drinkware",
  },
  {
    label: "Promotional products",
    image:
      "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=200",
    link: "/corporate/promotional",
  },
];

export default function CorporateHero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 600);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    <>
      {/* ── CATEGORY CIRCLES — above hero like Boxup ── */}
      <section className="py-8 bg-white border-b border-[#ececec]">
        <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, i) => (
              <Link
                key={i}
                href={cat.link}
                className="flex flex-col items-center gap-3 flex-shrink-0 group"
              >
                <div className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden border-2 border-[#e8e0d5] group-hover:border-[#c0555a] transition-all duration-300 group-hover:shadow-lg">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="text-[12px] text-center text-[#555] group-hover:text-[#c0555a] font-medium transition-colors max-w-[90px] leading-snug">
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERO SLIDER ── */}
      <section className="relative h-[520px] md:h-[600px] overflow-hidden bg-[#1a1a1a]">
        {/* BG IMAGE */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          key={current}
        >
          <img
            src={slide.image}
            alt={slide.heading}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-[#1a1a1a]/40" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 h-full max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
            {/* LEFT */}
            <div
              className={`transition-all duration-500 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
            >
              {/* TAG */}
              <div className="inline-flex items-center gap-2 bg-[#c0555a]/20 border border-[#c0555a]/40 text-[#c0555a] text-[11px] font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c0555a] animate-pulse" />
                {slide.tag}
              </div>

              {/* HEADING */}
              <h1
                className="text-white font-bold leading-tight mb-3"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(40px, 5vw, 68px)",
                }}
              >
                {slide.heading}
                <br />
                <span className="text-[#c0555a]">{slide.highlight}</span>
              </h1>

              <p className="text-white/50 text-[13px] md:text-[14px] font-medium mb-3 uppercase tracking-wider">
                {slide.sub}
              </p>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-lg mb-8">
                {slide.desc}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#c0555a] text-white text-[13px] font-semibold rounded-full hover:bg-[#a84449] transition-all duration-300"
                >
                  {slide.cta}
                  <ArrowRight size={15} strokeWidth={2} />
                </Link>
                <a
                  href={slide.secondaryLink}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/20 text-white text-[13px] font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  {slide.secondaryCta}
                </a>
              </div>
            </div>

            {/* RIGHT — discount cards or empty */}
            {slide.discount && (
              <div
                className={`hidden lg:grid grid-cols-2 gap-3 transition-all duration-500 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
              >
                {slide.discount.map((d, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#c0555a]/20 flex items-center justify-center flex-shrink-0">
                      <Gift
                        size={18}
                        className="text-[#c0555a]"
                        strokeWidth={1.8}
                      />
                    </div>
                    <div>
                      <p className="text-white font-bold text-[18px]">
                        {d.percent}
                      </p>
                      <p className="text-white/50 text-[12px]">{d.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ARROWS */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>

        {/* DOTS */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-8 h-2 bg-[#c0555a]" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="bg-[#c0555a] py-3">
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[
              "4k+ corporate gifting options",
              "2k+ companies partnered",
              "Pan India delivery",
              "Custom branding available",
              "Min. 25 pieces per order",
              "5–7 day turnaround",
              "4k+ corporate gifting options",
              "2k+ companies partnered",
              "Pan India delivery",
              "Custom branding available",
              "Min. 25 pieces per order",
              "5–7 day turnaround",
            ].map((text, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 mx-8 text-[12px] font-medium text-white/90"
              >
                ✦ {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
