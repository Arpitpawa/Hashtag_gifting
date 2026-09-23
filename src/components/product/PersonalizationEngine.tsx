"use client";
import React from "react";

import { useEffect, useRef, useState } from "react";
import type { PersonalizationZone, PersonalizationValues } from "@/lib/personalization/types";
import { zoneToPx, scaleFontSize } from "@/lib/personalization/zoneUtils";

let Stage: any, Layer: any, KonvaImage: any, KonvaText: any, KonvaRect: any;
let konvaReady = false;

interface Props {
  templateUrl:  string;
  zones:        PersonalizationZone[];
  values:       PersonalizationValues;
  uploadedImgs: Record<string, HTMLImageElement>;
  hasZones:     boolean;
  onReady?:     (exportFn: () => string) => void;
  // Font used for the no-zones fallback text overlay, and (via `zones`
  // already carrying an overridden fontFamily) whatever the customer picked
  // in the font selector — passed through so the fallback path matches too.
  fallbackFontFamily?: string;
}

export default function PersonalizationEngine({
  templateUrl, zones, values, uploadedImgs, hasZones, onReady, fallbackFontFamily,
}: Props) {


  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef      = useRef<any>(null);
  const [stageW,      setStageW]      = useState(480);
  const [templateImg, setTemplateImg] = useState<HTMLImageElement | null>(null);
  const [imgError,    setImgError]    = useState(false);
  const [ready,       setReady]       = useState(false);
  const [, setFontTick]               = useState(0);

  // ── Load Konva ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (konvaReady) { setReady(true); return; }
    import("react-konva").then(rk => {
      Stage = rk.Stage; Layer = rk.Layer;
      KonvaImage = rk.Image; KonvaText = rk.Text; KonvaRect = rk.Rect;
      konvaReady = true;
      setReady(true);
      console.log("[PersonalizationEngine] Konva loaded");
    }).catch(err => console.error("[PersonalizationEngine] Konva failed to load:", err));
  }, []);

  // ── Responsive width ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0) setStageW(w);
    });
    ro.observe(el);
    const initial = Math.floor(el.getBoundingClientRect().width);
    if (initial > 0) setStageW(initial);
    return () => ro.disconnect();
  }, []);

  // ── Load template/product image ──────────────────────────────────────────
  useEffect(() => {
    if (!templateUrl) {
      console.warn("[PersonalizationEngine] No templateUrl provided!");
      setImgError(true);
      return;
    }
    setTemplateImg(null);
    setImgError(false);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setTemplateImg(img);
    img.onerror = (e) => {
      console.error("[PersonalizationEngine] Image FAILED to load:", templateUrl, e);
      setImgError(true);
    };
    img.src = templateUrl;
  }, [templateUrl]);

  // ── Force a redraw once custom personalisation fonts finish loading ──────
  // Konva's canvas text paints with whatever font is *already loaded* at the
  // moment it draws. Web fonts (Alex Brush, our Corsiva/Adila/Tumbler
  // lookalikes) can still be downloading on first paint, so without this the
  // preview would silently fall back to a system font until some unrelated
  // re-render happened to fire. document.fonts.load() resolves once the font
  // is ready; bumping state then forces Konva to redraw with the real font.
  useEffect(() => {
    if (typeof document === "undefined" || !(document as any).fonts) return;
    const families = new Set<string>();
    zones.forEach(z => { if (z.type === "text" && z.fontFamily) families.add(z.fontFamily); });
    if (fallbackFontFamily) families.add(fallbackFontFamily);
    if (families.size === 0) return;
    let cancelled = false;
    Promise.all(
      Array.from(families).map(f => (document as any).fonts.load(`16px "${f}"`).catch(() => {}))
    ).then(() => { if (!cancelled) setFontTick(t => t + 1); });
    return () => { cancelled = true; };
  }, [zones, fallbackFontFamily]);

  // Hand export function to parent exactly once, when Konva finishes loading.
  // Pass a live getter to the parent — intentionally NOT in a dependency array.
  // The function reads stageRef.current at call time (when user clicks Add to Cart),
  // not at mount time. This means the export always reflects the current canvas state
  // including the latest typed text, uploaded image, and loaded template.
  // onReadyCalledRef prevents re-calling onReady on every re-render.
  const onReadyCalledRef = useRef(false);
  useEffect(() => {
    if (ready && onReady && !onReadyCalledRef.current) {
      onReadyCalledRef.current = true;
      onReady(() => {
        if (!stageRef.current) return "";
        try {
          return stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
        } catch {
          return "";
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Reset so onReady fires again if the template changes (different product)
  useEffect(() => {
    onReadyCalledRef.current = false;
  }, [templateUrl]);

  const stageH = stageW;

  if (!ready) {
    return (
      <div ref={containerRef} className="w-full aspect-square rounded-2xl bg-[#e8e0d5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c0555a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (imgError) {
    return (
      <div ref={containerRef} className="w-full aspect-square rounded-2xl bg-[#fdecea] border-2 border-red-200 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-[13px] font-bold text-red-500">Preview image failed to load</p>
        <p className="text-[11px] text-red-400 break-all">{templateUrl || "(no URL provided)"}</p>
      </div>
    );
  }

  const firstTextZone  = zones.find(z => z.type === "text");
  const firstTextKey   = firstTextZone?.id || firstTextZone?.label || "";
  const firstTextValue = firstTextKey ? (values[firstTextKey] || "") : (Object.values(values).find(v => v) || "");

  return (
    <div ref={containerRef} className="w-full">
      <Stage ref={stageRef} width={stageW} height={stageH} style={{ borderRadius: "1rem", overflow: "hidden", display: "block" }}>
        <Layer>
          <KonvaRect x={0} y={0} width={stageW} height={stageH} fill="#e8e0d5" />

          {templateImg && (
            <KonvaImage image={templateImg} x={0} y={0} width={stageW} height={stageH} />
          )}

          {hasZones && zones.map((zone, index) => {
            const px = zoneToPx(zone, stageW, stageH);
            // Zones rotate around their own center, not the stage origin.
            // x/y below are the CENTER point; offsetX/offsetY re-anchor the
            // rotation pivot to that center instead of Konva's default
            // top-left corner.
            const rotation = zone.rotation || 0;
            const cx = px.x + px.width / 2;
            const cy = px.y + px.height / 2;

            if (zone.type === "image") {
              // Use same fallback as LivePreviewModal: id → label → "photo_upload"
              const imgKey = zone.id || zone.label || "photo_upload";
              const img = uploadedImgs[imgKey];
              if (img) return (
                <KonvaImage key={`zi-${imgKey}-${index}`} image={img}
                  x={cx} y={cy} width={px.width} height={px.height}
                  offsetX={px.width / 2} offsetY={px.height / 2} rotation={rotation} />
              );
              // Placeholder — show text only, no border
              return (
                <KonvaText key={`zp-${imgKey}-${index}`}
                  x={cx} y={cy} width={px.width} height={px.height}
                  offsetX={px.width / 2} offsetY={px.height / 2} rotation={rotation}
                  text={"Your photo here"} fontSize={Math.max(10, px.height * 0.22)}
                  fontFamily={zone.fontFamily || "Georgia"}
                  fill={zone.fontColor || "#C4922A"}
                  fontStyle="italic"
                  align="center" verticalAlign="middle" />
              );
            }

            if (zone.type === "text") {
              const zoneKey  = zone.id || zone.label || "";
              const typedVal = zoneKey ? values[zoneKey] : "";
              // Show typed value, or zone placeholder, or label as hint
              const text     = typedVal || zone.placeholder || zone.label || "Your text here";
              const isPlaceholder = !typedVal;
              const fontStyle = [zone.fontWeight === "bold" ? "bold" : "", zone.fontStyle === "italic" ? "italic" : ""].filter(Boolean).join(" ") || "normal";
              const fontFamily = zone.fontFamily || "Georgia";

              // Auto-shrink: start at base font size, reduce until text fits zone width.
              // This keeps the name on one line regardless of length.
              // (Measured against the zone's own width — unaffected by rotation.)
              let fontSize = scaleFontSize(zone.fontSize || 22, stageW);
              const tempCanvas = document.createElement("canvas");
              const ctx = tempCanvas.getContext("2d")!;
              const letterSp = zone.letterSpacing ?? 1;
              ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
              // Account for Konva letterSpacing (added between each character)
              const textWidth = () => ctx.measureText(text).width + (letterSp * text.length);
              while (fontSize > 8 && textWidth() > px.width - 2) {
                fontSize -= 1;
                ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
              }

              return (
                <KonvaText key={`zt-${zone.id}-${index}`}
                  x={cx} y={cy} width={px.width} height={px.height}
                  offsetX={px.width / 2} offsetY={px.height / 2} rotation={rotation}
                  text={text} fontSize={fontSize} fontFamily={fontFamily}
                  fill={isPlaceholder ? "rgba(255,255,255,0.55)" : (zone.fontColor || "#C4922A")}
                  fontStyle={isPlaceholder ? "italic" : fontStyle}
                  align={zone.align || "center"} verticalAlign="middle"
                  letterSpacing={zone.letterSpacing ?? 1} wrap="none" ellipsis={false} />
              );
            }
            return null;
          })}

          {!hasZones && firstTextValue && (
            <>
              <KonvaRect x={stageW * 0.1} y={stageH * 0.78} width={stageW * 0.8} height={stageH * 0.14}
                fill="rgba(255,255,255,0.82)" cornerRadius={stageW * 0.03} />
              <KonvaText key="fallback-text"
                x={stageW * 0.1} y={stageH * 0.78} width={stageW * 0.8} height={stageH * 0.14}
                text={firstTextValue} fontSize={scaleFontSize(28, stageW)} fontFamily={fallbackFontFamily || "Georgia"}
                fill="#1a1a1a" fontStyle="bold" align="center" verticalAlign="middle"
                letterSpacing={3} wrap="none" ellipsis={true} />
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
}