"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Upload, RotateCw, RotateCcw, ZoomIn, ZoomOut, Loader2, ShoppingBag, Trash2, Move, Check } from "lucide-react";

interface PreviewZone {
  id: string; type: "image" | "text";
  x: number; y: number; width: number; height: number;
  fontSize?: number; color?: string; align?: string; label?: string;
}
interface CustomField {
  type: string; label: string; required?: boolean;
  maxLength?: number; placeholder?: string; options?: string[];
}
interface Props {
  open: boolean; onClose: () => void;
  onAddToCart: (customization: any) => void;
  productName: string; productPrice: number;
  previewTemplate: string;
  previewZones: PreviewZone[];
  customFields: CustomField[];
  adding: boolean;
}

const CANVAS = 500;
const fp = (p: number) => `Rs. ${(p / 100).toLocaleString("en-IN")}`;

export default function LivePreviewModal({ open, onClose, onAddToCart, productName, productPrice, previewTemplate, previewZones, customFields, adding }: Props) {

  // Split fields first — before any other logic
  const imageFields = customFields.filter(f => f.type === "image");
  const textFields  = customFields.filter(f => f.type !== "image");

  // Show canvas whenever a template image exists
  const hasCanvas = !!previewTemplate;

  // Use defined zones OR auto-create a centered photo zone
  const effectiveZones: PreviewZone[] = previewZones?.length > 0
    ? previewZones
    : imageFields.length > 0
      ? [{ id: "photo", type: "image", x: 75, y: 75, width: 350, height: 350, label: "Your photo here" }]
      : [];

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const dragging   = useRef(false);
  const dragStart  = useRef({ mx: 0, my: 0, ix: 0, iy: 0 });

  const [fieldValues,  setFieldValues]  = useState<Record<string, string>>({});
  const [uploadedImgs, setUploadedImgs] = useState<Record<string, { src: string; x: number; y: number; scale: number; rotation: number }>>({});
  const [activeZone,   setActiveZone]   = useState<string | null>(null);
  const [uploading,    setUploading]    = useState<string | null>(null);

  const drawCanvas = useCallback(() => {
    if (!hasCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS, CANVAS);
    const bg = new window.Image();
    bg.crossOrigin = "anonymous";
    // Use cors proxy for external images that block canvas
    const templateSrc = previewTemplate.startsWith("https://res.cloudinary.com")
      ? previewTemplate
      : `https://images.weserv.nl/?url=${encodeURIComponent(previewTemplate)}&w=500&h=500&fit=cover`;
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, CANVAS, CANVAS);
      effectiveZones.forEach(zone => {
        if (zone.type === "image") {
          const state = uploadedImgs[zone.id];
          if (state?.src) {
            const img = new window.Image();
            img.onload = () => {
              ctx.save();
              ctx.beginPath(); ctx.rect(zone.x, zone.y, zone.width, zone.height); ctx.clip();
              const cx = zone.x + zone.width / 2 + state.x;
              const cy = zone.y + zone.height / 2 + state.y;
              ctx.translate(cx, cy);
              ctx.rotate((state.rotation * Math.PI) / 180);
              ctx.scale(state.scale, state.scale);
              const asp = img.width / img.height;
              let dw = zone.width, dh = zone.height;
              if (asp > 1) dh = dw / asp; else dw = dh * asp;
              ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
              ctx.restore();
            };
            img.src = state.src;
          } else {
            ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            ctx.strokeStyle = "rgba(192,85,90,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]);
            ctx.strokeRect(zone.x, zone.y, zone.width, zone.height); ctx.setLineDash([]);
            ctx.fillStyle = "#c0555a"; ctx.font = "13px Arial"; ctx.textAlign = "center";
            ctx.fillText(zone.label || "Your photo here", zone.x + zone.width / 2, zone.y + zone.height / 2);
          }
        }
        if (zone.type === "text") {
          const text = fieldValues[zone.id] || fieldValues[zone.label || ""];
          if (text) {
            ctx.fillStyle = zone.color || "#1a1a1a";
            ctx.font = `bold ${zone.fontSize || 20}px Arial`;
            ctx.textAlign = (zone.align as any) || "center";
            ctx.fillText(text, zone.x + zone.width / 2, zone.y + zone.height / 2 + 8);
          }
        }
      });
    };
    bg.onerror = () => { ctx.fillStyle = "#f3efe8"; ctx.fillRect(0, 0, CANVAS, CANVAS); };
    bg.src = templateSrc;
  }, [hasCanvas, previewTemplate, previewZones, uploadedImgs, fieldValues]);

  useEffect(() => { if (open && hasCanvas) drawCanvas(); }, [open, drawCanvas, hasCanvas]);

  const handleUpload = (zoneId: string, file: File) => {
    setUploading(zoneId);
    const reader = new FileReader();
    reader.onload = ev => {
      setUploadedImgs(p => ({ ...p, [zoneId]: { src: ev.target?.result as string, x: 0, y: 0, scale: 1, rotation: 0 } }));
      setActiveZone(zoneId);
      setUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const adjust = (zoneId: string, prop: "scale" | "rotation", delta: number) => {
    setUploadedImgs(p => ({ ...p, [zoneId]: { ...p[zoneId], [prop]: (p[zoneId]?.[prop] || (prop === "scale" ? 1 : 0)) + delta } }));
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const s = CANVAS / rect.width;
    return { x: (e.clientX - rect.left) * s, y: (e.clientY - rect.top) * s };
  };
  const onMD = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeZone) return;
    dragging.current = true;
    const pos = getPos(e); const state = uploadedImgs[activeZone];
    dragStart.current = { mx: pos.x, my: pos.y, ix: state?.x || 0, iy: state?.y || 0 };
  };
  const onMM = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current || !activeZone) return;
    const pos = getPos(e);
    setUploadedImgs(p => ({ ...p, [activeZone]: { ...p[activeZone], x: dragStart.current.ix + (pos.x - dragStart.current.mx), y: dragStart.current.iy + (pos.y - dragStart.current.my) } }));
  };
  const onMU = () => { dragging.current = false; };

  const buildPayload = () => {
    const payload: Record<string, any> = { ...fieldValues };
    Object.entries(uploadedImgs).forEach(([k, v]) => { payload[`photo_${k}`] = v.src; });
    return payload;
  };

  const canAdd = customFields.filter(f => f.required).every(f => {
    if (f.type === "image") return Object.values(uploadedImgs).some(v => v.src);
    return fieldValues[f.label]?.trim();
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/75 flex items-center justify-center p-3 md:p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[860px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] flex-shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#1a1a1a]">Personalise your gift</h2>
            <p className="text-[12px] text-[#888] mt-0.5">{fp(productPrice)} · {productName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f5f5] hover:bg-[#e8e8e8] flex items-center justify-center transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className={`flex-1 overflow-y-auto ${hasCanvas ? "grid grid-cols-1 md:grid-cols-2" : "flex flex-col max-w-lg mx-auto w-full p-6 gap-5"}`}>

          {/* LEFT — canvas (only when template + zones set) */}
          {hasCanvas && (
            <div className="p-5 border-b md:border-b-0 md:border-r border-[#f0f0f0] bg-[#fafafa] flex flex-col">
              <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest mb-3 text-center">Live preview</p>
              <canvas ref={canvasRef} width={CANVAS} height={CANVAS}
                className="w-full rounded-xl border border-[#e8e8e8] shadow-sm cursor-move"
                onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU} />
              {activeZone && uploadedImgs[activeZone]?.src && (
                <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
                  {([["←", "rotation", -90], ["→", "rotation", 90], ["+", "scale", 0.1], ["-", "scale", -0.1]] as const).map(([label, prop, delta], i) => (
                    <button key={i} onClick={() => adjust(activeZone, prop as any, delta)}
                      className="px-3 py-1.5 bg-white border border-[#e8e8e8] rounded-lg text-[12px] hover:border-[#c0555a] hover:text-[#c0555a] transition-all font-medium">
                      {label}
                    </button>
                  ))}
                  <button onClick={() => { setUploadedImgs(p => { const n = { ...p }; delete n[activeZone]; return n; }); setActiveZone(null); }}
                    className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-400 hover:bg-red-100 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              {activeZone && uploadedImgs[activeZone]?.src && (
                <p className="text-[10px] text-[#aaa] text-center mt-2 flex items-center justify-center gap-1">
                  <Move size={10} /> Drag on preview to reposition
                </p>
              )}
              <p className="text-center text-[10px] text-[#bbb] mt-3">Preview for reference only. Actual product may vary slightly.</p>
            </div>
          )}

          {/* RIGHT — form fields */}
          <div className={hasCanvas ? "p-6 flex flex-col gap-5" : "flex flex-col gap-5"}>

            {/* Image upload fields */}
            {imageFields.map((field, i) => {
              const zoneId = effectiveZones.find(z => z.type === "image")?.id || `img_${i}`;
              const uploaded = uploadedImgs[zoneId];
              return (
                <div key={i}>
                  <label className="text-[13px] font-bold text-[#1a1a1a] block mb-2">
                    {field.label} {field.required && <span className="text-[#c0555a]">*</span>}
                  </label>
                  {uploaded?.src ? (
                    <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-2xl">
                      <img src={uploaded.src} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1.5"><Check size={14} /> Photo uploaded!</p>
                        <p className="text-[11px] text-green-600">{hasCanvas ? "Use controls on left to adjust" : "Your photo is ready"}</p>
                      </div>
                      <button onClick={() => { setUploadedImgs(p => { const n = { ...p }; delete n[zoneId]; return n; }); }}
                        className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading === zoneId ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e0d5] hover:border-[#c0555a] hover:bg-[#c0555a]/5"}`}>
                      {uploading === zoneId ? <Loader2 size={24} className="animate-spin text-[#c0555a]" /> : <Upload size={24} className="text-[#c0555a]" />}
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">{uploading === zoneId ? "Processing..." : "Click to upload your photo"}</p>
                      <p className="text-[11px] text-[#888]">JPG, PNG, WEBP · Max 8MB</p>
                      <input ref={el => { fileInputs.current[zoneId] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) { setActiveZone(zoneId); handleUpload(zoneId, f); } }} />
                    </label>
                  )}
                </div>
              );
            })}

            {/* Text fields */}
            {textFields.map((field, i) => {
              const val = fieldValues[field.label] || "";
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-bold text-[#1a1a1a]">
                      {field.label} {field.required && <span className="text-[#c0555a]">*</span>}
                    </label>
                    {field.maxLength && <span className="text-[11px] text-[#aaa]">{val.length}/{field.maxLength}</span>}
                  </div>
                  {field.type === "textarea" ? (
                    <textarea rows={3} value={val}
                      onChange={e => setFieldValues(p => ({ ...p, [field.label]: e.target.value.slice(0, field.maxLength || 500) }))}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className="w-full border-2 border-[#e8e0d5] focus:border-[#c0555a] rounded-xl px-4 py-3 text-[14px] outline-none transition-colors resize-none" />
                  ) : (
                    <input type="text" value={val}
                      onChange={e => setFieldValues(p => ({ ...p, [field.label]: e.target.value.slice(0, field.maxLength || 100) }))}
                      placeholder={field.placeholder || "e.g. Rahul"}
                      className="w-full border-2 border-[#e8e0d5] focus:border-[#c0555a] rounded-xl px-4 py-3 text-[14px] outline-none transition-colors" />
                  )}
                </div>
              );
            })}

            {/* CTA */}
            <button onClick={() => onAddToCart(buildPayload())} disabled={adding || !canAdd}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all shadow-lg">
              {adding ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : <><ShoppingBag size={18} /> Add personalised gift to cart</>}
            </button>

            {!canAdd && <p className="text-center text-[12px] text-[#c0555a]">Please fill all required fields *</p>}

            <div className="flex items-center justify-center gap-3 text-[11px] text-[#aaa] flex-wrap">
              <span>✓ Preview matches final product</span>
              <span>✓ Photo kept private</span>
              <span>✓ Crafted in 24–48 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}