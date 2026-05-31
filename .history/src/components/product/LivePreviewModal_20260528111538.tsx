"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X, Upload, RotateCw, RotateCcw, ZoomIn, ZoomOut,
  Check, Trash2, Move, Loader2, ShoppingBag,
} from "lucide-react";

interface PreviewZone {
  id:       string;
  type:     "image" | "text";
  x:        number;
  y:        number;
  width:    number;
  height:   number;
  fontSize?: number;
  color?:   string;
  align?:   "left" | "center" | "right";
  label?:   string;
}

interface Props {
  open:             boolean;
  onClose:          () => void;
  onAddToCart:      (customization: any) => void;
  productName:      string;
  productPrice:     number;
  previewTemplate:  string;        // Cloudinary URL of clean product photo
  previewZones:     PreviewZone[]; // Where to place photo/text
  customFields:     any[];         // From product.customizationFields
  adding:           boolean;
}

const CANVAS_SIZE = 500;

function formatPrice(p: number) { return `Rs. ${(p/100).toLocaleString("en-IN")}`; }

export default function LivePreviewModal({
  open, onClose, onAddToCart, productName, productPrice,
  previewTemplate, previewZones, customFields, adding,
}: Props) {

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Per-zone state
  const [zoneImages, setZoneImages] = useState<Record<string, {
    src: string; x: number; y: number; scale: number; rotation: number;
  }>>({});
  const [zoneTexts,  setZoneTexts]  = useState<Record<string, string>>({});
  const [activeZone, setActiveZone] = useState<string | null>(null);

  // Drag state
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, ix: 0, iy: 0 });

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    if (!ctx)    return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw template background
    if (previewTemplate) {
      const bg = new window.Image();
      bg.crossOrigin = "anonymous";
      bg.onload = () => {
        ctx.drawImage(bg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawZones(ctx);
      };
      bg.src = previewTemplate;
    } else {
      ctx.fillStyle = "#f3efe8";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawZones(ctx);
    }
  }, [previewTemplate, zoneImages, zoneTexts, previewZones]);

  function drawZones(ctx: CanvasRenderingContext2D) {
    previewZones.forEach(zone => {
      if (zone.type === "image") {
        const state = zoneImages[zone.id];
        if (state?.src) {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.save();
            // Clip to zone
            ctx.beginPath();
            ctx.rect(zone.x, zone.y, zone.width, zone.height);
            ctx.clip();
            // Apply transform
            const cx = zone.x + zone.width  / 2 + state.x;
            const cy = zone.y + zone.height / 2 + state.y;
            ctx.translate(cx, cy);
            ctx.rotate((state.rotation * Math.PI) / 180);
            ctx.scale(state.scale, state.scale);
            const aspect = img.width / img.height;
            let dw = zone.width, dh = zone.height;
            if (aspect > 1) dh = dw / aspect;
            else dw = dh * aspect;
            ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
            ctx.restore();
            // Active zone outline
            if (activeZone === zone.id) {
              ctx.strokeStyle = "#c0555a";
              ctx.lineWidth = 2;
              ctx.setLineDash([6, 3]);
              ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
              ctx.setLineDash([]);
            }
          };
          img.src = state.src;
        } else {
          // Placeholder
          ctx.fillStyle = "rgba(192,85,90,0.08)";
          ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
          ctx.strokeStyle = "#c0555a";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 3]);
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
          ctx.setLineDash([]);
          ctx.fillStyle = "#c0555a";
          ctx.font = "13px Arial";
          ctx.textAlign = "center";
          ctx.fillText(zone.label || "Your photo here", zone.x + zone.width/2, zone.y + zone.height/2);
        }
      }

      if (zone.type === "text") {
        const text = zoneTexts[zone.id];
        ctx.fillStyle = zone.color || "#1a1a1a";
        ctx.font = `${zone.fontSize || 18}px Arial`;
        ctx.textAlign = zone.align || "center";
        ctx.fillText(
          text || (zone.label || "Your text"),
          zone.x + zone.width / 2,
          zone.y + zone.height / 2
        );
      }
    });
  }

  useEffect(() => { if (open) draw(); }, [open, draw, zoneImages, zoneTexts]);

  // Upload photo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, zoneId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Read as data URL for immediate preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setZoneImages(prev => ({
        ...prev,
        [zoneId]: { src, x: 0, y: 0, scale: 1, rotation: 0 },
      }));
      setActiveZone(zoneId);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const adjustZone = (zoneId: string, prop: "scale" | "rotation" | "x" | "y", delta: number) => {
    setZoneImages(prev => {
      const z = prev[zoneId] || { src: "", x:0, y:0, scale:1, rotation:0 };
      return { ...prev, [zoneId]: { ...z, [prop]: z[prop] + delta } };
    });
  };

  const removeZoneImage = (zoneId: string) => {
    setZoneImages(prev => { const n = { ...prev }; delete n[zoneId]; return n; });
  };

  // Canvas mouse drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeZone) return;
    dragging.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    const state = zoneImages[activeZone];
    dragStart.current = {
      mx: (e.clientX - rect.left) * scale,
      my: (e.clientY - rect.top)  * scale,
      ix: state?.x || 0,
      iy: state?.y || 0,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current || !activeZone) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    const dx = ((e.clientX - rect.left) * scale) - dragStart.current.mx;
    const dy = ((e.clientY - rect.top)  * scale) - dragStart.current.my;
    setZoneImages(prev => ({
      ...prev,
      [activeZone]: { ...prev[activeZone], x: dragStart.current.ix + dx, y: dragStart.current.iy + dy },
    }));
  };

  const handleMouseUp = () => { dragging.current = false; };

  // Build customization payload for cart
  const buildCustomization = () => {
    const result: Record<string, any> = {};
    Object.entries(zoneTexts).forEach(([k, v]) => { result[k] = v; });
    Object.entries(zoneImages).forEach(([k, v]) => { result[`${k}_image`] = v.src; });
    return result;
  };

  // Validation
  const imageZones = previewZones.filter(z => z.type === "image");
  const textZones  = previewZones.filter(z => z.type === "text");
  const allFilled  = imageZones.every(z => zoneImages[z.id]?.src) &&
                     textZones.filter(z => customFields?.find((f: any) => f.id === z.id)?.required)
                               .every(z => zoneTexts[z.id]?.trim());

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Personalise your gift</h2>
            <p className="text-[12px] text-[#888]">Preview updates as you customise</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* LEFT — Canvas preview */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
            <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-3">Live preview</p>
            <div className="relative">
              <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE}
                className="w-full rounded-2xl border border-[#e8e8e8] cursor-move"
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              />
              {activeZone && zoneImages[activeZone]?.src && (
                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  <button onClick={() => adjustZone(activeZone, "rotation", -90)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f5] rounded-full text-[12px] hover:bg-[#e8e8e8] transition-colors">
                    <RotateCcw size={13} /> Rotate ←
                  </button>
                  <button onClick={() => adjustZone(activeZone, "rotation", 90)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f5] rounded-full text-[12px] hover:bg-[#e8e8e8] transition-colors">
                    <RotateCw size={13} /> Rotate →
                  </button>
                  <button onClick={() => adjustZone(activeZone, "scale", 0.1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f5] rounded-full text-[12px] hover:bg-[#e8e8e8] transition-colors">
                    <ZoomIn size={13} /> Zoom in
                  </button>
                  <button onClick={() => adjustZone(activeZone, "scale", -0.1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f5] rounded-full text-[12px] hover:bg-[#e8e8e8] transition-colors">
                    <ZoomOut size={13} /> Zoom out
                  </button>
                  <button onClick={() => removeZoneImage(activeZone)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-full text-[12px] hover:bg-red-100 transition-colors">
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              )}
              {activeZone && zoneImages[activeZone]?.src && (
                <p className="text-center text-[11px] text-[#aaa] mt-2 flex items-center justify-center gap-1">
                  <Move size={11} /> Drag on the preview to reposition your photo
                </p>
              )}
            </div>
            <div className="mt-3 bg-[#f3efe8] border border-[#e8e0d5] rounded-xl px-4 py-3">
              <p className="text-[11px] text-[#888] leading-relaxed">
                <strong className="text-[#1a1a1a]">Note:</strong> This preview is for placement reference only. The final product will be crafted exactly as per your input.
              </p>
            </div>
          </div>

          {/* RIGHT — Controls */}
          <div className="p-6 flex flex-col gap-5">
            <div>
              <p className="text-[13px] font-bold text-[#1a1a1a] mb-1 capitalize">{productName}</p>
              <p className="text-[18px] font-bold text-[#c0555a]">{formatPrice(productPrice)}</p>
            </div>

            {/* Image upload zones */}
            {imageZones.map(zone => (
              <div key={zone.id}>
                <label className="text-[12px] font-bold text-[#555] uppercase tracking-wider block mb-2">
                  {zone.label || "Upload your photo"} *
                </label>
                {zoneImages[zone.id]?.src ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={zoneImages[zone.id].src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1.5">
                        <Check size={14} /> Photo uploaded
                      </p>
                      <p className="text-[11px] text-green-600">Use controls above to adjust</p>
                    </div>
                    <button onClick={() => { removeZoneImage(zone.id); if (fileRef.current) fileRef.current.value = ""; }}
                      className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploading ? "border-[#c0555a]/50 bg-[#c0555a]/5" : "border-[#e8e0d5] hover:border-[#c0555a] hover:bg-[#c0555a]/5"
                  }`}>
                    {uploading ? <Loader2 size={22} className="animate-spin text-[#c0555a]" />
                      : <Upload size={22} className="text-[#c0555a]" />}
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">
                      {uploading ? "Processing..." : "Click to upload photo"}
                    </p>
                    <p className="text-[11px] text-[#888]">JPG, PNG, WEBP · Max 8MB · Min 500×500px</p>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                      className="hidden" onChange={e => { setActiveZone(zone.id); handleFileUpload(e, zone.id); }} />
                  </label>
                )}
              </div>
            ))}

            {/* Text zones */}
            {textZones.map(zone => (
              <div key={zone.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-[#555] uppercase tracking-wider">
                    {zone.label || "Enter text"} {customFields?.find((f: any) => f.id === zone.id)?.required && "*"}
                  </label>
                  {zone.fontSize && (
                    <span className="text-[11px] text-[#aaa]">
                      {(zoneTexts[zone.id] || "").length} / {customFields?.find((f: any) => f.id === zone.id)?.maxLength || 30}
                    </span>
                  )}
                </div>
                <input type="text"
                  value={zoneTexts[zone.id] || ""}
                  onChange={e => {
                    const max = customFields?.find((f: any) => f.id === zone.id)?.maxLength || 100;
                    setZoneTexts(prev => ({ ...prev, [zone.id]: e.target.value.slice(0, max) }));
                  }}
                  placeholder={`e.g. ${zone.label || "Your text"}`}
                  className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#c0555a] transition-colors"
                />
              </div>
            ))}

            {/* Extra fields from customFields that aren't in preview zones */}
            {customFields?.filter((f: any) => !previewZones.find(z => z.id === f.id) && f.type === "textarea").map((field: any, i: number) => (
              <div key={i}>
                <label className="text-[12px] font-bold text-[#555] uppercase tracking-wider block mb-1.5">
                  {field.label} {field.required && "*"}
                </label>
                <textarea rows={3}
                  value={zoneTexts[field.label] || ""}
                  onChange={e => setZoneTexts(prev => ({ ...prev, [field.label]: e.target.value }))}
                  placeholder={field.placeholder || "Write here..."}
                  className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#c0555a] transition-colors resize-none"
                />
              </div>
            ))}

            {/* Add to cart */}
            <button
              onClick={() => onAddToCart(buildCustomization())}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-60 transition-all mt-2">
              {adding
                ? <><Loader2 size={18} className="animate-spin" /> Adding to cart...</>
                : <><ShoppingBag size={18} /> Add personalised gift to cart</>}
            </button>

            <p className="text-center text-[11px] text-[#aaa]">
              ✓ Preview matches final product &nbsp;·&nbsp; ✓ Photo kept private &amp; secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}