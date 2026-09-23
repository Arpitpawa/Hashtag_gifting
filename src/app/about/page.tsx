import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart, Star, Truck, Award, Users, Sparkles,
  MapPin, Phone, Mail, ArrowRight, CheckCircle,
} from "lucide-react";
import { getActiveProductCount, roundDownForMarketing } from "@/lib/productCount";

export const metadata: Metadata = {
  title: "About Us",
  description: "Jaipur's most loved personalised gifting brand. Learn about our story, mission and the team behind every gift.",
};

// "Gift designs" count is filled in at render time from the live catalog —
// see AboutPage() below.
const BASE_STATS = [
  { num: "10K+",  label: "Happy customers",   icon: Users    },
  { num: "4.9",   label: "Average rating",    icon: Star     },
  { num: "2019",  label: "Est. in Jaipur",    icon: Award    },
];

const VALUES = [
  {
    icon: Heart,
    title: "Made with love",
    desc:  "Every product is handcrafted by our team with attention to detail. We believe a gift should feel like a hug — warm, personal and unforgettable.",
  },
  {
    icon: Award,
    title: "Premium quality",
    desc:  "We use only the finest materials — food-grade ceramic, solid wood, premium fabric — because we know your gift represents your feelings.",
  },
  {
    icon: Sparkles,
    title: "100% personalised",
    desc:  "No two gifts are the same. Every order is uniquely crafted just for you — with your names, photos and messages printed with care.",
  },
  {
    icon: Truck,
    title: "Fast & reliable delivery",
    desc:  "3-hour express delivery within Jaipur, same-day dispatch pan India. Because we know timing matters when it comes to gifting.",
  },
  {
    icon: CheckCircle,
    title: "Quality guaranteed",
    desc:  "If your gift arrives damaged or with a manufacturing defect, we remake it or refund you — no questions asked. Personalised items can't be returned for change of mind, but we always stand behind our workmanship.",
  },
  {
    icon: Users,
    title: "10,000+ happy customers",
    desc:  "From heartfelt birthday gifts to bulk corporate hampers — our customers trust us for every occasion, and we never take that lightly.",
  },
];

const TEAM = [
  {
    name:  "Arpit Sharma",
    role:  "Founder & Creative Director",
    desc:  "Started Hashtag Gifting with a vision to make personalised gifts accessible to everyone in Jaipur and beyond.",
    initials: "AS",
  },
  {
    name:  "Design Team",
    role:  "Product & Art Direction",
    desc:  "Our in-house design team crafts every template, every layout and every print to ensure your gift looks stunning.",
    initials: "DT",
  },
  {
    name:  "Production Team",
    role:  "Manufacturing & QC",
    desc:  "Skilled artisans who bring your gifts to life — checking every product before it leaves our facility.",
    initials: "PT",
  },
];

const PROCESS = [
  { step: "01", title: "You place your order",      desc: "Choose your gift, add personalisation details and checkout securely." },
  { step: "02", title: "We craft your gift",        desc: "Our team begins production within hours of order confirmation." },
  { step: "03", title: "Quality check",             desc: "Every gift is inspected and photographed before packaging." },
  { step: "04", title: "Packed with love",          desc: "Gift wrapped beautifully — ready to make someone smile." },
  { step: "05", title: "Delivered to your door",    desc: "Express delivery in Jaipur, reliable shipping pan India." },
];

