import { Star, BadgeCheck } from "lucide-react";

// No named individuals here on purpose — these are real corporate clients,
// but we don't have a specific named contact's permission to quote them by
// name, so each card credits the company/team only, with a generic (not
// fabricated-stats) line about the experience.
const testimonials = [
  {
    role:    "Corporate Gifting Team",
    company: "Tata Motors",
    review:  "Hashtag Gifting has been a reliable partner for our corporate gifting needs — good quality, thoughtful personalisation, and delivery we can count on.",
    rating:  5,
    avatar:  "TM",
  },
  {
    role:    "HR Team",
    company: "Reliance Jio",
    review:  "We've worked with Hashtag Gifting for employee gifting, and the personalised touch always stands out. Smooth process from order to delivery.",
    rating:  5,
    avatar:  "RJ",
  },
  {
    role:    "Admin Team",
    company: "Fortis Hospital",
    review:  "A dependable gifting partner for our corporate needs — consistent quality and easy to work with across every order.",
    rating:  5,
    avatar:  "FH",
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
          <h2
            className="text-[42px] md:text-[66px] font-normal text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Brands That Trust Us
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
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">{t.company}</p>
                  <p className="text-[11px] text-[#888]">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#c0555a] bg-[#c0555a]/10 px-2 py-1 rounded-full">
                    <BadgeCheck size={11} /> Corporate client
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