"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  id:    string;
  label: string;
}

interface Props {
  sections: Section[];
}

// Sticky jump-to-section strip for the longer policy pages (terms, privacy,
// shipping, returns) -- same pill styling as the FAQ page's category filter,
// so it reads as one design system rather than a one-off. Highlights
// whichever section is currently in view via IntersectionObserver, and
// keeps that pill scrolled into view within the horizontal strip so it's
// always visible even on a narrow phone screen.
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
    <div className="sticky top-0 z-20 py-3 mb-8 bg-[#f3efe8]/95 backdrop-blur-sm border-b border-[#e8e0d5]">
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
  );
}
