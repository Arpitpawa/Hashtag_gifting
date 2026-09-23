import type { Metadata } from "next";
import { FileText, ShoppingBag, Palette, Truck, CreditCard, Scale, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Hashtag Gifting's website and services.",
};

const SECTIONS = [
  {
    icon: FileText,
    title: "Acceptance of Terms",
    content: [
      "By accessing our website or placing an order with Hashtag Gifting, you agree to be bound by these Terms and Conditions.",
      "These terms apply to all visitors, customers and users of our website and services.",
      "We reserve the right to update these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.",
      "If you do not agree to these terms, please do not use our website or services.",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Orders & Pricing",
    content: [
      "All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.",
      "An order is considered confirmed only after successful payment processing and you receive an order confirmation email/WhatsApp from us.",
      "We reserve the right to cancel orders in case of pricing errors, stock unavailability or suspected fraud. Full refunds will be issued in such cases.",
      "Product prices may change without prior notice. The price at the time of ordering will be honoured.",
      "For bulk or corporate orders, special pricing is available — contact us for a custom quote.",
    ],
  },
  {
    icon: Palette,
    title: "Personalisation & Customisation",
    content: [
      "You are solely responsible for the accuracy of all personalisation details provided — including names, spellings, dates, messages and photos.",
      "We will produce your gift exactly as specified. We are not responsible for errors in information you provide.",
      "We reserve the right to decline orders containing offensive, illegal or inappropriate content.",
      "Product previews shown on the website are indicative. Final products may have minor variations due to printing processes and material differences.",
      "Actual colours may vary slightly from what is displayed on screen due to monitor calibration differences.",
    ],
  },
  {
    icon: Truck,
    title: "Delivery & Shipping",
    content: [
      "Delivery timelines are estimates and not guaranteed. We are not liable for delays caused by courier partners, weather, strikes or other factors beyond our control.",
      "Risk of loss and title for products pass to you upon delivery.",
      "It is your responsibility to provide a complete and accurate delivery address. We are not responsible for failed deliveries due to incorrect addresses.",
      "For 3-hour express delivery, we cannot guarantee exact timing but will deliver within the time window to the best of our ability.",
    ],
  },
  {
    icon: CreditCard,
    title: "Payment",
    content: [
      "All payments are processed securely through Razorpay. We accept credit/debit cards, UPI, net banking, wallets and cash on delivery.",
      "By providing payment information, you confirm that you are authorised to use the payment method.",
      "In case of payment failure, please do not re-order until the original payment status is confirmed. Contact us if you're unsure.",
      "Cash on Delivery orders are subject to additional verification and are not available for all pin codes or order values.",
    ],
  },
  {
    icon: FileText,
    title: "Intellectual Property",
    content: [
      "All content on this website — including designs, graphics, text, logos, product images and software — is the intellectual property of Hashtag Gifting.",
      "You may not reproduce, distribute, modify or use our content for commercial purposes without prior written permission.",
      "Customer-provided content (photos, names, messages) remains the intellectual property of the customer. By uploading, you grant us a limited licence to use it solely to create your order.",
      "Our product designs and templates are proprietary. Copying or reproducing them is strictly prohibited.",
    ],
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: [
      "Our liability is limited to the value of your order in all circumstances.",
      "We are not liable for any indirect, consequential, special or incidental damages arising from the use of our products or services.",
      "We are not responsible for how you use our products or any third-party claims related to your use.",
      "These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Jaipur, Rajasthan.",
    ],
  },
  {
    icon: FileText,
    title: "User Conduct",
    content: [
      "You must not use our website for any unlawful purpose or in a way that infringes the rights of others.",
      "You must not submit false, misleading or fraudulent information.",
      "You must not upload or request production of any content that is illegal, offensive, hateful or infringes on third-party rights.",
      "We reserve the right to refuse service, cancel orders or terminate accounts of users who violate these terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">

      <div className="bg-white border-b border-[#e8e0d5] py-14 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">Legal</p>
        <h1
          className="text-[36px] md:text-[48px] font-normal text-[#1a1a1a] mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Terms & Conditions
        </h1>
        <p className="text-[13px] text-[#aaa]">Last updated: January 2025</p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12 flex flex-col gap-5">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
          <p className="text-[14px] text-[#555] leading-relaxed">
            These Terms and Conditions govern your use of the Hashtag Gifting website (hashtaggifting.com) and
            the purchase of our products and services. Please read them carefully before placing an order.
            By using our website, you agree to these terms in full.
          </p>
        </div>

        {SECTIONS.map(({ icon: Icon, title, content }, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-[#c0555a]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[#c0555a]" />
              </div>
              <h2 className="text-[16px] font-bold text-[#1a1a1a]">{title}</h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {content.map((line, j) => (
                <div key={j} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c0555a] flex-shrink-0 mt-[6px]" />
                  <p className="text-[13px] text-[#555] leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-6 text-center">
          <Mail size={20} className="text-[#c0555a] mx-auto mb-3" />
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">Questions about our terms?</h3>
          <p className="text-[13px] text-[#555] mb-4">
            Email us at{" "}
            <a href="mailto:hashtaggiftsupport@gmail.com" className="text-[#c0555a] font-semibold hover:underline">
              hashtaggiftsupport@gmail.com
            </a>
            {" "}or WhatsApp us at +91 76659 09909.
          </p>
          <p className="text-[11px] text-[#aaa]">
            Hashtag Gifting, Shop no. 83, Roop Vandana Complex, Arya Samaj Rd, Gurunanakpura, Raja Park, Jaipur, Rajasthan — 302004
          </p>
        </div>

      </div>
    </div>
  );
}