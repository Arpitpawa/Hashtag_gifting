"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { PersonalizationZone } from "@/lib/personalization/types";
import { scaleFontSize } from "@/lib/personalization/zoneUtils";

// Admin's fixed canvas -- see zoneUtils.ts. Zone x/y/width/height are stored
// as raw px in this 500x500 space; percentages below are just that divided
// by 500, so they work at any rendered container size without needing a
// pixel measurement for positioning (only font-size needs one, since CSS
// has no "percentage of container width" unit for font-size).
const ADMIN_CANVAS = 500;

interface Props {
  previewTemplate: string | null;
  previewZones:    PersonalizationZone[] | null;
  productName:     string;
  onOpenPreview:   () => void;
}

export default function PersonalizationTeaser({
  previewTemplate, previewZones, productName, onOpenPreview,
}: Props) {
  const containerRef       = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const textZone = previewZones?.find((z) => z.type === "text");

  // Only worth showing once there's an actual template photo + a text zone
  // to put a preview word onto -- most products don't have this set up yet
  // (see the go-live checklist's "Personalisation live-preview zones"
  // section), so this quietly renders nothing for those rather than showing
  // a broken/empty preview.
  if (!previewTemplate || !textZone) return null;

  return (
    <button
      onClick={onOpenPreview}
      className="flex items-center gap-3 mt-3 p-2 pr-4 bg-white border border-[#e8e0d5] rounded-2xl hover:border-[#c0555a] transition-colors text-left w-full sm:w-auto"
    >
      <div
        ref={containerRef}
        className="relative w-[64px] h-[64px] rounded-xl overflow-hidden bg-[#f3efe8] flex-shrink-0"
      >
        <Image src={previewTemplate} alt={productName} fill className="object-cover" sizes="64px" />
        <div
          className="absolute flex items-center justify-center overflow-hidden pointer-events-none"
          style={{
            left:   `${(textZone.x      / ADMIN_CANVAS) * 100}%`,
            top:    `${(textZone.y      / ADMIN_CANVAS) * 100}%`,
            width:  `${(textZone.width  / ADMIN_CANVAS) * 100}%`,
            height: `${(textZone.height / ADMIN_CANVAS) * 100}%`,
            transform: textZone.rotation ? `rotate(${textZone.rotation}deg)` : undefined,
          }}
        >
          <span
            className="whitespace-nowrap"
            style={{
              fontSize:      containerW ? `${scaleFontSize(textZone.fontSize || 20, containerW)}px` : undefined,
              fontFamily:    textZone.fontFamily || "inherit",
              color:         textZone.fontColor  || "#1a1a1a",
              fontWeight:    textZone.fontWeight || "normal",
              fontStyle:     textZone.fontStyle  || "normal",
              letterSpacing: textZone.letterSpacing ? `${textZone.letterSpacing}px` : undefined,
            }}
          >
            {textZone.placeholder || "Your Name"}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#c0555a]">
          <Sparkles size={13} /> Live preview
        </p>
        <p className="text-[12px] text-[#888]">See your name on this — tap to customize</p>
      </div>
    </button>
  );
}
