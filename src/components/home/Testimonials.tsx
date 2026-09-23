"use client";

import { Star, BadgeCheck } from "lucide-react";

const PRODUCT_IMGS = {
  mug:     "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop",
  lamp:    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
  frame:   "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
  hamper:  "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=600&auto=format&fit=crop",
};

const testimonials = [
  {
    name:    "Pooja Khandal",
    avatar:  "P",
    color:   "bg-purple-100 text-purple-700",
    rating:  5,
    time:    "5 months ago",
    review:  "Such a wonderful place to buy gifts! They provide so many customization choices, all at affordable prices. I absolutely loved it and highly recommend everyone to give them a try.",
    tag:     "Customized gifts",
    product: PRODUCT_IMGS.mug,
    productName: "Personalised photo mug",
    verified: true,
  },
  {
    name:    "Pinky S",
    avatar:  "P",
    color:   "bg-pink-100 text-pink-700",
    rating:  5,
    time:    "6 months ago",
    review:  "I purchased 2 types of custom-made gifts for 3 of my colleagues. Their Spotify acrylic LED stand was so cool that I decided to get one for myself too! The gifts were loved by everyone.",
    tag:     "Spotify LED stand",
    product: PRODUCT_IMGS.lamp,
    productName: "Spotify LED lamp",
    verified: true,
  },
  {
    name:    "Rashi Pawa",
    avatar:  "R",
    color:   "bg-blue-100 text-blue-700",
    rating:  5,
    time:    "5 months ago",
    review:  "I wanted unique and affordable gifts for my class children, and they gave such wonderful ideas! They truly have amazing and creative options, all within budget. Service was excellent.",
    tag:     "Bulk gifting",
    product: PRODUCT_IMGS.hamper,
    productName: "Gift hamper set",
    verified: true,
  },
  {
    name:    "Nidhima Bhuta",
    avatar:  "N",
    color:   "bg-orange-100 text-orange-700",
    rating:  5,
    time:    "4 months ago",
    review:  "Hashtag Gifting always made me happier by customizing the product I need. The quality is always 5 star — the bestest shop for customisation!",
    tag:     "Personalized gift",
    product: PRODUCT_IMGS.frame,
    productName: "Custom photo frame",
    verified: true,
  },
];

const GoogleIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Testimonials() {
  // pb reduced (not py) — this section's own bottom padding was stacking
  // with InstagramReels' top padding right after it, making the gap between
  // "View all Google reviews" and "As seen on instagram" much bigger than
  // the section's other margins.
  return (
    <section className="pt-16 md:pt-20 pb-8 md:pb-10 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* Heading */}
        <div className="mb-12 md:mb-16">
          <h2
            className="text-[42px] md:text-[66px] font-normal text-[#1a1a1a] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Gifted with love
          </h2>
          <p className="text-[#c4922a] text-sm tracking-[3px] font-medium">
            Big love from our community
          </p>
        </div>

        {/* Cards */}
        {/* Added an lg:grid-cols-3 step — straight sm→4-col jump at 1024px
            (iPad Pro width) squeezed h-[200px] images into ~230px-wide
            cards. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="flex flex-col bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden hover:shadow-md transition-shadow">

              <div className="p-4 flex flex-col flex-1">
                {/* Reviewer info */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${t.color}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-[13px] font-normal text-[#1a1a1a] tracking-tight">{t.name}</p>
                      {t.verified && (
                        <BadgeCheck size={13} className="text-[#4285F4] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#2f3e7a] font-semibold">{t.tag}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-2.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={12} className="fill-[#f4b56a] text-[#f4b56a]" />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-[13px] text-[#555] leading-relaxed flex-1">
                  "{t.review}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0ece6]">
                  <div className="flex items-center gap-1">
                    <BadgeCheck size={12} className="text-[#34A853]" />
                    <span className="text-[10px] text-[#34A853] font-semibold">Verified purchase</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GoogleIcon size={11} />
                    <span className="text-[10px] text-[#888]">{t.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-14 pt-8 border-t border-[#e8e0d5] gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-[#f4b56a] text-[#f4b56a]" />
              ))}
            </div>
            <span className="text-[15px] font-semibold text-[#1a1a1a]">4.9</span>
            <span className="text-[14px] text-[#888]">from 2,000+ verified reviews on Google</span>
          </div>
          <a href="https://maps.app.goo.gl/hashtag-gifts-jaipur" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#e8e0d5] rounded-full text-[13px] text-[#555] hover:border-black hover:text-black transition-all bg-white whitespace-nowrap">
            <GoogleIcon size={16} /> View all Google reviews
          </a>
        </div>
      </div>
    </section>
  );
}