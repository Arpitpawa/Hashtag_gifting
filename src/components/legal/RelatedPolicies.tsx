import Link from "next/link";
import { FileText, ShieldCheck, Truck, RotateCcw, HelpCircle, type LucideIcon } from "lucide-react";

interface PolicyLink {
  href:  string;
  label: string;
  icon:  LucideIcon;
}

const ALL_POLICIES: PolicyLink[] = [
  { href: "/faqs",            label: "FAQs",                   icon: HelpCircle },
  { href: "/shipping-policy", label: "Shipping Policy",        icon: Truck },
  { href: "/return-policy",   label: "Return & Refund Policy", icon: RotateCcw },
  { href: "/privacy-policy",  label: "Privacy Policy",         icon: ShieldCheck },
  { href: "/terms",           label: "Terms & Conditions",     icon: FileText },
];

// Cross-links between the policy/help pages so a visitor reading one of
// these doesn't have to go back to the footer to find another -- shown near
// the bottom of each page, alongside its own contact block.
export default function RelatedPolicies({ current }: { current: string }) {
  const others = ALL_POLICIES.filter((p) => p.href !== current);
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
      <h3 className="text-[12px] font-bold text-[#aaa] uppercase tracking-widest mb-4">Related</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {others.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 text-center px-3 py-4 rounded-xl border border-[#e8e0d5] hover:border-[#c0555a] hover:bg-[#c0555a]/5 transition-colors"
          >
            <Icon size={18} className="text-[#c0555a]" strokeWidth={1.5} />
            <span className="text-[12px] font-semibold text-[#1a1a1a] leading-snug">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
