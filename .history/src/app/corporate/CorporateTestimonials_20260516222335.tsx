import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Mehta",
    role: "HR Manager",
    company: "Tata Consultancy",
    review: "We ordered 500 onboarding kits for our new joinees. The quality was exceptional and delivery was on time. Our employees absolutely loved the personalized touch!",
    rating: 5,
    avatar: "PM",
  },
  {
    name: "Rahul Sharma",
    role: "Admin Head",
    company: "Fortis Healthcare",
    review: "Hashtag Gifting handled our entire Diwali gifting — 800 hampers across 3 cities. Zero issues, beautiful packaging, and our staff loved every bit of it.",
    rating: 5,
    avatar: "RS",
  },
  {
    name: "Sneha Agarwal",
    role: "Marketing Lead",
    company: "Reliance Retail",
    review: "Used them for our client appreciation event. Custom branded boxes with logo — looked incredibly professional. Will definitely be our go-to gifting partner.",
    rating: 5,
    avatar: "SA",
  },
];

export default function CorporateTestimonials() {
  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#c4922a] text-lg italic mb-2 font-light" style={{ fontFamily: "var(--font-heading)" }}>
            Client success stories
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-[#1a1a1a]" style={{ fontFamily: "var(--font-heading)" }}>
            Brands that trust us
          </h2>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#e8e0d5] hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4">

              {/* STARS */}
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="fill-[#f4b56a] text-[#f4b56a]" />
                ))}
              </div>

              {/* REVIEW */}
              <p className="text-[14px] text-[#555] leading-relaxed flex-1">
                "{t.review}"
              </p>

              {/* DIVIDER */}
              <div className="border-t border-[#f0ece6]" />

              {/* AUTHOR */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c0555a] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">{t.name}</p>
                  <p className="text-[11px] text-[#888]">{t.role}, {t.company}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-semibold text-[#c0555a] bg-[#c0555a]/10 px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}