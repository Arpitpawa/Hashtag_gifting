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
    <section className="py-14 bg-[#f3efe8]">
      <div className="container-custom">

        {/* Heading */}
        <div className="mb-10">
          <h2
            className="text-3xl md:text-5xl font-bold text-[#111827] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Corporate Gifting For Every Occasion
          </h2>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

          {/* Left Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {occasions.map((item, i) => {
              const Icon = item.icon;

              return (
                <Link
                  key={i}
                  href={item.link}
                  className="group bg-white rounded-[24px] p-6 min-h-[145px] flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#c0555a]/10 flex items-center justify-center">
                    <Icon
                      size={24}
                      className="text-[#c0555a]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <h3
                    className="text-xl md:text-2xl text-[#111827] mt-6 leading-snug"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.title}
                  </h3>
                </Link>
              );
            })}
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-[28px] h-[460px]">
              <img
                src="https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1974&auto=format&fit=crop"
                alt="Corporate Gifts"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}