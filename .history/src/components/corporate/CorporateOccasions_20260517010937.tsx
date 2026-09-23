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
    <section className="py-12 w">
      <div className="container-custom">

        {/* Background Wrapper */}
        <div className="relative overflow-hidden rounded-[32px] h-[560px] w-full">

          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1974&auto=format&fit=crop"
            alt="Corporate Gifts"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/35" />

          {/* Content */}
          <div className="relative z-10 h-full p-6 md:p-10 flex flex-col justify-center">

            {/* Heading */}
            <div className="mb-8">
              <h2
                className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Corporate Gifting For Every Occasion
              </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[850px]">

              {occasions.map((item, i) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={i}
                    href={item.link}
                    className="group bg-white/95 backdrop-blur-sm rounded-[24px] p-5 min-h-[130px] flex flex-col justify-between hover:scale-[1.02] hover:bg-white transition-all duration-300"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#c0555a]/10 flex items-center justify-center">
                      <Icon
                        size={22}
                        className="text-[#c0555a]"
                        strokeWidth={1.8}
                      />
                    </div>

                    <h3
                      className="text-lg md:text-xl text-[#111827] leading-snug"
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