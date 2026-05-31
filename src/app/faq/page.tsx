import type { Metadata } from "next";
export const metadata: Metadata = { title: "FAQs — Hashtag Gifting" };

const FAQS = [
  {
    q: "How long does personalisation take?",
    a: "All personalised products are crafted within 24–48 hours of order placement. You will receive a dispatch notification once shipped.",
  },
  {
    q: "Can I see how my product will look before ordering?",
    a: "Yes! Our product pages have a live preview feature that shows exactly how your personalised gift will look as you type.",
  },
  {
    q: "Do you offer same-day delivery?",
    a: "We offer same-day dispatch for orders placed before 2 PM in Jaipur. Delivery time depends on your location — typically 1–3 days within Rajasthan and 4–7 days pan-India.",
  },
  {
    q: "What is your return policy?",
    a: "Non-personalised products can be returned within 7 days. Since personalised products are made-to-order, we only offer replacements for manufacturing defects or shipping damage.",
  },
  {
    q: "Can I cancel or modify my order?",
    a: "Orders can be cancelled or modified within 2 hours of placement. After that, production begins and changes may not be possible.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major payment methods including UPI, debit/credit cards, net banking, wallets via Razorpay, and Cash on Delivery.",
  },
  {
    q: "Do you offer bulk or corporate orders?",
    a: "Yes! We specialise in bulk corporate gifting with custom branding and volume discounts. WhatsApp us at +91 86400 30112 for a custom quote.",
  },
  {
    q: "Is my payment secure?",
    a: "Absolutely. All payments are processed through Razorpay with 256-bit SSL encryption. We never store your card details.",
  },
  {
    q: "What if my product arrives damaged?",
    a: "We offer a 100% satisfaction guarantee. If your product arrives damaged, contact us within 48 hours with photos and we will send a replacement immediately.",
  },
  {
    q: "Do you deliver outside India?",
    a: "Currently we deliver only within India. We are working on international shipping — stay tuned!",
  },
];

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="bg-white border-b border-[#e8e0d5] py-12 text-center px-4">
        <h1 className="text-[36px] font-bold text-[#1a1a1a] mb-3">
          Frequently asked questions
        </h1>
        <p className="text-[15px] text-[#888]">
          Everything you need to know about Hashtag Gifting
        </p>
      </div>
      <div className="max-w-[720px] mx-auto px-4 py-12">
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#e8e0d5] p-6"
            >
              <p className="text-[15px] font-bold text-[#1a1a1a] mb-2">
                {faq.q}
              </p>
              <p className="text-[14px] text-[#666] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-[#c0555a] rounded-2xl p-6 text-center text-white">
          <p className="font-bold text-[16px] mb-1">Still have questions?</p>
          <p className="text-white/80 text-[13px] mb-4">
            We are here to help — reach out anytime
          </p>
          <a
            href="https://wa.me/917665909909"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#c0555a] font-bold rounded-full hover:bg-[#f3efe8] transition-colors text-[14px]"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
