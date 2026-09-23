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
    <section className="py-20 *: ">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* Heading */}
        <div className="mb-12">
          <h2
            className="text-4xl md:text-6xl font-bold text-[#111827] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Corporate Gifting For Every Occasion
          </h2>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {occasions.map((item, i) => {
              const Icon = item.icon;

              return (
                <Link
                  key={i}
                  href={item.link}
                  className="group bg-white rounded-[28px] p-10 min-h-[180px] flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#c0555a]/10 flex items-center justify-center">
                    <Icon
                      size={28}
                      className="text-[#c0555a]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <h3
                    className="text-2xl md:text-3xl text-[#111827] mt-10 leading-snug"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.title}
                  </h3>
                </Link>
              );
            })}
          </div>

          {/* Right Image */}
          <div className="relative h-full">
            <div className="overflow-hidden rounded-[32px] h-full min-h-[620px]">
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