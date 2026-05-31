"use client";

import Link from "next/link";
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
    title: "Birthday Gifts",
    link: "/corporate/birthday",
  },
  {
    icon: Award,
    title: "Working Anniversary Gifts",
    link: "/corporate/anniversary",
  },
  {
    icon: BadgeCheck,
    title: "Rewards and Recognition",
    link: "/corporate/rewards",
  },
  {
    icon: HeartHandshake,
    title: "Client Appreciation Gifts",
    link: "/corporate/client-appreciation",
  },
  {
    icon: UserPlus,
    title: "Employee Onboarding",
    link: "/corporate/onboarding",
  },
  {
    icon: Handshake,
    title: "Thank You Gifts",
    link: "/corporate/thank-you",
  },
];

export default function CorporateOccasions() {
  return (
    <section className="py-16">
      <div className="container-custom">

        {/* Background Wrapper */}
        <div className="relative overflow-hidden rounded-[36px] min-h-[700px]">

          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1974&auto=format&fit=crop"
            alt="Corporate Gifts"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-10 p-8 md:p-14">

            {/* Heading */}
            <div className="mb-10">
              <h2
                className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Corporate Gifting For Every Occasion
              </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[900px]">

              {occasions.map((item, i) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={i}
                    href={item.link}
                    className="group bg-white/95 backdrop-blur-sm rounded-[28px] p-7 min-h-[170px] flex flex-col justify-between hover:scale-[1.02] hover:bg-white transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#c0555a]/10 flex items-center justify-center">
                      <Icon
                        size={24}
                        className="text-[#c0555a]"
                        strokeWidth={1.8}
                      />
                    </div>

                    <h3
                      className="text-xl md:text-2xl text-[#111827] leading-snug"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.title}
                    </h3>
                  </Link>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}