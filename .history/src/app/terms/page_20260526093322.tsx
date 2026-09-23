import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Terms & Conditions — Hashtag Gifting",
};
const TITLE = "Terms & Conditions";
const CONTENT = [
  {
    h: "Acceptance of terms",
    p: "By placing an order on Hashtag Gifting, you agree to these terms and conditions. Please read them carefully before purchasing.",
  },
  {
    h: "Product accuracy",
    p: "We make every effort to display products accurately. Actual colours may vary slightly due to screen differences. Personalised product previews are indicative — final products may have minor variations.",
  },
  {
    h: "Order confirmation",
    p: "An order is confirmed only after payment is successfully processed. We reserve the right to cancel orders in case of pricing errors or stock unavailability.",
  },
  {
    h: "Personalisation responsibility",
    p: "You are responsible for the accuracy of personalisation details (names, dates, messages). We are not responsible for errors in information you provide.",
  },
  {
    h: "Intellectual property",
    p: "All content on this website — designs, images, text — is the intellectual property of Hashtag Gifting. Unauthorised use is prohibited.",
  },
  {
    h: "Limitation of liability",
    p: "Our liability is limited to the value of your order. We are not liable for indirect or consequential damages arising from the use of our products.",
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
