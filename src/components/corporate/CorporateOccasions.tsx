"use client";

import Link from "next/link";
import { Gift, Award, HeartHandshake, BadgeCheck, UserPlus, Handshake } from "lucide-react";

const occasions = [
  { icon: Gift,          title: "Birthday Gifts",              link: "/corporate/birthday" },
  { icon: Award,         title: "Working Anniversary Gifts",   link: "/corporate/anniversary" },
  { icon: BadgeCheck,    title: "Rewards And Recognition",     link: "/corporate/rewards" },
  { icon: HeartHandshake,title: "Client Appreciation Gifts",   link: "/corporate/client-appreciation" },
  { icon: UserPlus,      title: "Employee Onboarding",         link: "/corporate/onboarding" },
  { icon: Handshake,     title: "Thank You Gifts",             link: "/corporate/thank-you" },
];

export default function CorporateOccasions() {
  return (
    <section className="relative w-full overflow-hidden min-h-[580px] md:min-h-[640px] flex items-center">

      <img
        src="https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1974&auto=format&fit=crop"
        alt="Corporate gifting occasions"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(20,45,20,0.92) 0%, rgba(20,45,20,0.85) 40%, rgba(20,45,20,0.4) 65%, transparent 100%)" }}
      />

      <div className="relative z-10 w-full px-8 md:px-14 lg:px-20 py-14 md:py-20">

        <div className="text-white/30 text-xl mb-4 pointer-events-none">✦</div>

        {/* HEADING — Playfair Display */}
        <h2
          className="text-[42px] md:text-[66px] font-normal text-white leading-tight mb-10 max-w-xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
        >
          Corporate Gifting For Every Occasion
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[700px]">
          {occasions.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={i} href={item.link}
                className="group bg-[#f5f0e8]/95 backdrop-blur-sm rounded-2xl px-6 py-5 min-h-[110px] flex flex-col justify-between hover:bg-white hover:scale-[1.02] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#c0555a]/10 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-[#c0555a]" strokeWidth={1.8} />
                </div>
                <h3 className="text-[15px] text-[#1a1a1a] font-medium leading-snug">
                  {item.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}