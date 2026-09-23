"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";

const highlights = [
  "Minimum 25 pieces per order",
  "Custom branding & packaging",
  "Pan India delivery",
  "Dedicated account manager",
];

export default function CorporateHero() {
  return (
    <section className="relative overflow-hidden bg-[#1a1a1a] min-h-[85vh] flex items-center">

      {/* BG IMAGE with dark overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=1800"
          alt="Corporate gifting"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/90 to-transparent" />
      </div>

      {/* DECORATIVE CIRCLES */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full border border-[#c0555a]/10 pointer-events-none" />
      <div className="absolute top-32 right-32 w-48 h-48 rounded-full border border-[#c0555a]/10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-[#c0555a]/5 pointer-events-none" />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT CONTENT ── */}
          <div>

            {/* EYEBROW BADGE */}
            <div className="inline-flex items-center gap-2 bg-[#c0555a]/15 border border-[#c0555a]/30 text-[#c0555a] text-[12px] font-semibold px-4 py-2 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0555a] animate-pulse" />
              Corporate gifting solutions
            </div>

            {/* HEADING */}
            <h1
              className="text-white font-bold leading-[1.05] mb-6"
              style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(48px, 6vw, 80px)" }}
            >
              Gifts that make
              <br />
              <span className="text-[#c0555a]">your brand</span>
              <br />
              unforgettable
            </h1>

            {/* DESCRIPTION */}
            <p className="text-white/60 text-[15px] md:text-[16px] leading-relaxed max-w-lg mb-8">
              Premium personalized gifting for corporates, startups & enterprises.
              From employee onboarding kits to client appreciation hampers —
              we handle everything, end to end.
            </p>

            {/* HIGHLIGHTS */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-[#c0555a] flex-shrink-0" strokeWidth={2} />
                  <span className="text-white/70 text-[13px]">{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="#inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#c0555a] text-white text-[14px] font-semibold rounded-full hover:bg-[#a84449] transition-all duration-300"
              >
                Get a free quote
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              
                href="https://wa.me/917665909909?text=Hi%2C%20I%20am%20interested%20in%20corporate%20gifting%20solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white text-[14px] font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* ── RIGHT — floating cards ── */}
          <div className="hidden lg:flex flex-col gap-4 items-end">

            {/* CARD 1 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 w-72">
              <p className="text-white/50 text-[11px] uppercase tracking-[2px] mb-1">Avg. order size</p>
              <p className="text-white text-[28px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                250 pieces
              </p>
              <p className="text-white/40 text-[12px] mt-1">Per corporate client</p>
            </div>

            {/* CARD 2 */}
            <div className="bg-[#c0555a] rounded-2xl p-5 w-72">
              <p className="text-white/70 text-[11px] uppercase tracking-[2px] mb-1">Delivered across</p>
              <p className="text-white text-[28px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                India & globally
              </p>
              <p className="text-white/70 text-[12px] mt-1">Pan India + international shipping</p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 w-72">
              <p className="text-white/50 text-[11px] uppercase tracking-[2px] mb-1">Turnaround time</p>
              <p className="text-white text-[28px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                5–7 working days
              </p>
              <p className="text-white/40 text-[12px] mt-1">For bulk custom orders</p>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM FADE */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
      />
    </section>
  );
}