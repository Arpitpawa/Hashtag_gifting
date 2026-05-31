"use client";

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, RotateCw, RotateCcw, ZoomIn, ZoomOut,
  Loader2, ShoppingBag, Trash2, Move, Check, ChevronLeft, ChevronRight,
} from "lucide-react";

interface CustomField {
  type: string; label: string; required?: boolean;
  maxLength?: number; placeholder?: string; options?: string[];
}

interface Props {
  open: boolean; onClose: () => void;
  onAddToCart: (customization: any) => void;
  productName: string; productPrice: number;
  productImages: string[];
  customFields: CustomField[];
  adding: boolean;
}

const fp = (p: number) => `Rs. ${(p / 100).toLocaleString("en-IN")}`;

export default function LivePreviewModal({
  open, onClose, onAddToCart, productName, productPrice,
  productImages, customFields, adding,
}: Props) {

  const imageFields = customFields.filter(f => f.type === "image");
  const textFields  = customFields.filter(f => f.type !== "image");

  // Customer photo state
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [photoScale,    setPhotoScale]    = useState(1);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [photoOffset,   setPhotoOffset]   = useState({ x: 0, y: 0 });
  const [uploading,     setUploading]     = useState(false);

  // Text fields
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Active product image for preview
  const [previewImg, setPreviewImg] = useState(0);

  // Drag
  const dragging  = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      setCustomerPhoto(ev.target?.result as string);
      setPhotoScale(1); setPhotoRotation(0); setPhotoOffset({ x: 0, y: 0 });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!customerPhoto) return;
    e.preventDefault();
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: photoOffset.x, oy: photoOffset.y };
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPhotoOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    });
  }, []);
  const onMouseUp = () => { dragging.current = false; };

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    if (!customerPhoto) return;
    const t = e.touches[0];
    dragging.current = true;
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: photoOffset.x, oy: photoOffset.y };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const t = e.touches[0];
    setPhotoOffset({
      x: dragStart.current.ox + (t.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (t.clientY - dragStart.current.my),
    });
  };

  const buildPayload = () => {
    const payload: Record<string, any> = { ...fieldValues };
    if (customerPhoto) payload["photo_upload"] = customerPhoto;
    return payload;
  };

  const canAdd = customFields.filter(f => f.required).every(f => {
    if (f.type === "image") return !!customerPhoto;
    return fieldValues[f.label]?.trim();
  });

  if (!open) return null;

  const hasPhoto    = imageFields.length > 0;
  const currentImg  = productImages[previewImg] || productImages[0];

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-2 md:p-6"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-[880px] max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] flex-shrink-0">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Personalise your gift ✨</h2>
            <p className="text-[12px] text-[#888] mt-0.5">{fp(productPrice)} · {productName}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f5f5f5] hover:bg-[#e8e8e8] flex items-center justify-center transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 min-h-0">

          {/* ── LEFT: CSS-based live preview ── */}
          <div className="p-5 bg-[#f8f5f0] border-b md:border-b-0 md:border-r border-[#ede8e0] flex flex-col">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest mb-3 text-center">
              Live preview
            </p>

            {/* Preview box */}
            <div ref={containerRef}
              className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#e8e0d5] select-none"
              onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchMove={onTouchMove} onTouchEnd={onMouseUp}>

              {/* Customer photo layer — BELOW product image */}
              {customerPhoto && (
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{ zIndex: 1 }}
                  onMouseDown={onMouseDown}
                  onTouchStart={onTouchStart}>
                  <img
                    src={customerPhoto}
                    alt="Your photo"
                    draggable={false}
                    style={{
                      transform: `translate(${photoOffset.x}px, ${photoOffset.y}px) scale(${photoScale}) rotate(${photoRotation}deg)`,
                      transition: dragging.current ? "none" : "transform 0.1s",
                      maxWidth: "none",
                      width: "90%",
                      height: "90%",
                      objectFit: "cover",
                      cursor: "grab",
                      userSelect: "none",
                    }}
                  />
                </div>
              )}

              {/* Product image layer — ON TOP with mix-blend-mode for transparency */}
              {currentImg && (
                <div className="absolute inset-0" style={{ zIndex: 2, pointerEvents: "none" }}>
                  <img
                    src={currentImg}
                    alt={productName}
                    draggable={false}
                    className="w-full h-full object-contain"
                    style={{ mixBlendMode: customerPhoto ? "multiply" : "normal" }}
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              {/* Placeholder when no photo */}
              {!customerPhoto && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  style={{ zIndex: 3 }}>
                  <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center">
                    <Upload size={22} className="text-[#c0555a]" />
                  </div>
                  <p className="text-[12px] text-[#888] font-medium text-center px-4">
                    Upload your photo to see it on the product
                  </p>
                </div>
              )}

              {/* Text overlay on preview */}
              {fieldValues[textFields[0]?.label] && (
                <div className="absolute bottom-6 left-0 right-0 text-center" style={{ zIndex: 4 }}>
                  <p className="text-[#1a1a1a] font-bold text-[18px] drop-shadow-sm px-4">
                    {fieldValues[textFields[0].label]}
                  </p>
                </div>
              )}
            </div>

            {/* Photo controls */}
            {customerPhoto && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button onClick={() => setPhotoRotation(r => r - 90)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e8e0d5] rounded-full text-[12px] hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                    <RotateCcw size={12} /> Rotate
                  </button>
                  <button onClick={() => setPhotoRotation(r => r + 90)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e8e0d5] rounded-full text-[12px] hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                    <RotateCw size={12} /> Rotate
                  </button>
                  <button onClick={() => setPhotoScale(s => Math.min(s + 0.15, 3))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e8e0d5] rounded-full text-[12px] hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                    <ZoomIn size={12} /> Zoom in
                  </button>
                  <button onClick={() => setPhotoScale(s => Math.max(s - 0.15, 0.3))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e8e0d5] rounded-full text-[12px] hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                    <ZoomOut size={12} /> Zoom out
                  </button>
                  <button onClick={() => { setCustomerPhoto(null); setPhotoScale(1); setPhotoRotation(0); setPhotoOffset({ x: 0, y: 0 }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-[12px] text-red-400 hover:bg-red-100 transition-all">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
                <p className="text-[10px] text-[#aaa] text-center flex items-center justify-center gap-1">
                  <Move size={10} /> Drag the photo to reposition it
                </p>
              </div>
            )}

            {/* Product image switcher (if multiple images) */}
            {productImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <button onClick={() => setPreviewImg(i => (i - 1 + productImages.length) % productImages.length)}
                  className="w-7 h-7 rounded-full bg-white border border-[#e8e0d5] flex items-center justify-center hover:border-[#c0555a] transition-all">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex gap-1.5">
                  {productImages.map((_, i) => (
                    <button key={i} onClick={() => setPreviewImg(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === previewImg ? "bg-[#c0555a] scale-125" : "bg-[#d4b8b0]"}`} />
                  ))}
                </div>
                <button onClick={() => setPreviewImg(i => (i + 1) % productImages.length)}
                  className="w-7 h-7 rounded-full bg-white border border-[#e8e0d5] flex items-center justify-center hover:border-[#c0555a] transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            <p className="text-center text-[10px] text-[#bbb] mt-3 leading-relaxed">
              Preview is for reference only. Final product crafted exactly as per your inputs.
            </p>
          </div>

          {/* ── RIGHT: Form fields ── */}
          <div className="p-6 flex flex-col gap-5 overflow-y-auto">

            {/* Photo upload */}
            {imageFields.map((field, i) => (
              <div key={i}>
                <label className="text-[13px] font-bold text-[#1a1a1a] block mb-2">
                  {field.label}
                  {field.required && <span className="text-[#c0555a] ml-1">*</span>}
                </label>
                {customerPhoto ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <img src={customerPhoto} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1.5">
                        <Check size={14} /> Photo uploaded!
                      </p>
                      <p className="text-[11px] text-green-600">Drag on the preview to reposition</p>
                    </div>
                    <button onClick={() => { setCustomerPhoto(null); setPhotoScale(1); setPhotoRotation(0); setPhotoOffset({ x: 0, y: 0 }); }}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center gap-3 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e0d5] hover:border-[#c0555a] hover:bg-[#c0555a]/5"}`}>
                    {uploading
                      ? <Loader2 size={28} className="animate-spin text-[#c0555a]" />
                      : <Upload size={28} className="text-[#c0555a]" />}
                    <div className="text-center">
                      <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">
                        {uploading ? "Processing photo..." : "Click to upload your photo"}
                      </p>
                      <p className="text-[11px] text-[#888]">JPG, PNG, WEBP · Max 8MB · Min 500×500px recommended</p>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  </label>
                )}
              </div>
            ))}

            {/* Text & textarea fields */}
            {textFields.map((field, i) => {
              const val = fieldValues[field.label] || "";
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-bold text-[#1a1a1a]">
                      {field.label}
                      {field.required && <span className="text-[#c0555a] ml-1">*</span>}
                    </label>
                    {field.maxLength && (
                      <span className="text-[11px] text-[#aaa]">{val.length}/{field.maxLength}</span>
                    )}
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

            {/* Add to cart */}
            <button onClick={() => onAddToCart(buildPayload())}
              disabled={adding || !canAdd}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all shadow-md mt-2">
              {adding
                ? <><Loader2 size={18} className="animate-spin" /> Adding...</>
                : <><ShoppingBag size={18} /> Add personalised gift to cart</>}
            </button>

            {!canAdd && (
              <p className="text-center text-[12px] text-[#c0555a] -mt-2">
                Please fill all required fields *
              </p>
            )}

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