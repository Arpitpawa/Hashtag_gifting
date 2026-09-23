"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What are corporate gifts and why are they important for businesses?",
    a: "Corporate gifts are branded or personalized items given to employees, clients, or partners. They build loyalty, boost morale, strengthen relationships, and create lasting brand impressions.",
  },
  {
    q: "What is the minimum order quantity for corporate gifting?",
    a: "We start from as low as 25 pieces per order. For larger quantities (500+), we offer special pricing and dedicated account management.",
  },
  {
    q: "Can you add our company logo and branding to the gifts?",
    a: "Absolutely! We offer full custom branding — logo printing, brand colors, custom messages, and branded packaging on all our corporate products.",
  },
  {
    q: "How long does it take to fulfill a corporate bulk order?",
    a: "Standard bulk orders take 5–7 working days. Express options are available for urgent requirements. We also offer same-day delivery within Jaipur for ready stock.",
  },
  {
    q: "Do you handle Pan India delivery for corporate orders?",
    a: "Yes! We deliver across all states in India. For large orders, we coordinate directly with your HR or admin team for seamless delivery to multiple locations.",
  },
  {
    q: "Can I see samples before placing a bulk order?",
    a: "Yes, we provide physical samples for corporate orders above 100 pieces. Sample charges are adjusted against the final order.",
  },
];

// ── GIFTING SVG WATERMARK ──
const GiftingWatermark = () => (
  <svg
    viewBox="0 0 400 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {/* Large gift box */}
    <rect
      x="80"
      y="200"
      width="180"
      height="140"
      rx="6"
      fill="#c4922a"
      opacity="0.06"
    />
    <rect
      x="80"
      y="200"
      width="180"
      height="140"
      rx="6"
      stroke="#c4922a"
      strokeWidth="1.5"
      opacity="0.12"
    />
    {/* Lid */}
    <rect
      x="68"
      y="172"
      width="204"
      height="34"
      rx="5"
      fill="#c4922a"
      opacity="0.08"
    />
    <rect
      x="68"
      y="172"
      width="204"
      height="34"
      rx="5"
      stroke="#c4922a"
      strokeWidth="1.5"
      opacity="0.14"
    />
    {/* Ribbon vertical */}
    <rect
      x="158"
      y="172"
      width="24"
      height="168"
      fill="#c4922a"
      opacity="0.08"
    />
    {/* Ribbon horizontal */}
    <rect
      x="68"
      y="182"
      width="204"
      height="14"
      fill="#c4922a"
      opacity="0.08"
    />
    {/* Bow left */}
    <path
      d="M170 172 C140 148, 108 155, 118 172 C128 189, 158 180, 170 172Z"
      fill="#c4922a"
      opacity="0.1"
    />
    {/* Bow right */}
    <path
      d="M170 172 C200 148, 232 155, 222 172 C212 189, 182 180, 170 172Z"
      fill="#c4922a"
      opacity="0.1"
    />
    <circle cx="170" cy="172" r="8" fill="#c4922a" opacity="0.15" />

    {/* Small gift box top left */}
    <rect
      x="20"
      y="60"
      width="90"
      height="70"
      rx="4"
      stroke="#c4922a"
      strokeWidth="1"
      opacity="0.1"
      fill="#c4922a"
      fillOpacity="0.03"
    />
    <rect
      x="12"
      y="44"
      width="106"
      height="20"
      rx="3"
      stroke="#c4922a"
      strokeWidth="1"
      opacity="0.1"
      fill="#c4922a"
      fillOpacity="0.03"
    />
    <line
      x1="60"
      y1="44"
      x2="60"
      y2="130"
      stroke="#c4922a"
      strokeWidth="1"
      opacity="0.1"
    />
    <path
      d="M65 44 C50 32, 30 36, 36 44 C42 52, 58 48, 65 44Z"
      fill="#c4922a"
      opacity="0.08"
    />
    <path
      d="M65 44 C80 32, 100 36, 94 44 C88 52, 72 48, 65 44Z"
      fill="#c4922a"
      opacity="0.08"
    />

    {/* Heart top right */}
    <path
      d="M340 80 C340 65, 320 58, 320 72 C320 86, 340 98, 360 110 C380 98, 400 86, 400 72 C400 58, 380 65, 360 80 C357 75, 350 72, 340 80Z"
      fill="#c0555a"
      opacity="0.06"
    />
    <path
      d="M340 80 C340 65, 320 58, 320 72 C320 86, 340 98, 360 110 C380 98, 400 86, 400 72 C400 58, 380 65, 360 80 C357 75, 350 72, 340 80Z"
      stroke="#c0555a"
      strokeWidth="1"
      opacity="0.1"
      fill="none"
    />

    {/* Stars / sparkles */}
    <path
      d="M320 200 L322 208 L330 210 L322 212 L320 220 L318 212 L310 210 L318 208Z"
      fill="#c4922a"
      opacity="0.12"
    />
    <path
      d="M50 300 L51.5 306 L58 307.5 L51.5 309 L50 315 L48.5 309 L42 307.5 L48.5 306Z"
      fill="#c4922a"
      opacity="0.1"
    />
    <path
      d="M360 340 L361 344 L365 345 L361 346 L360 350 L359 346 L355 345 L359 344Z"
      fill="#c0555a"
      opacity="0.1"
    />

    {/* Ribbon tag */}
    <rect
      x="270"
      y="300"
      width="80"
      height="50"
      rx="4"
      stroke="#c4922a"
      strokeWidth="1"
      opacity="0.1"
      fill="#c4922a"
      fillOpacity="0.04"
    />
    <circle
      cx="310"
      cy="295"
      r="5"
      stroke="#c4922a"
      strokeWidth="1"
      opacity="0.12"
      fill="none"
    />
    <line
      x1="310"
      y1="300"
      x2="310"
      y2="295"
      stroke="#c4922a"
      strokeWidth="1"
      opacity="0.12"
    />

    {/* Wavy ribbon lines */}
    <path
      d="M30 380 C60 370, 90 390, 120 380 C150 370, 180 390, 210 380"
      stroke="#c4922a"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.1"
    />
    <path
      d="M30 395 C60 385, 90 405, 120 395 C150 385, 180 405, 210 395"
      stroke="#c4922a"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
      opacity="0.07"
    />

    {/* Dots scatter */}
    <circle cx="290" cy="150" r="4" fill="#c4922a" opacity="0.1" />
    <circle cx="45" cy="180" r="3" fill="#c0555a" opacity="0.08" />
    <circle cx="350" cy="260" r="3" fill="#c4922a" opacity="0.1" />
    <circle cx="100" cy="440" r="4" fill="#c4922a" opacity="0.08" />
    <circle cx="370" cy="440" r="3" fill="#c0555a" opacity="0.08" />
  </svg>
);

