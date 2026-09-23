import type { Metadata } from "next";
import { Shield, Lock, Eye, Database, Cookie, Bell, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hashtag Gifting collects, uses and protects your personal information.",
};

const SECTIONS = [
  {
    icon: Database,
    title: "Information we collect",
    content: [
      { sub: "Account information", text: "When you create an account or place an order, we collect your name, email address, phone number and delivery address." },
      { sub: "Personalisation data", text: "Names, messages, photos and other customisation details you provide to create your personalised gift. These are used solely to fulfil your order." },
      { sub: "Payment information", text: "Payment is processed by Razorpay. We never see or store your full card number, CVV or banking credentials. Razorpay handles all payment data with PCI-DSS Level 1 compliance." },
      { sub: "Usage data", text: "Basic analytics about how you use our website (pages visited, products viewed) to help us improve your experience. This data is anonymised and aggregated." },
    ],
  },
  {
    icon: Eye,
    title: "How we use your information",
    content: [
      { sub: "Order fulfilment", text: "To process your order, personalise your gift, arrange delivery and send you order updates via WhatsApp, SMS and email." },
      { sub: "Customer support", text: "To respond to your queries, resolve issues and provide after-sales support." },
      { sub: "Service improvement", text: "To understand how customers use our website and products, so we can make them better." },
      { sub: "Marketing (with consent)", text: "If you opt in, we may send you occasional offers, new product announcements and gifting inspiration. You can unsubscribe at any time." },
    ],
  },
  {
    icon: Shield,
    title: "How we protect your data",
    content: [
      { sub: "Encryption", text: "Our website uses HTTPS with SSL/TLS encryption. All data transmitted between your browser and our servers is encrypted." },
      { sub: "Secure storage", text: "Your data is stored on secure, encrypted servers. Photos uploaded for personalisation are stored on Cloudinary with strict access controls." },
      { sub: "Limited access", text: "Only authorised team members who need your data to fulfil your order have access to it. We do not share your data with third parties for marketing." },
      { sub: "Payment security", text: "We use Razorpay for payment processing. Your card details never touch our servers — they go directly to Razorpay's PCI-DSS compliant environment." },
    ],
  },
  {
    icon: Cookie,
    title: "Cookies",
    content: [
      { sub: "Essential cookies", text: "We use necessary cookies to keep your shopping cart active, remember your login and provide core website functionality. These cannot be disabled." },
      { sub: "Analytics cookies", text: "We use Google Analytics to understand website traffic and user behaviour. This data is anonymised and helps us improve our service." },
      { sub: "No advertising cookies", text: "We do not use cookies to track you across other websites or to serve you targeted ads on other platforms." },
    ],
  },
  {
    icon: Bell,
    title: "Communications",
    content: [
      { sub: "Order updates", text: "We will always send you order confirmation, dispatch notification and delivery updates via WhatsApp and email. These are essential and cannot be opted out of." },
      { sub: "Marketing", text: "We may send promotional messages if you opt in. You can unsubscribe at any time by replying STOP to our WhatsApp messages or clicking Unsubscribe in emails." },
    ],
  },
  {
    icon: Lock,
    title: "Your rights",
    content: [
      { sub: "Access", text: "You can request a copy of all personal data we hold about you at any time." },
      { sub: "Correction", text: "You can update your name, email, phone and delivery address in your account settings or by contacting us." },
      { sub: "Deletion", text: "You can request deletion of your account and personal data. Note that order records may be retained for legal and accounting purposes." },
      { sub: "Data portability", text: "You can request your data in a machine-readable format." },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">

      <div className="bg-white border-b border-[#e8e0d5] py-14 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">Your privacy matters</p>
        <h1
          className="text-[36px] md:text-[48px] font-normal text-[#1a1a1a] mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-[13px] text-[#aaa]">Last updated: January 2025</p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
          <p className="text-[14px] text-[#555] leading-relaxed">
            At Hashtag Gifting, we take your privacy seriously. This policy explains what personal information we collect,
            how we use it and how we protect it. We will never sell your data to third parties or use it for purposes
            beyond what's described here. If you have any questions, email us at{" "}
            <a href="mailto:hashtaggiftsupport@gmail.com" className="text-[#c0555a] font-semibold hover:underline">
              hashtaggiftsupport@gmail.com
            </a>.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ icon: Icon, title, content }, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-[#c0555a]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[#c0555a]" />
              </div>
              <h2 className="text-[16px] font-bold text-[#1a1a1a]">{title}</h2>
            </div>
            <div className="flex flex-col gap-4">
              {content.map(({ sub, text }, j) => (
                <div key={j}>
                  <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">{sub}</p>
                  <p className="text-[13px] text-[#555] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-6 text-center">
          <Mail size={20} className="text-[#c0555a] mx-auto mb-3" />
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Privacy questions?</h3>
          <p className="text-[13px] text-[#555] mb-4">
            For any privacy-related concerns or to exercise your rights, contact us.
          </p>
          <a
            href="mailto:hashtaggiftsupport@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-colors text-[13px]"
          >
            hashtaggiftsupport@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}