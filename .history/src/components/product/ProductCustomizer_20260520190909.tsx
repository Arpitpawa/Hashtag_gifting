"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload, X, Loader2, CheckCircle,
  ShoppingBag, Sparkles, Eye, RefreshCw,
} from "lucide-react";
import CustomizationPreview from "./CustomizationPreview";
import { useCartStore } from "@/lib/store/cartStore";

interface CustomizationField {
  type: "text" | "textarea" | "image";
  label: string; maxLength?: number;
  required: boolean; placeholder?: string;
}
interface PreviewZone {
  id: string; type: "text" | "image"; fieldType: "text" | "textarea" | "image";
  x: number; y: number; width: number; height?: number;
  fontSize?: number; fontFamily?: string; color?: string;
  align?: "left" | "center" | "right"; maxLines?: number;
  shape?: "circle" | "rectangle"; border?: boolean;
  borderColor?: string; borderWidth?: number;
}
interface Props {
  productId: number; productName: string;
  customizationFields: CustomizationField[];
  previewTemplate: string; previewZones: PreviewZone[];
  stock: number;
}

// ── Popup preview ──────────────────────────────────────────────────────────
function PreviewPopup({
  customization, productName, hasCanvas, previewTemplate, previewZones,
  onClose, onChangePhoto,
}: {
  customization: Record<string, string>; productName: string;
  hasCanvas: boolean; previewTemplate: string; previewZones: PreviewZone[];
  onClose: () => void; onChangePhoto: () => void;
}) {
  const name     = customization.text || customization.name || "";
  const message  = customization.textarea || customization.message || "";
  const photoUrl = customization.photoUrl || "";

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5]">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[#c0555a]" />
            <p className="text-[14px] font-bold text-[#1a1a1a]">Your personalised preview</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3efe8] flex items-center justify-center hover:bg-[#e8e0d5] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Preview area */}
        <div className="p-5">
          {hasCanvas ? (
            <CustomizationPreview
              templateImage={previewTemplate} previewZones={previewZones}
              customization={customization} productName={productName}
            />
          ) : (
            <div className="relative aspect-square bg-gradient-to-br from-[#fdf9f5] to-[#f3efe8] rounded-2xl border border-[#e8e0d5] flex items-center justify-center overflow-hidden">
              {[["top-4","left-4"],["top-4","right-4"],["bottom-4","left-4"],["bottom-4","right-4"]].map(([t,l],i)=>(
                <div key={i} className={`absolute ${t} ${l} w-2 h-2 rounded-full bg-[#c0555a]/20`} />
              ))}
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                {photoUrl && (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <Image src={photoUrl} alt="Your photo" fill className="object-cover" sizes="128px" />
                  </div>
                )}
                {name && (
                  <p className="text-[26px] font-bold text-[#1a1a1a]"
                     style={{ fontFamily: "var(--font-heading, Georgia, serif)" }}>
                    {name}
                  </p>
                )}
                {message && (
                  <p className="text-[14px] text-[#666] italic max-w-[200px] leading-relaxed">
                    "{message}"
                  </p>
                )}
                {!photoUrl && !name && !message && (
                  <p className="text-[13px] text-[#aaa]">Nothing to preview yet</p>
                )}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-sm border-t border-[#e8e0d5] py-1.5 text-center">
                <p className="text-[10px] text-[#aaa]">Preview for reference only. Actual product may vary slightly.</p>
              </div>
            </div>
          )}
        </div>

        {/* Product name */}
        <p className="text-center text-[11px] text-[#aaa] -mt-2 mb-4 capitalize">{productName}</p>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onChangePhoto}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#e8e0d5] text-[#555] text-[13px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
            <RefreshCw size={13} /> Change photo
          </button>
          <button onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
            <CheckCircle size={13} /> Looks great!
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductCustomizer({
  productId, productName, customizationFields,
  previewTemplate, previewZones, stock,
}: Props) {
  const { addToCart, isLoading } = useCartStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [uploading,     setUploading]     = useState(false);
  const [uploadError,   setUploadError]   = useState("");
  const [adding,        setAdding]        = useState(false);
  const [added,         setAdded]         = useState(false);
  const [showPopup,     setShowPopup]     = useState(false);

  const hasCanvas    = !!(previewTemplate && previewZones?.length > 0);
  const isOutOfStock = stock <= 0;
  const hasContent   = !!(customization.photoUrl || customization.text || customization.name || customization.message || customization.textarea);

  const updateField = (type: string, value: string) => {
    setCustomization((p) => ({ ...p, [type]: value }));
    if (errors[type]) setErrors((p) => ({ ...p, [type]: "" }));
  };

  const handlePhotoUpload = useCallback(async (file: File) => {
    setUploading(true); setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "hashtag-gifting/customization");
      const res  = await fetch("/api/customization/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCustomization((p) => ({ ...p, photoUrl: data.url }));
      setShowPopup(true); // ← auto-open preview
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally { setUploading(false); }
  }, []);

  const handleAddToCart = async () => {
    const errs: Record<string, string> = {};
    for (const f of customizationFields)
      if (f.required && !customization[f.type]?.trim()) errs[f.type] = `${f.label} is required`;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setAdding(true);
    try {
      await addToCart(productId, 1, customization);
      setAdded(true); setTimeout(() => setAdded(false), 3000);
    } catch { setErrors({ general: "Failed to add to cart. Please try again." }); }
    finally { setAdding(false); }
  };

  const handleChangePhoto = () => {
    setShowPopup(false);
    setTimeout(() => fileInputRef.current?.click(), 150);
  };

  return (
    <>
      {showPopup && (
        <PreviewPopup
          customization={customization} productName={productName}
          hasCanvas={hasCanvas} previewTemplate={previewTemplate} previewZones={previewZones}
          onClose={() => setShowPopup(false)} onChangePhoto={handleChangePhoto}
        />
      )}

      <div className="bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden shadow-sm">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5] bg-[#fdfaf7]">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#c0555a]" />
            <div>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Personalize your gift</p>
              <p className="text-[11px] text-[#888]">Changes appear live in the preview as you type</p>
            </div>
          </div>
          {hasContent && (
            <button onClick={() => setShowPopup(true)}
              className="flex items-center gap-1.5 bg-[#c0555a]/10 text-[#c0555a] text-[12px] font-bold px-3 py-1.5 rounded-full hover:bg-[#c0555a]/20 transition-colors">
              <Eye size={12} /> Preview
            </button>
          )}
        </div>

        {/* ── MINI PREVIEW STRIP (shows after content entered) ── */}
        {hasContent && (
          <button
            onClick={() => setShowPopup(true)}
            className="w-full flex items-center gap-3 px-5 py-3 bg-[#f3efe8] border-b border-[#e8e0d5] hover:bg-[#ede8e0] transition-colors text-left"
          >
            {/* Tiny preview thumbnail */}
            <div className="w-10 h-10 rounded-xl bg-white border border-[#e8e0d5] flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
              {customization.photoUrl ? (
                <Image src={customization.photoUrl} alt="" fill className="object-cover" sizes="40px" />
              ) : (
                <Sparkles size={14} className="text-[#c0555a]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">
                {customization.text || customization.name
                  ? `"${customization.text || customization.name}"`
                  : "Your personalisation"}
              </p>
              <p className="text-[11px] text-[#c0555a]">Tap to see full preview →</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#c0555a] flex items-center justify-center flex-shrink-0">
              <Eye size={13} className="text-white" />
            </div>
          </button>
        )}

        {/* ── FORM FIELDS (single column, full width) ── */}
        <div className="px-5 py-5 flex flex-col gap-5">

          {customizationFields.map((field, i) => (
            <div key={i} className="flex flex-col gap-1.5">

              {/* Label row */}
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-[#1a1a1a]">
                  {field.label}
                  {field.required && <span className="text-[#c0555a] ml-0.5">*</span>}
                </label>
                {field.maxLength && field.type !== "image" && (
                  <span className="text-[11px] text-[#bbb]">
                    {(customization[field.type] || "").length}/{field.maxLength}
                  </span>
                )}
              </div>

              {/* TEXT */}
              {field.type === "text" && (
                <>
                  <input
                    type="text"
                    value={customization[field.type] || ""}
                    onChange={(e) => updateField(field.type, e.target.value)}
                    placeholder={field.placeholder || `e.g. ${field.label}`}
                    maxLength={field.maxLength}
                    className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors bg-[#fdfaf7] ${
                      errors[field.type] ? "border-red-400" : "border-[#e8e0d5] focus:border-[#c0555a]"
                    }`}
                  />
                  {errors[field.type] && <p className="text-[11px] text-red-500">{errors[field.type]}</p>}
                </>
              )}

              {/* TEXTAREA */}
              {field.type === "textarea" && (
                <>
                  <textarea
                    value={customization[field.type] || ""}
                    onChange={(e) => updateField(field.type, e.target.value)}
                    placeholder={field.placeholder || `e.g. Happy Birthday!`}
                    maxLength={field.maxLength}
                    rows={3}
                    className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none resize-none transition-colors bg-[#fdfaf7] ${
                      errors[field.type] ? "border-red-400" : "border-[#e8e0d5] focus:border-[#c0555a]"
                    }`}
                  />
                  {errors[field.type] && <p className="text-[11px] text-red-500">{errors[field.type]}</p>}
                </>
              )}

              {/* IMAGE */}
              {field.type === "image" && (
                <>
                  {customization.photoUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-[#f3efe8] rounded-xl border border-[#c0555a]/20">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#e8e0d5]">
                        <Image src={customization.photoUrl} alt="Uploaded" fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1">
                          <CheckCircle size={13} /> Photo uploaded!
                        </p>
                        <button onClick={() => setShowPopup(true)}
                          className="text-[11px] text-[#c0555a] font-medium flex items-center gap-1 mt-0.5 hover:underline">
                          <Eye size={11} /> View preview
                        </button>
                      </div>
                      <button
                        onClick={() => setCustomization((p) => { const n = {...p}; delete n.photoUrl; return n; })}
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm flex-shrink-0"
                      >
                        <X size={13} className="text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center gap-2.5 py-7 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      uploading ? "pointer-events-none opacity-60" : "hover:border-[#c0555a] hover:bg-[#c0555a]/3"
                    } ${errors.photoUrl ? "border-red-400 bg-red-50" : "border-[#e8e0d5] bg-[#fdfaf7]"}`}>
                      <input
                        ref={fileInputRef}
                        type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
                      />
                      {uploading ? (
                        <>
                          <Loader2 size={26} className="text-[#c0555a] animate-spin" />
                          <div className="text-center">
                            <p className="text-[13px] text-[#c0555a] font-semibold">Uploading...</p>
                            <p className="text-[11px] text-[#aaa] mt-0.5">Preview will open automatically</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-[#c0555a]/10 flex items-center justify-center">
                            <Upload size={22} className="text-[#c0555a]" />
                          </div>
                          <div className="text-center">
                            <p className="text-[14px] font-semibold text-[#1a1a1a]">Click to upload photo</p>
                            <p className="text-[12px] text-[#aaa] mt-1">JPG, PNG, WEBP up to 8MB</p>
                            <p className="text-[11px] text-[#c0555a] font-medium mt-1">Best quality: minimum 500×500px</p>
                          </div>
                        </>
                      )}
                    </label>
                  )}
                  {uploadError && <p className="text-[11px] text-red-500">{uploadError}</p>}
                  {errors.photoUrl && !uploadError && <p className="text-[11px] text-red-500">{errors.photoUrl}</p>}
                </>
              )}
            </div>
          ))}

          {errors.general && (
            <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-200">{errors.general}</p>
          )}

          {/* ── ADD TO CART ── */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding || isLoading || uploading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold transition-all duration-300 shadow-sm active:scale-[0.98] ${
              isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added       ? "bg-green-500 text-white"
              : "bg-[#c0555a] text-white hover:bg-[#a84449]"
            }`}
          >
            {adding        ? <><Loader2     size={17} className="animate-spin" /> Adding...</>
            : added        ? <><CheckCircle size={17} /> Added to cart!</>
            : isOutOfStock ? "Out of stock"
            : <><ShoppingBag size={17} /> Add personalized gift to cart</>}
          </button>

          {/* Reassurance */}
          <div className="grid grid-cols-2 gap-1.5">
            {["✓ Preview matches final product","✓ Premium quality print","✓ Photo kept private & secure","✓ Crafted within 24–48 hours"]
              .map((t, i) => <p key={i} className="text-[11px] text-[#888]">{t}</p>)}
          </div>
        </div>
      </div>
    </>
  );
}