export default async function AboutPage() {
  let productCount = 0;
  try {
    productCount = roundDownForMarketing(await getActiveProductCount());
  } catch (err) {
    console.error("ABOUT PAGE: failed to load product count:", err);
  }
  const giftDesignsStat = { num: productCount > 0 ? `${productCount}+` : "150+", label: "Gift designs", icon: Sparkles };
  const STATS = [giftDesignsStat, ...BASE_STATS];

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <p className="text-[#c0555a] font-semibold text-[13px] tracking-widest uppercase mb-4">
            Our story
          </p>
          <h1
            className="text-[36px] md:text-[56px] font-normal text-[#1a1a1a] mb-6 leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Made with love,<br />
            <span className="italic text-[#c0555a]">gifted from the heart</span>
          </h1>
          <p className="text-[16px] text-[#666] max-w-2xl mx-auto leading-relaxed">
            We started Hashtag Gifting with one simple belief — every gift should feel personal.
            We are a team of creators, designers and gift enthusiasts based in Jaipur,
            crafting personalised gifts that speak from the heart since 2019.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-16">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {STATS.map(({ num, label, icon: Icon }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6 text-center">
              <Icon size={22} className="text-[#c0555a] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[30px] font-bold text-[#1a1a1a] leading-none">{num}</p>
              <p className="text-[13px] text-[#888] mt-1.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Story ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20 items-center">
          <div>
            <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">How it started</p>
            <h2
              className="text-[28px] md:text-[34px] font-normal text-[#1a1a1a] mb-5 leading-[1.2]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              From a small idea to Jaipur's favourite gift brand
            </h2>
            <div className="flex flex-col gap-4 text-[14px] text-[#555] leading-relaxed">
              <p>
                It all started in 2019 when our founder Arpit couldn't find a gift that felt truly personal.
                Every store had the same generic mugs, the same mass-produced frames. So he decided to create something different.
              </p>
              <p>
                Starting with just a few products and a small workspace in Jaipur, Hashtag Gifting grew from
                handmaking a few custom mugs a week to fulfilling thousands of orders every month — each one
                crafted with the same care as the very first.
              </p>
              <p>
                Today we are Jaipur's most loved personalised gifting brand — trusted by individuals,
                couples, families and corporates across India to celebrate every occasion with a
                gift that truly means something.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { bg: "#6B4F3F", text: "Jaipur's #1\nPersonalised Gift Brand", sub: "Since 2019" },
              { bg: "#c0555a", text: "3-Hour\nExpress Delivery", sub: "Within Jaipur" },
              { bg: "#1a1a1a", text: "10,000+\nHappy Customers", sub: "And counting" },
              { bg: "#c4922a", text: `${productCount > 0 ? productCount + "+" : "150+"}\nUnique Designs`, sub: "Always growing" },
            ].map((card, i) => (
              <div
                key={i}
                style={{ backgroundColor: card.bg }}
                className="rounded-2xl p-5 flex flex-col justify-between min-h-[140px]"
              >
                <p className="text-white text-[15px] font-bold leading-snug whitespace-pre-line">{card.text}</p>
                <p className="text-white/60 text-[11px] font-medium mt-2">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Values ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-2">What we stand for</p>
            <h2
              className="text-[28px] md:text-[36px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Our values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
                <div className="w-10 h-10 bg-[#c0555a]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#c0555a]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">{title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Process ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-2">How it works</p>
            <h2
              className="text-[28px] md:text-[36px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              From order to doorstep
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {PROCESS.map(({ step, title, desc }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-5 flex items-start gap-5">
                <div className="w-12 h-12 bg-[#f3efe8] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#e8e0d5]">
                  <span className="text-[13px] font-bold text-[#c0555a]">{step}</span>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">{title}</p>
                  <p className="text-[13px] text-[#666] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact info ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 mb-8">
          <div className="text-center mb-6">
            <h2
              className="text-[22px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Visit us in Jaipur
            </h2>
            <p className="text-[13px] text-[#888] mt-1">We'd love to meet you in person</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: MapPin, label: "Address",      value: "Shop no. 83, Roop Vandana Complex, Arya Samaj Rd, Gurunanakpura, Raja Park, Jaipur, Rajasthan 302004", href: "https://maps.google.com/?q=Shop+no.+83,+Roop+Vandana+Complex,+Arya+Samaj+Rd,+Gurunanakpura,+Raja+Park,+Jaipur,+Rajasthan+302004" },
              { icon: Phone,  label: "Call/WhatsApp", value: "+91 76659 09909", href: "tel:+917665909909" },
              { icon: Mail,   label: "Email",         value: "hashtaggiftsupport@gmail.com", href: "mailto:hashtaggiftsupport@gmail.com" },
            ].map(({ icon: Icon, label, value, href }, i) => (
              <a
                key={i}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 bg-[#f3efe8] rounded-xl hover:bg-[#ede8e0] transition-colors group"
              >
                <Icon size={16} className="text-[#c0555a] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a] group-hover:text-[#c0555a] transition-colors leading-snug">{value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div
          className="rounded-2xl p-10 text-center text-white"
          style={{ backgroundColor: "#6B4F3F" }}
        >
          <h2
            className="text-[26px] md:text-[32px] font-normal text-white mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ready to give someone a gift they'll remember?
          </h2>
          <p className="text-white/70 mb-7 text-[14px] max-w-lg mx-auto">
            Browse {productCount > 0 ? `${productCount}+` : "our"} personalised gifts — from wallets and passport covers to diaries, pens and gift combos.
            Delivered with love across India.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#6B4F3F] font-bold rounded-full hover:bg-[#f3efe8] transition-colors text-[14px]"
          >
            Browse all gifts <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}