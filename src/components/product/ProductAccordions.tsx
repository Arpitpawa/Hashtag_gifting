"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Rocket, Package, RefreshCw } from "lucide-react";
import type { Product } from "@/types/product";

const SHIPPING_POLICY = `We offer FREE delivery on all orders above Rs. 999. Orders placed before 2 PM are dispatched same day. Standard delivery takes 4–7 business days. Expedited delivery (1–3 days) is available at checkout. We deliver across all major Indian cities and towns.`;

const MORE_INFO = `All our products are handcrafted with premium materials and quality-checked before dispatch. Personalized products are made-to-order and cannot be returned unless there is a manufacturing defect. For bulk or corporate orders, contact us on WhatsApp for custom pricing. We accept all major payment methods including UPI, cards, net banking, and COD.`;

const FAQS = [
  { q: "How long does customization take?",    a: "Personalized products are crafted within 24–48 hours of order placement. You'll receive a dispatch notification once it ships." },
  { q: "Can I see a proof before production?", a: "Our live canvas preview shows exactly how your product will look. Production starts immediately after order confirmation." },
  { q: "What if I'm not satisfied?",           a: "If there's a manufacturing defect or damage, contact us within 7 days of delivery for a free replacement or full refund. Personalised/customized products can't be returned or refunded for change of mind once production has started." },
  { q: "Do you offer bulk/corporate orders?",  a: "Yes! We specialize in bulk corporate gifting with volume discounts. WhatsApp us for a custom quote." },
];

// Default specs shown when product has no custom specs set
const DEFAULT_SPECS = [
  { label: "Production",   value: "24–48 hours"            },
  { label: "Packaging",    value: "Bubble wrap + sturdy box"},
  { label: "Warranty",     value: "7-day quality guarantee" },
  { label: "Delivery",     value: "Free above Rs. 999"     },
];

interface AccordionItem { id: string; label: string; content: React.ReactNode; }

function AccordionRow({ item, open, toggle }: { item: AccordionItem; open: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-[#e8e0d5] last:border-0">
      <button onClick={toggle} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[14px] font-semibold text-[#1a1a1a]">{item.label}</span>
        {open ? <ChevronUp size={16} className="text-[#c0555a] flex-shrink-0" />
               : <ChevronDown size={16} className="text-[#aaa] flex-shrink-0" />}
      </button>
      {open && (
        <div className="pb-4 -mt-1 animate-in fade-in duration-200">{item.content}</div>
      )}
    </div>
  );
}

interface Props { product: Product; }

export default function ProductAccordions({ product }: Props) {
  const [open, setOpen] = useState<string | null>("details");
  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id));

  // Use product's custom specs if set, otherwise show defaults
  const specs: { label: string; value: string }[] =
    (product as any).specifications?.length
      ? (product as any).specifications
      : DEFAULT_SPECS;

  const items: AccordionItem[] = [
    {
      id:    "details",
      label: "Product Details",
      content: (
        <div className="space-y-5">
          {product.detailsDescription || product.description ? (
            <div>
              <p className="text-[11px] font-bold text-[#c0555a] uppercase tracking-wide mb-1.5">Description</p>
              <p className="text-[13.5px] text-[#333] leading-relaxed whitespace-pre-line">
                {product.detailsDescription || product.description}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-[#aaa] italic">No description added for this product yet.</p>
          )}
          {specs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#c0555a] uppercase tracking-wide mb-1.5">Specifications</p>
              {/* Single column on the smallest phones — a 2-col grid left
                  only ~140px per cell, and a fixed 90px label plus value
                  text was crowding/wrapping badly. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex gap-2 p-2.5 bg-[#f3efe8] rounded-xl">
                    <span className="text-[11px] font-bold text-[#c0555a] w-[90px] flex-shrink-0">{spec.label}</span>
                    <span className="text-[11px] text-[#555]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id:    "shipping",
      label: "Shipping Policy",
      content: (
        <div className="space-y-3">
          <p className="text-[13px] text-[#555] leading-relaxed">{SHIPPING_POLICY}</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: Rocket,     label: "Same-day dispatch", sub: "Orders placed before 2 PM" },
              { icon: Package,    label: "Free delivery",     sub: "On orders above Rs. 999"   },
              { icon: RefreshCw,  label: "Easy returns",      sub: "7 days for non-personalized items" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#f3efe8] rounded-xl px-3 py-2">
                <item.icon size={18} className="text-[#c0555a] flex-shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-[#1a1a1a]">{item.label}</p>
                  <p className="text-[11px] text-[#888]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id:    "faq",
      label: "More Information",
      content: (
        <div className="space-y-3">
          <p className="text-[13px] text-[#555] leading-relaxed">{MORE_INFO}</p>
          <div className="space-y-2 mt-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#f3efe8] rounded-xl px-3 py-3">
                <p className="text-[12px] font-bold text-[#1a1a1a] mb-1">{faq.q}</p>
                <p className="text-[12px] text-[#555] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] px-5">
      {items.map((item) => (
        <AccordionRow key={item.id} item={item} open={open === item.id} toggle={() => toggle(item.id)} />
      ))}
    </div>
  );
}