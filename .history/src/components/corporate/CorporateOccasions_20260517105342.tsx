"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Gift,
  Award,
  HeartHandshake,
  BadgeCheck,
  UserPlus,
  Handshake,
} from "lucide-react";

const occasions = [
  {
    icon: Gift,
    title: "Birthday gifts",
    link: "/corporate/birthday",
  },
  {
    icon: Award,
    title: "Working anniversary gifts",
    link: "/corporate/anniversary",
  },
  {
    icon: BadgeCheck,
    title: "Rewards and recognition",
    link: "/corporate/rewards",
  },
  {
    icon: HeartHandshake,
    title: "Client appreciation gifts",
    link: "/corporate/client-appreciation",
  },
  {
    icon: UserPlus,
    title: "Employee onboarding",
    link: "/corporate/onboarding",
  },
  {
    icon: Handshake,
    title: "Thank you gifts",
    link: "/corporate/thank-you",
  },
];

export default function CorporateOccasions() {
  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        <div
          className="relative overflow-hidden rounded-[32px] grid grid-cols-1 lg:grid-cols-2 min-h-[560px]"
          style={{ backgroundColor: "#1a2e1a" }}
        >

          {/* ── LEFT — heading + cards ── */}
          <div className="relative z-10 p-8 md:p-12 lg:p-14 flex flex-col justify-center">

            {/* Decorative star */}
            <div className="absolute top-8 left-8 text-white/20 text-2xl pointer-events-none">✦</div>

            {/* HEADING */}
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-10"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Corporate gifting for every occasion
            </h2>

            {/* CARDS GRID — 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {occasions.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.link}
                    className="group bg-[#f5f0e8] rounded-2xl p-5 min-h-[120px] flex flex-col justify-between hover:bg-white hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#c0555a]/10 flex items-center justify-center mb-3">
                      <Icon size={20} className="text-[#c0555a]" strokeWidth={1.8} />
                    </div>
                    <h3
                      className="text-[15px] md:text-[16px] text-[#1a1a1a] leading-snug font-medium"
                    >
                      {item.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT — stacked gift boxes image ── */}
          <div className="relative hidden lg:block">
            {/* Radial glow like reference */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)",
              }}
            />
            <Image
              src="https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800"
              alt="Corporate gift boxes"
              fill
              className="object-cover object-center"
              sizes="50vw"
            />
            {/* Left fade to blend with dark bg */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to right, #1a2e1a 0%, transparent 30%)",
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}