import type { Metadata } from "next";
import { RefreshCw, CheckCircle, XCircle, Clock, Camera, Phone, AlertCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Our return and refund policy. We stand behind every gift we make.",
};

const ELIGIBLE = [
  "Manufacturing defects (wrong print, blurry text, broken product)",
  "Product damaged during shipping",
  "Wrong product delivered",
  "Significant colour variation from what was displayed",
];

const NOT_ELIGIBLE = [
  "Change of mind after production has started",
  "Incorrect personalisation details provided by you (name spellings, wrong dates etc.)",
  "Minor colour variations due to screen differences",
  "Products that have been used or washed",
  "Orders cancelled after 1 hour of placement",
];

const STEPS = [
  { icon: Camera, step: "01", title: "Take photos",       desc: "Photograph the issue clearly — all sides of the product and the packaging." },
  { icon: Phone,  step: "02", title: "Contact us",        desc: "WhatsApp us at +91 76659 09909 with your order ID and photos within 48 hours of delivery." },
  { icon: RefreshCw, step: "03", title: "We review",     desc: "Our team reviews your request within 4 hours and confirms the resolution." },
  { icon: CheckCircle, step: "04", title: "Replacement or refund", desc: "We dispatch a free replacement or initiate your refund — whichever you prefer." },
];

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">

      <div className="bg-white border-b border-[#e8e0d5] py-14 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">Our promise</p>
        <h1
          className="text-[36px] md:text-[48px] font-normal text-[#1a1a1a] mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Return & Refund Policy
        </h1>
        <p className="text-[13px] text-[#aaa]">Last updated: January 2025</p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-6">

        {/* Our Guarantee */}
        <div className="bg-[#c0555a] rounded-2xl p-7 text-white text-center">
          <CheckCircle size={28} className="mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="text-[20px] font-bold mb-2">Our 100% Satisfaction Guarantee</h2>
          <p className="text-white/85 text-[14px] leading-relaxed max-w-lg mx-auto">
            We stand behind the quality of everything we make. If your gift isn't perfect,
            we'll make it right — free replacement or full refund. No long forms, no hassle.
          </p>
        </div>

        {/* Important note about personalised products */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-bold text-amber-800 mb-1">Important — Personalised Products</p>
            <p className="text-[13px] text-amber-700 leading-relaxed">
              Since every product is made uniquely for you, we cannot accept returns for change of mind.
              However, if there's ANY issue with our workmanship, we take full responsibility.
            </p>
          </div>
        </div>

        {/* What's eligible */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Eligible for replacement / refund</h2>
          </div>
          <div className="flex flex-col gap-3">
            {ELIGIBLE.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#555] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's not eligible */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle size={16} className="text-red-500" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Not eligible for return</h2>
          </div>
          <div className="flex flex-col gap-3">
            {NOT_ELIGIBLE.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#555] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to raise a request */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
          <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-5">How to raise a return request</h2>
          <div className="flex flex-col gap-4">
            {STEPS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f3efe8] border border-[#e8e0d5] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[#c0555a]" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#1a1a1a]">
                    <span className="text-[#c0555a] mr-2">{step}</span>{title}
                  </p>
                  <p className="text-[12px] text-[#666] leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund timeline */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-[#c0555a]/10 rounded-xl flex items-center justify-center">
              <Clock size={16} className="text-[#c0555a]" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Refund timelines</h2>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { method: "UPI / Net Banking", time: "2-3 business days" },
              { method: "Credit / Debit Card", time: "5-7 business days" },
              { method: "Wallet (Paytm, GPay)", time: "1-2 business days" },
              { method: "Cash on Delivery orders", time: "NEFT within 5-7 business days" },
            ].map(({ method, time }, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#f5f0eb] last:border-0">
                <p className="text-[13px] text-[#555]">{method}</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">{time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-6 text-center">
          <p className="text-[14px] text-[#555] mb-4">
            Questions about your return? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/917665909909?text=Hi! I'd like to raise a return request for my order."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#1da851] transition-colors text-[13px]"
            >
              WhatsApp us
            </a>
            <a
              href="mailto:hashtaggiftsupport@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#e8e0d5] text-[#1a1a1a] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-colors text-[13px]"
            >
              Email us <ArrowRight size={13} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}