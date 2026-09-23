import Link from "next/link";
import { Gift, Star, Sun, Heart, Award, Coffee } from "lucide-react";

const occasions = [
  { icon: Gift, title: "Employee onboarding", desc: "Make first impressions memorable with branded welcome kits", link: "/corporate/onboarding", count: "50+ options" },
  { icon: Star, title: "Work anniversaries", desc: "Celebrate milestones with personalized appreciation gifts", link: "/corporate/anniversaries", count: "30+ options" },
  { icon: Sun, title: "Festival gifting", desc: "Diwali, Holi, Christmas — bulk festive hampers with branding", link: "/corporate/festivals", count: "80+ options" },
  { icon: Heart, title: "Client appreciation", desc: "Strengthen relationships with premium curated gift sets", link: "/corporate/clients", count: "40+ options" },
  { icon: Award, title: "Awards & recognition", desc: "Honor top performers with custom trophies and gift sets", link: "/corporate/awards", count: "25+ options" },
  { icon: Coffee, title: "Team celebrations", desc: "Birthdays, farewells, promotions — celebrate your people", link: "/corporate/team", count: "35+ options" },
];

export default function CorporateOccasions() {
  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#c4922a] text-lg italic mb-2 font-light" style={{ fontFamily: "var(--font-heading)" }}>
            For every milestone
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-[#1a1a1a]" style={{ fontFamily: "var(--font-heading)" }}>
            Corporate gifting for every occasion
          </h2>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {occasions.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={i} href={item.link} className="group flex gap-4 p-6 bg-white rounded-2xl border border-[#e8e0d5] hover:border-[#c0555a] hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#c0555a]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c0555a] transition-colors duration-300">
                  <Icon size={22} strokeWidth={1.8} className="text-[#c0555a] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[15px] font-semibold text-[#1a1a1a]">{item.title}</h3>
                    <span className="text-[11px] text-[#c0555a] font-semibold bg-[#c0555a]/10 px-2 py-0.5 rounded-full">{item.count}</span>
                  </div>
                  <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}