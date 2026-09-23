"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

/**
 * Drop-in, on-theme replacement for a native <select> in the admin panel.
 * Keeps the same JSX API (<option> children, value, onChange(e) with e.target.value,
 * disabled, className, title) so pages only need the tag renamed.
 * The menu is rendered in a portal with fixed positioning so it is never
 * clipped by cards that use overflow-hidden.
 */
type Opt = { value: string; label: string; disabled?: boolean };

function collect(children: React.ReactNode, out: Opt[] = []): Opt[] {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const el = child as React.ReactElement<any>;
    if (el.type === "option") {
      const label = React.Children.toArray(el.props.children).join("");
      out.push({ value: String(el.props.value ?? label), label, disabled: el.props.disabled });
    } else if (el.props?.children) {
      collect(el.props.children, out);
    }
  });
  return out;
}

interface Props {
  value: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

export default function AdminSelect({ value, onChange, disabled, className = "", title, children }: Props) {
  const options = collect(children);
  const current = options.find((o) => o.value === String(value));
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number; maxH: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const vh = window.innerHeight;
    const below = vh - r.bottom - 12;
    const above = r.top - 12;
    const width = Math.max(r.width, 180);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    if (below >= 200 || below >= above) {
      setPos({ left, top: r.bottom + 6, width, maxH: Math.min(320, below) });
    } else {
      setPos({ left, bottom: vh - r.top + 6, width, maxH: Math.min(320, above) });
    }
  };

  useLayoutEffect(() => { if (open) place(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onMove = (e: Event) => { if (!menuRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  // Sizing hints from the caller's classes apply to the wrapper; the rest style the trigger.
  const wrapCls = [
    /\bw-full\b/.test(className) ? "w-full" : "",
    /\bflex-1\b/.test(className) ? "flex-1" : "",
    /\bmin-w-\[[^\]]+\]/.test(className) ? (className.match(/\bmin-w-\[[^\]]+\]/) as RegExpMatchArray)[0] : "",
    /\bmax-w-\[[^\]]+\]/.test(className) ? (className.match(/\bmax-w-\[[^\]]+\]/) as RegExpMatchArray)[0] : "",
    /\bmr-auto\b/.test(className) ? "mr-auto" : "",
  ].filter(Boolean).join(" ");

  const triggerCls = className
    .replace(/\b(appearance-none|cursor-pointer|outline-none|disabled:opacity-\d+|disabled:cursor-\S+|pr-\d+|max-w-\[[^\]]+\]|mr-auto|sm:mr-0|flex-1)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className={`relative inline-block ${wrapCls}`}>
      <button
        ref={btnRef}
        type="button"
        title={title}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${triggerCls} w-full flex items-center justify-between gap-2 text-left pr-2.5 outline-none transition-colors hover:border-[#c0555a] ${
          open ? "!border-[#c0555a]" : ""
        } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
      >
        <span className="truncate">{current?.label ?? ""}</span>
        <ChevronDown size={13} className={`flex-shrink-0 text-[#c0555a] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.width, maxHeight: pos.maxH }}
            className="z-[1000] overflow-y-auto rounded-2xl border border-[#e8e0d5] bg-white p-1.5 shadow-[0_12px_32px_rgba(26,26,26,0.16)] max-w-[92vw]"
          >
            {options.map((o) => {
              const active = o.value === String(value);
              return (
                <li key={o.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    disabled={o.disabled}
                    onClick={() => { onChange?.({ target: { value: o.value } }); setOpen(false); }}
                    className={`w-full flex items-center justify-between gap-6 rounded-xl px-3.5 py-2.5 text-left text-[13px] transition-colors disabled:opacity-40 ${
                      active ? "bg-[#fdf3f3] text-[#c0555a] font-semibold" : "text-[#444] hover:bg-[#f7f2ea]"
                    }`}
                  >
                    <span className="whitespace-nowrap">{o.label}</span>
                    {active && <Check size={14} className="flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
}
