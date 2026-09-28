"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  id:    string;
  label: string;
}

interface Props {
  sections: Section[];
}

// Section nav for the longer policy pages (terms, privacy, shipping,
// returns) -- a horizontal sticky pill strip below the lg breakpoint (same
// pattern as the FAQ page's category filter), and a proper sticky sidebar
// table-of-contents at lg+ so desktop uses the extra width instead of
// leaving it empty next to a narrow centered content column. Both share one
// IntersectionObserver-driven "active" state; only one is visible at a time
// via Tailwind's responsive display classes, and together they behave as a
// single grid item when placed as the first column of a lg:grid layout.
export default function PolicySectionNav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const pillRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActive(topMost.target.id);
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    pillRefs.current[active]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  return (
    <div>
      {/* Mobile / tablet: sticky horizontal pill strip */}
      <div className="lg:hidden sticky top-0 z-20 py-3 mb-8 bg-[#f3efe8]/95 backdrop-blur-sm border-b border-[#e8e0d5]">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {sections.map((s) => (
            <a
              key={s.id}
              ref={(el) => { pillRefs.current[s.id] = el; }}
              href={`#${s.id}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold border whitespace-nowrap transition-all ${
                active === s.id
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a]"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Desktop: sticky vertical table of contents */}
      <nav className="hidden lg:block sticky top-8 self-start">
        <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest mb-3 px-3">On this page</p>
        <div className="flex flex-col gap-0.5">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`px-3 py-2 rounded-lg text-[13px] leading-snug border-l-2 transition-colors ${
                active === s.id
                  ? "border-[#c0555a] text-[#c0555a] bg-[#c0555a]/5 font-semibold"
                  : "border-transparent text-[#777] hover:text-[#1a1a1a] hover:bg-white font-medium"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
