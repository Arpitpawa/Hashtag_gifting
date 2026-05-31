import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy — Hashtag Gifting" };
const TITLE = "Privacy Policy";
const CONTENT = [
  {
    h: "Information we collect",
    p: "We collect your name, email, phone number, delivery address and payment information when you place an order. We also collect customization details (names, messages, photos) needed to create your personalised gift.",
  },
  {
    h: "How we use your information",
    p: "Your information is used solely to process and deliver your orders, send order updates, and improve our service. We do not sell or share your personal data with third parties for marketing purposes.",
  },
  {
    h: "Payment security",
    p: "All payments are processed through Razorpay with 256-bit SSL encryption. We never store your full card details on our servers.",
  },
  {
    h: "Photos and customisation data",
    p: "Photos you upload for personalisation are stored securely on Cloudinary and used only to create your order. They are not used for any other purpose.",
  },
  {
    h: "Cookies",
    p: "We use essential cookies to keep your cart active and remember your login. We do not use tracking cookies for advertising.",
  },
  {
    h: "Contact us",
    p: "For any privacy concerns, email us at hashtaggiftsupport@gmail.com or WhatsApp +91 86400 30112.",
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
