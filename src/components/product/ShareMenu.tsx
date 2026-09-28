"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Mail, Link2, Check } from "lucide-react";

// Same brand marks used in the footer's social links (src/components/layout/Footer.tsx)
// -- duplicated here rather than imported so this component has no dependency
// on that file; lucide-react is an icon set, not a brand-logo set, so these
// three need their own SVGs.
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface Props {
  title: string;
}

export default function ShareMenu({ title }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const getUrl = () => (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
    } catch {}
  };

  // Instagram has no public web share intent for an arbitrary external link
  // (unlike WhatsApp's wa.me or Facebook's sharer.php) -- there's no way to
  // hand it a pre-filled link the way the other options work. The honest,
  // standard workaround (what every site actually does for this) is copy
  // the link and send the person to Instagram to paste it into a Story or
  // DM themselves.
  const shareInstagram = async () => {
    await copyLink();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const options = [
    {
      label:   "WhatsApp",
      icon:    <WhatsAppIcon size={17} />,
      bg:      "#25D366",
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${getUrl()}`)}`, "_blank", "noopener,noreferrer"),
    },
    {
      label:   "Facebook",
      icon:    <FacebookIcon size={17} />,
      bg:      "#1877F2",
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`, "_blank", "noopener,noreferrer"),
    },
    {
      label:   "Instagram",
      icon:    <InstagramIcon size={17} />,
      bg:      "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)",
      onClick: shareInstagram,
    },
    {
      label:   "Email",
      icon:    <Mail size={17} />,
      bg:      "#6b6b6b",
      onClick: () => { window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(getUrl())}`; },
    },
    {
      label:   copied ? "Copied" : "Copy link",
      icon:    copied ? <Check size={17} /> : <Link2 size={17} />,
      bg:      "#1a1a1a",
      onClick: copyLink,
    },
  ];

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-[#c0555a] transition-colors"
      >
        <Share2 size={13} />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 bg-white rounded-full border border-[#e8e0d5] shadow-xl p-2 flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { if (opt.label !== "Copy link" && opt.label !== "Copied") { opt.onClick(); setOpen(false); } else { opt.onClick(); } }}
              title={opt.label}
              aria-label={`Share on ${opt.label}`}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
              style={{ background: opt.bg }}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
