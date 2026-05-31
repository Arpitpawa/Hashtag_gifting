import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Package, Star, Truck, Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "About Us — Hashtag Gifting" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="bg-white border-b border-[#e8e0d5] py-16 text-center px-4">
        <p className="text-[#c0555a] font-semibold text-[14px] mb-3">Our story</p>
        <h1 className="text-[36px] md:text-[48px] font-bold text-[#1a1a1a] mb-4">Made with love in Jaipur</h1>
        <p className="text-[16px] text-[#666] max-w-2xl mx-auto leading-relaxed">
          We started Hashtag Gifting with one simple belief — every gift should feel personal. We are a team of creators, designers and gift enthusiasts based in Jaipur, crafting personalised gifts that speak from the heart.
        </p>
      </div>
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { num: "500+", label: "Gift designs" },
            { num: "10K+", label: "Happy customers" },
            { num: "4.9★", label: "Average rating" },
            { num: "2019", label: "Est. in Jaipur" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6 text-center">
              <p className="text-[28px] font-bold text-[#c0555a]">{s.num}</p>
              <p className="text-[13px] text-[#888] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <h2 className="text-[24px] font-bold text-[#1a1a1a] mb-6 text-center">Why choose us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {[
            { title: "Made with love",    desc: "Every product is handcrafted by our team with attention to detail and quality." },
            { title: "Premium quality",   desc: "We use only premium materials — ceramic, wood, fabric — to ensure every gift lasts." },
            { title: "100% personalised", desc: "No two gifts are the same. Every order is uniquely crafted just for you." },
            { title: "Fast delivery",     desc: "Same-day dispatch for orders placed before 2 PM. Express delivery available." },
          ].map((v, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
              <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">{v.title}</p>
              <p className="text-[13px] text-[#666] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#c0555a] rounded-2xl p-8 text-center text-white">
          <h2 className="text-[22px] font-bold mb-2">Start gifting today</h2>
          <p className="text-white/80 mb-6 text-[14px]">500+ personalised gifts, delivered across India</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#c0555a] font-bold rounded-full hover:bg-[#f3efe8] transition-colors">
            Browse gifts
          </Link>
        </div>
      </div>
    </div>
  );
}