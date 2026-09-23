"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, BadgeCheck, ChevronDown, ChevronUp } from "lucide-react";
import type { Product } from "@/types/product";

const FAQS = [
  { q: "How long does customization take?",    a: "Personalized products are crafted within 24–48 hours of order placement." },
  { q: "Can I see a proof before production?", a: "Our live preview shows exactly how your product will look. Production starts after order confirmation." },
  { q: "What if I'm not satisfied?",           a: "We offer a 100% satisfaction guarantee. Contact us within 7 days of delivery for a replacement or refund." },
  { q: "Do you offer bulk/corporate orders?",  a: "Yes! We specialize in bulk corporate gifting. Contact us via WhatsApp for custom quotes." },
  { q: "What is the return policy?",           a: "Personalized items cannot be returned unless there is a manufacturing defect. Non-personalized items can be returned within 7 days." },
];

const SPECS = [
  { l: "Material",      v: "Premium ceramic / High-quality print" },
  { l: "Size",          v: "Standard (11oz / 330ml)" },
  { l: "Print type",    v: "Full color sublimation print" },
  { l: "Customization", v: "Photo + Text + Message" },
  { l: "Production",    v: "24–48 hours" },
  { l: "Care",          v: "Hand wash recommended" },
  { l: "Packaging",     v: "Bubble wrap + sturdy box" },
  { l: "Warranty",      v: "7-day quality guarantee" },
];

type Tab = "description" | "specs" | "reviews" | "faq";

interface Props {
  product:        Product;
  defaultTab?:    Tab;
  onTabRef?:      (setTab: (t: Tab) => void) => void;
}

export default function ProductTabs({ product, defaultTab = "description", onTabRef }: Props) {
  const [activeTab,   setActiveTab]   = useState<Tab>(defaultTab);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Expose setActiveTab so parent can scroll to reviews
  if (onTabRef) onTabRef(setActiveTab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "specs",       label: "Specs" },
    { key: "reviews",     label: product.reviews.length > 0 ? `Reviews (${product.reviews.length})` : "Reviews" },
    { key: "faq",         label: "FAQ" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm mb-16 overflow-hidden">
      {/* Tab bar */}
      <div
        className="flex border-b border-[#e8e0d5] overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-4 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-all capitalize flex-shrink-0 ${
              activeTab === key
                ? "border-[#c0555a] text-[#c0555a] bg-[#c0555a]/5"
                : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">

        {/* ── DESCRIPTION ── */}
        {activeTab === "description" && (
          <div className="max-w-3xl space-y-6">
            <p className="text-[15px] text-[#555] leading-relaxed">
              {product.description || "A beautifully crafted personalized gift made with love and attention to detail."}
            </p>
            <div>
              <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-4">How it works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { n:"1", e:"✏️", t:"Personalize",   d:"Enter name, message or upload your photo" },
                  { n:"2", e:"🎨", t:"We craft it",   d:"Our artisans print and craft your gift with care" },
                  { n:"3", e:"🚀", t:"Fast delivery",  d:"Packed and delivered safely to your door" },
                ].map((s) => (
                  <div key={s.n} className="flex gap-3 p-4 bg-[#f3efe8] rounded-xl">
                    <div className="w-8 h-8 bg-[#c0555a] text-white rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#1a1a1a]">{s.e} {s.t}</p>
                      <p className="text-[12px] text-[#6b6b6b] mt-0.5">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SPECS ── */}
        {activeTab === "specs" && (
          <div className="max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SPECS.map((spec) => (
                <div key={spec.l} className="flex gap-3 p-3 bg-[#f3efe8] rounded-xl">
                  <span className="text-[12px] font-bold text-[#c0555a] w-[100px] flex-shrink-0">{spec.l}</span>
                  <span className="text-[12px] text-[#555]">{spec.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === "reviews" && (
          <div className="max-w-3xl">
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-8 mb-8 p-5 bg-[#f3efe8] rounded-2xl flex-wrap">
                {/* Average */}
                <div className="text-center">
                  <p className="text-5xl font-bold text-[#1a1a1a]">{product.avgRating}</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={16}
                        className={s <= Math.round(product.avgRating)
                          ? "fill-[#f4b56a] text-[#f4b56a]"
                          : "fill-gray-200 text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-[12px] text-[#aaa] mt-1">{product.reviews.length} reviews</p>
                </div>

                {/* Bar chart */}
                <div className="flex-1 min-w-[160px]">
                  {[5,4,3,2,1].map((star) => {
                    const count = product.reviews.filter((r) => r.rating === star).length;
                    return (
                      <div key={star} className="flex items-center gap-2 mb-1.5">
                        <span className="text-[12px] text-[#555] w-3">{star}</span>
                        <Star size={11} className="fill-[#f4b56a] text-[#f4b56a]" />
                        <div className="flex-1 h-2 bg-[#e8e0d5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#f4b56a] rounded-full"
                            style={{ width: `${(count / product.reviews.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#aaa] w-4">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {product.reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star size={32} className="text-[#e8e0d5] mx-auto mb-3" />
                <p className="text-[15px] text-[#6b6b6b]">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border border-[#e8e0d5] rounded-2xl p-5 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#c0555a] rounded-full flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                          {review.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-semibold text-[#1a1a1a]">{review.name}</p>
                            <span className="flex items-center gap-0.5 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                              <BadgeCheck size={10} /> Verified
                            </span>
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} size={11}
                                className={s <= review.rating
                                  ? "fill-[#f4b56a] text-[#f4b56a]"
                                  : "fill-gray-200 text-gray-200"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[12px] text-[#aaa] flex-shrink-0">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#555] leading-relaxed">{review.comment}</p>

                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e8e0d5]">
                            <Image src={img} alt="Review photo" fill className="object-cover" sizes="64px" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FAQ ── */}
        {activeTab === "faq" && (
          <div className="max-w-2xl flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-[#e8e0d5] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#f3efe8] transition-colors"
                >
                  <span className="text-[14px] font-semibold text-[#1a1a1a] pr-4">{faq.q}</span>
                  {expandedFaq === i
                    ? <ChevronUp   size={16} className="text-[#c0555a] flex-shrink-0" />
                    : <ChevronDown size={16} className="text-[#aaa] flex-shrink-0" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-5 py-4 bg-[#f3efe8] border-t border-[#e8e0d5]">
                    <p className="text-[13px] text-[#555] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}