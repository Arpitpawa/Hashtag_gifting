import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Return & Refund Policy — Hashtag Gifting",
};
const TITLE = "Return & Refund Policy";
const CONTENT = [
  {
    h: "Our guarantee",
    p: "We stand behind the quality of everything we make. If you are not completely satisfied, contact us and we will make it right.",
  },
  {
    h: "Personalised products",
    p: "Since personalised products are made-to-order specifically for you, we do not accept returns or exchanges unless there is a manufacturing defect or shipping damage.",
  },
  {
    h: "Non-personalised products",
    p: "Non-personalised items can be returned within 7 days of delivery in original, unused condition with original packaging.",
  },
  {
    h: "Defective or damaged items",
    p: "If your item arrives defective or damaged, contact us within 48 hours with photos. We will send a free replacement or issue a full refund — your choice.",
  },
  {
    h: "Refund timeline",
    p: "Approved refunds are processed within 5–7 business days to your original payment method.",
  },
  {
    h: "How to initiate a return",
    p: "WhatsApp us at +91 86400 30112 or email hashtaggiftsupport@gmail.com with your order ID and photos of the issue.",
  },
];

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="bg-white border-b border-[#e8e0d5] py-12 text-center px-4">
        <h1 className="text-[32px] font-bold text-[#1a1a1a]">{TITLE}</h1>
        <p className="text-[13px] text-[#aaa] mt-2">
          Last updated: January 2025
        </p>
      </div>
      <div className="max-w-[720px] mx-auto px-4 py-12">
        <div className="flex flex-col gap-6">
          {CONTENT.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#e8e0d5] p-6"
            >
              <h2 className="text-[16px] font-bold text-[#1a1a1a] mb-2">
                {s.h}
              </h2>
              <p className="text-[14px] text-[#555] leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-6 text-center">
          <p className="text-[14px] text-[#555]">
            Questions?{" "}
            <a
              href="https://wa.me/917665909909"
              className="text-[#c0555a] font-semibold hover:underline"
            >
              WhatsApp us
            </a>{" "}
            or email{" "}
            <a
              href="mailto:hashtaggiftsupport@gmail.com"
              className="text-[#c0555a] font-semibold hover:underline"
            >
              hashtaggiftsupport@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
