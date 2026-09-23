"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface ThemedSelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: ThemedSelectOption[];
  placeholder?: string;
  /** "pill" = rounded-full (sort bars), "field" = rounded-xl full-width (forms) */
  variant?: "pill" | "field";
  align?: "left" | "right";
  className?: string;
  ariaLabel?: string;
}

export default function ThemedSelect({
  value, onChange, options, placeholder = "Select", variant = "pill",
  align = "right", className = "", ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const trigger =
    variant === "pill"
      ? "rounded-full px-4 py-2 text-[13px] border-[#e8e0d5]"
      : "rounded-xl px-4 py-3 text-[13px] w-full border-[#e8e0d5]";

  return (
    <div ref={ref} className={`relative ${variant === "field" ? "w-full" : "inline-block"} ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 border bg-white outline-none transition-colors hover:border-[#c0555a] focus:border-[#c0555a] ${open ? "border-[#c0555a]" : ""} ${trigger}`}
      >
        <span className={`truncate ${current ? "text-[#1a1a1a]" : "text-[#999]"}`}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown size={14} className={`flex-shrink-0 text-[#c0555a] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-50 mt-2 min-w-full w-max max-w-[85vw] max-h-72 overflow-y-auto rounded-2xl border border-[#e8e0d5] bg-white p-1.5 shadow-[0_12px_32px_rgba(26,26,26,0.14)] ${align === "right" ? "right-0" : "left-0"}`}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-6 rounded-xl px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                    active ? "bg-[#fdf3f3] text-[#c0555a] font-semibold" : "text-[#444] hover:bg-[#f7f2ea]"
                  }`}
                >
                  <span className="whitespace-nowrap">{o.label}</span>
                  {active && <Check size={14} className="flex-shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