export default function CorporateFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* ── LEFT — heading + SVG watermark ── */}
          <div className="relative">
            {/* SVG WATERMARK */}
            <div className="absolute inset-0 pointer-events-none">
              <GiftingWatermark />
            </div>

            {/* CONTENT */}
            <div className="relative z-10 pt-4">
              <span
                className="inline-block text-[#c4922a] text-lg italic mb-3 font-light"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Got questions?
              </span>
              <h2
                className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Answered with honesty
              </h2>
              <p className="text-[#6b6b6b] text-[14px] md:text-[15px] max-w-xs">
                Everything you need to know about corporate gifting with us
              </p>

              {/* BOTTOM CTA */}
              <div className="mt-12 p-6 bg-[#c0555a] rounded-2xl">
                <p className="text-white font-semibold text-[15px] mb-1">
                  Still have questions?
                </p>
                <p className="text-white/70 text-[13px] mb-4">
                  Chat with our corporate gifting expert on WhatsApp
                </p>
                <a
                  href="https://wa.me/917665909909?text=Hi%2C%20I%20have%20a%20query%20about%20corporate%20gifting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-white/90 transition-colors"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT — accordion with + icon ── */}
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  open === i
                    ? "border-[#c0555a] bg-white"
                    : "border-[#e8e0d5] bg-white hover:border-[#c0555a]/40"
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-[14px] font-semibold text-[#1a1a1a] pr-4 leading-snug">
                    {faq.q}
                  </span>

                  {/* + / - icon like reference */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      open === i
                        ? "border-[#c0555a] bg-[#c0555a]"
                        : "border-[#ccc]"
                    }`}
                  >
                    <span
                      className={`text-[18px] font-light leading-none transition-all duration-300 ${
                        open === i ? "text-white" : "text-[#999]"
                      }`}
                    >
                      {open === i ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {open === i && (
                  <div className="px-6 pb-5">
                    <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
