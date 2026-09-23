import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, MapPin, Package, Zap, AlertCircle, CheckCircle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about our delivery options, timelines and shipping charges. 3-hour express delivery in Jaipur, pan India shipping available.",
};

const HIGHLIGHTS = [
  { icon: Zap,          title: "3-Hour Express",    desc: "Within Jaipur",         color: "#c0555a" },
  { icon: Clock,        title: "Same Day Dispatch",  desc: "Orders before 2 PM",    color: "#c4922a" },
  { icon: Truck,        title: "Pan India Delivery", desc: "2-5 business days",     color: "#1a1a1a" },
  { icon: CheckCircle,  title: "Free Shipping",      desc: "On orders above ₹999",  color: "#25D366" },
];

const SECTIONS = [
  {
    icon: Zap,
    title: "3-Hour Express Delivery (Jaipur only)",
    content: [
      "We offer 3-hour express delivery within Jaipur city limits for select products marked with the ⚡ icon.",
      "Express orders must be placed before 6:00 PM to ensure delivery on the same day.",
      "Express delivery is available 7 days a week, including Sundays and public holidays.",
      "Express delivery charges may apply depending on your location within Jaipur.",
      "Delivery to certain areas in Jaipur may take slightly longer depending on traffic and order volume.",
    ],
  },
  {
    icon: Clock,
    title: "Standard Delivery — Jaipur",
    content: [
      "Standard delivery within Jaipur is completed within 4-8 hours for most orders.",
      "Orders placed before 2:00 PM are dispatched the same day.",
      "Orders placed after 2:00 PM are dispatched the next working day and delivered by evening.",
      "We deliver 7 days a week within Jaipur city.",
    ],
  },
  {
    icon: Truck,
    title: "Pan India Shipping",
    content: [
      "We ship to all major cities and towns across India via trusted courier partners including Delhivery, BlueDart and DTDC.",
      "Standard delivery timeline: 2-5 business days depending on your location.",
      "Metro cities (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata): 2-3 business days.",
      "Tier 2 and Tier 3 cities: 3-5 business days.",
      "Remote areas and North East India: 5-8 business days.",
      "Business days exclude Sundays and national holidays.",
    ],
  },
  {
    icon: Package,
    title: "Shipping Charges",
    content: [
      "Free shipping on all orders above Rs. 999.",
      "Orders below Rs. 999: Flat shipping charge of Rs. 49 within Jaipur, Rs. 99 for pan India.",
      "Express delivery within Jaipur: Additional Rs. 49.",
      "Shipping charges are calculated and displayed at checkout before payment.",
    ],
  },
  {
    icon: Clock,
    title: "Production & Dispatch Time",
    content: [
      "Since all our products are personalised and made-to-order, production begins immediately after payment confirmation.",
      "Most products are ready within 2-4 hours of ordering.",
      "Complex or bulk orders may take up to 24 hours before dispatch.",
      "You'll receive an SMS/WhatsApp notification once your order is dispatched with tracking details.",
    ],
  },
  {
    icon: MapPin,
    title: "Order Tracking",
    content: [
      "Once dispatched, you'll receive a tracking link via WhatsApp and email.",
      "You can also track your order on our Track Order page using your order ID.",
      "For Jaipur deliveries, our delivery executive will call you before arriving.",
      "For pan India deliveries, you can track directly on the courier partner's website.",
    ],
  },
  {
    icon: AlertCircle,
    title: "Delays & Exceptions",
    content: [
      "Delivery timelines may be affected during peak seasons (Valentine's Day, Diwali, Rakhi, Christmas).",
      "Natural calamities, strikes or unforeseen events beyond our control may cause delays.",
      "Incorrect or incomplete delivery addresses may result in delays or failed deliveries — please double-check your address before placing an order.",
      "If a delivery attempt fails, the courier will retry once. After that, the order is returned to us and we'll contact you to re-arrange delivery.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* Hero */}
      <div className="bg-white border-b border-[#e8e0d5] py-14 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">Delivery information</p>
        <h1
          className="text-[36px] md:text-[48px] font-normal text-[#1a1a1a] mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Shipping Policy
        </h1>
        <p className="text-[13px] text-[#aaa]">Last updated: January 2025</p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12">

        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-4 text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={18} style={{ color }} strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-bold text-[#1a1a1a]">{title}</p>
              <p className="text-[11px] text-[#888] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-5 mb-10">
          {SECTIONS.map(({ icon: Icon, title, content }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#c0555a]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#c0555a]" />
                </div>
                <h2 className="text-[15px] font-bold text-[#1a1a1a]">{title}</h2>
              </div>
              <ul className="flex flex-col gap-2.5">
                {content.map((line, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c0555a] flex-shrink-0 mt-[6px]" />
                    <p className="text-[13px] text-[#555] leading-relaxed">{line}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-6 text-center">
          <Phone size={20} className="text-[#c0555a] mx-auto mb-3" />
          <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2">Shipping questions?</h3>
          <p className="text-[13px] text-[#555] mb-4">
            Our team is available 9 AM – 9 PM, 7 days a week.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/917665909909?text=Hi! I have a question about shipping."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#1da851] transition-colors text-[13px]"
            >
              WhatsApp us
            </a>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#e8e0d5] text-[#1a1a1a] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-colors text-[13px]"
            >
              Track my order
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}