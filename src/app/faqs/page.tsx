"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle, ArrowRight, Search } from "lucide-react";

const FAQS = [
  {
    category: "Orders & Customisation",
    icon: "🎁",
    items: [
      { q: "How do I personalise my gift?", a: "On the product page, click 'Personalise & Add to Cart'. You'll see fields to enter a name, upload a photo, add a message — whatever that product supports. Our team will use exactly what you enter." },
      { q: "Can I preview my gift before ordering?", a: "Yes! Many of our products have a live preview feature. After entering your customisation details, you'll see a real-time preview of how your gift will look. Some products show a preview after adding to cart." },
      { q: "Can I change my customisation after placing the order?", a: "Changes must be requested within 1 hour of placing your order, as production starts quickly. WhatsApp us immediately at +91 76659 09909 with your order ID and the changes needed." },
      { q: "What photo format/size works best?", a: "We accept JPG, PNG and WEBP photos. For best results, use a clear, well-lit photo of at least 500x500 pixels. Blurry or low-resolution photos may affect print quality — we'll let you know if there's an issue." },
      { q: "Can I order in bulk for events or corporate gifting?", a: "Absolutely! We specialise in bulk and corporate orders. For 10+ pieces, WhatsApp us or fill out the corporate inquiry form on our Corporate Gifting page for special pricing and delivery timelines." },
    ],
  },
  {
    category: "Delivery & Shipping",
    icon: "🚚",
    items: [
      { q: "Do you offer same-day or 3-hour delivery?", a: "Yes! We offer 3-hour express delivery within Jaipur for eligible products. Look for the ⚡ tag on product pages. Orders placed before 6 PM are eligible. Pan India same-day dispatch is available for orders placed before 2 PM." },
      { q: "How long does delivery take?", a: "Within Jaipur: 3 hours (express) or same day. Pan India: 2-5 business days depending on your location. We'll send you tracking details once your order is dispatched." },
      { q: "Do you deliver across India?", a: "Yes, we ship to all major cities and towns across India via trusted courier partners (Delhivery, BlueDart, DTDC). For remote areas, delivery may take slightly longer." },
      { q: "How much does shipping cost?", a: "Shipping charges are calculated at checkout based on your location and order value. Orders above a certain amount qualify for free shipping — you'll see this at checkout." },
      { q: "Can I track my order?", a: "Yes! Visit our Track Order page and enter your order ID. You can also WhatsApp us at +91 76659 09909 with your order ID for a status update." },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: "↩️",
    items: [
      { q: "Can I return a personalised product?", a: "Since personalised products are made specifically for you, we don't accept returns unless there's a manufacturing defect or damage during delivery. If you received a wrong or defective item, we'll replace it for free." },
      { q: "What if my product arrives damaged?", a: "We're so sorry if that happens! WhatsApp us a photo of the damaged product within 48 hours of delivery. We'll arrange a free replacement or issue a full refund — your choice, no questions asked." },
      { q: "How long do refunds take?", a: "Once approved, refunds are processed within 5-7 business days to your original payment method. UPI/NetBanking refunds are usually faster (2-3 days)." },
      { q: "Can I cancel my order?", a: "You can cancel within 1 hour of placing your order. After that, production may have started. If you need to cancel urgently, WhatsApp us immediately — we'll do our best to help." },
    ],
  },
  {
    category: "Payment & Security",
    icon: "💳",
    items: [
      { q: "What payment methods do you accept?", a: "We accept all major payment methods — Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, Wallets, and Cash on Delivery (for eligible orders). All online payments are secured by Razorpay with 256-bit SSL encryption." },
      { q: "Is Cash on Delivery available?", a: "Yes, COD is available for orders up to a certain value within India. COD availability will be shown at checkout based on your pin code." },
      { q: "Is my payment information safe?", a: "Absolutely. We never store your card details on our servers. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway with bank-grade security." },
      { q: "Can I use a coupon code?", a: "Yes! Enter your coupon code at checkout. Some coupons are valid for specific products or categories. If your code isn't working, WhatsApp us — we'll sort it out." },
    ],
  },
  {
    category: "Products & Quality",
    icon: "✨",
    items: [
      { q: "What materials do you use?", a: "We use premium food-grade ceramic for mugs, solid MDF/wood for frames and lamps, polyester satin for cushions, and high-quality cotton for tees. Every material is tested for print durability and longevity." },
      { q: "How long will the print/engraving last?", a: "Our prints are done using sublimation (for mugs/cushions) and UV printing (for wooden items), which are extremely durable. With normal care, prints last for years without fading." },
      { q: "Are the product colours exactly as shown?", a: "We try our best to display accurate colours. However, slight variations may occur due to screen differences and monitor calibrations. The actual product colour is what you'll receive." },
      { q: "Do you offer gift wrapping?", a: "Yes! All our products come beautifully packaged. You can add premium gift wrapping at checkout for an extra special presentation. We also offer personalised gift cards with your message." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-[#e8e0d5] rounded-2xl overflow-hidden transition-all ${open ? "bg-white" : "bg-white hover:border-[#c0555a]/30"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[14px] font-semibold text-[#1a1a1a] leading-snug">{q}</span>
        <ChevronDown
          size={16}
          className={`text-[#c0555a] flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="h-px bg-[#f0ece6] mb-4" />
          <p className="text-[13px] text-[#555] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQsPage() {
  const [search,      setSearch]      = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const allCategories = ["All", ...FAQS.map(f => f.category)];

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat =>
    (activeCategory === "All" || cat.category === activeCategory) && cat.items.length > 0
  );

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* Hero */}
      <div className="bg-white border-b border-[#e8e0d5] py-14 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">Help centre</p>
        <h1
          className="text-[36px] md:text-[48px] font-normal text-[#1a1a1a] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Frequently asked questions
        </h1>
        <p className="text-[15px] text-[#888] mb-7 max-w-md mx-auto">
          Find quick answers to the most common questions about our products and service.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-10 pr-4 py-3.5 border border-[#e8e0d5] rounded-full text-[14px] outline-none focus:border-[#c0555a] transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12">

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold border transition-all ${
                activeCategory === cat
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ sections */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[16px] font-bold text-[#1a1a1a] mb-2">No results found</p>
            <p className="text-[13px] text-[#888] mb-5">Try a different search or browse all categories</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="text-[13px] text-[#c0555a] font-semibold hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {filtered.map(({ category, icon, items }) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[20px]">{icon}</span>
                  <h2 className="text-[16px] font-bold text-[#1a1a1a]">{category}</h2>
                  <span className="text-[12px] text-[#aaa] ml-1">({items.length})</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((item, i) => <FAQItem key={i} {...item} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-12 bg-[#25D366] rounded-2xl p-8 text-center text-white">
          <MessageCircle size={28} className="mx-auto mb-3" />
          <h2 className="text-[20px] font-bold mb-2">Still have questions?</h2>
          <p className="text-white/80 text-[14px] mb-5">
            Our team is available 9 AM – 9 PM, 7 days a week. We typically reply within 15 minutes on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/917665909909?text=Hi! I have a question about Hashtag Gifting."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#25D366] font-bold rounded-full hover:bg-[#f0fff0] transition-colors text-[13px]"
            >
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-colors text-[13px]"
            >
              Send us a message <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}