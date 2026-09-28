import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon:      LucideIcon;
  eyebrow:   string;
  title:     string;
  subtitle?: string;
  meta?:     string;
  children?: ReactNode;
}

// Shared hero band for the FAQ/legal pages -- a subtle radial glow and an
// icon badge instead of a flat wall of centered text, so the hero reads as
// designed rather than a placeholder. `children` is for page-specific
// content under the title (FAQ's search bar, mainly).
export default function PolicyHero({ icon: Icon, eyebrow, title, subtitle, meta, children }: Props) {
  return (
    <div className="relative overflow-hidden bg-white border-b border-[#e8e0d5]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(680px circle at 50% -10%, rgba(192,85,90,0.09), transparent 65%)" }}
      />
      <div className="relative py-12 md:py-16 text-center px-4">
        <div className="w-12 h-12 bg-[#c0555a]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon size={22} className="text-[#c0555a]" strokeWidth={1.75} />
        </div>
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">{eyebrow}</p>
        <h1
          className="text-[34px] md:text-[46px] font-normal text-[#1a1a1a] mb-3 leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-[15px] text-[#888] max-w-md mx-auto mb-1">{subtitle}</p>}
        {meta && <p className="text-[13px] text-[#aaa]">{meta}</p>}
        {children}
      </div>
    </div>
  );
}
