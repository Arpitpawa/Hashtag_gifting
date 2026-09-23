"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Upload, X, Loader2, CheckCircle,
  ShoppingBag, Sparkles, Link as LinkIcon,
} from "lucide-react";
import CustomizationPreview from "./CustomizationPreview";
import { useCartStore } from "@/lib/store/cartStore";

interface CustomizationField {
  type:         "text" | "textarea" | "image";
  label:        string;
  maxLength?:   number;
  required:     boolean;
  placeholder?: string;
}

interface PreviewZone {
  id:           string;
  type:         "text" | "image";
  fieldType:    "text" | "textarea" | "image";
  x: number; y: number; width: number; height?: number;
  fontSize?: number; fontFamily?: string; color?: string;
  align?: "left" | "center" | "right";
  maxLines?: number; shape?: "circle" | "rectangle";
  border?: boolean; borderColor?: string; borderWidth?: number;
}

interface Props {
  productId:           number;
  productName:         string;
  customizationFields: CustomizationField[];
  previewTemplate:     string;
  previewZones:        PreviewZone[];
  stock:               number;
}

// ── Simple card preview when no canvas template is set ──────────────────────
function SimpleCardPreview({ customization }: { customization: Record<string, string> }) {
  const name     = customization.text || customization.name || "";
  const message  = customization.textarea || customization.message || "";
  const photoUrl = customization.photoUrl || "";
  const hasContent = !!(name || message || photoUrl);

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-[#fdf9f5] to-[#f3efe8] rounded-2xl border border-[#e8e0d5] flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative corner dots */}
      <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#c0555a]/20" />
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#c0555a]/20" />
      <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-[#c0555a]/20" />
      <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#c0555a]/20" />

      {hasContent ? (
        <div className="flex flex-col items-center gap-3 p-8 text-center w-full">
          {photoUrl && (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <Image src={photoUrl} alt="Your photo" fill className="object-cover" sizes="96px" />
            </div>
          )}
          {name && (
            <p
              className="text-[22px] font-bold text-[#1a1a1a] leading-tight"
              style={{ fontFamily: "var(--font-heading, Georgia, serif)" }}
            >
              {name}
            </p>
          )}
          {message && (
            <p className="text-[13px] text-[#666] italic leading-relaxed max-w-[200px]">
              "{message}"
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#c0555a]/10 flex items-center justify-center">
            <Sparkles size={26} className="text-[#c0555a]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#444]">Live preview</p>
            <p className="text-[12px] text-[#aaa] mt-1 leading-relaxed">
              Fill in the fields below<br />to see your personalised gift
            </p>
          </div>
        </div>
      )}

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-[#e8e0d5] py-2 text-center">
        <p className="text-[10px] text-[#aaa]">Preview for reference only. Actual product may vary slightly.</p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ProductCustomizer({
  productId,
  productName,
  customizationFields,
  previewTemplate,
  previewZones,
  stock,
}: Props) {
  const { addToCart, isLoading } = useCartStore();

  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [uploading,     setUploading]     = useState(false);
  const [uploadError,   setUploadError]   = useState("");
  const [adding,        setAdding]        = useState(false);
  const [added,         setAdded]         = useState(false);

  const hasCanvas = !!(previewTemplate && previewZones?.length > 0);
  const isOutOfStock = stock <= 0;

  const updateField = (type: string, value: string) => {
    setCustomization((prev) => ({ ...prev, [type]: value }));
    if (errors[type]) setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  const handlePhotoUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file",   file);
      fd.append("folder", "hashtag-gifting/customization");
      const res  = await fetch("/api/customization/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCustomization((prev) => ({ ...prev, photoUrl: data.url }));
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleAddToCart = async () => {
    // Client-side required check
    const errs: Record<string, string> = {};
    for (const field of customizationFields) {
      if (field.required && !customization[field.type]?.trim()) {
        errs[field.type] = `${field.label} is required`;
      }
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setAdding(true);
    try {
      await addToCart(productId, 1, customization);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch {
      setErrors({ general: "Failed to add to cart. Please try again." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden shadow-sm">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e8e0d5] bg-[#fdfaf7]">
        <Sparkles size={16} className="text-[#c0555a]" />
        <div>
          <p className="text-[14px] font-bold text-[#1a1a1a]">Personalize your gift</p>
          <p className="text-[11px] text-[#888]">Changes appear live in the preview as you type</p>
        </div>
      </div>

      {/* ── BODY: 2-col on desktop ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#e8e0d5]">

        {/* LEFT — Preview */}
        <div className="p-5">
          <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-3">Live preview</p>
          {hasCanvas ? (
            <CustomizationPreview
              templateImage={previewTemplate}
              previewZones={previewZones}
              customization={customization}
              productName={productName}
            />
          ) : (
            <SimpleCardPreview customization={customization} />
          )}
        </div>

        {/* RIGHT — Form */}
        <div className="p-5 flex flex-col gap-5">

          {/* Fields */}
          {customizationFields.map((field, i) => (
            <div key={i} className="flex flex-col gap-1.5">

              {/* Label */}
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-[#1a1a1a]">
                  {field.label}
                  {field.required && <span className="text-[#c0555a] ml-0.5">*</span>}
                </label>
                {field.maxLength && field.type !== "image" && (
                  <span className="text-[11px] text-[#aaa]">
                    {(customization[field.type] || "").length}/{field.maxLength}
                  </span>
                )}
              </div>

              {/* TEXT */}
              {field.type === "text" && (
                <div>
                  <input
                    type="text"
                    value={customization[field.type] || ""}
                    onChange={(e) => updateField(field.type, e.target.value)}
                    placeholder={field.placeholder || `e.g. ${field.label}`}
                    maxLength={field.maxLength}
                    className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors bg-[#fdfaf7] ${
                      errors[field.type]
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#e8e0d5] focus:border-[#c0555a]"
                    }`}
                  />
                  {errors[field.type] && (
                    <p className="text-[11px] text-red-500 mt-1">{errors[field.type]}</p>
                  )}
                </div>
              )}

              {/* TEXTAREA */}
              {field.type === "textarea" && (
                <div>
                  <textarea
                    value={customization[field.type] || ""}
                    onChange={(e) => updateField(field.type, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    maxLength={field.maxLength}
                    rows={3}
                    className={`w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors resize-none bg-[#fdfaf7] ${
                      errors[field.type]
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#e8e0d5] focus:border-[#c0555a]"
                    }`}
                  />
                  {errors[field.type] && (
                    <p className="text-[11px] text-red-500 mt-1">{errors[field.type]}</p>
                  )}
                </div>
              )}

              {/* IMAGE UPLOAD */}
              {field.type === "image" && (
                <div>
                  {customization.photoUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-[#f3efe8] rounded-xl border border-[#c0555a]/20">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#e8e0d5]">
                        <Image src={customization.photoUrl} alt="Uploaded" fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1">
                          <CheckCircle size={13} /> Photo uploaded!
                        </p>
                        <p className="text-[11px] text-[#aaa] mt-0.5">Visible in the preview</p>
                      </div>
                      <button
                        onClick={() => setCustomization((p) => { const n = {...p}; delete n.photoUrl; return n; })}
                        className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm flex-shrink-0"
                      >
                        <X size={13} className="text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center gap-2.5 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      uploading ? "pointer-events-none opacity-60" : "hover:border-[#c0555a] hover:bg-[#c0555a]/3"
                    } ${errors.photoUrl ? "border-red-400 bg-red-50" : "border-[#e8e0d5] bg-[#fdfaf7]"}`}>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
                      {uploading ? (
                        <>
                          <Loader2 size={24} className="text-[#c0555a] animate-spin" />
                          <p className="text-[13px] text-[#c0555a] font-medium">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-full bg-[#c0555a]/10 flex items-center justify-center">
                            <Upload size={20} className="text-[#c0555a]" />
                          </div>
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">Click to upload photo</p>
                          <p className="text-[11px] text-[#aaa]">JPG, PNG, WEBP up to 8MB</p>
                          <p className="text-[11px] text-[#c0555a] font-medium">Best quality: minimum 500×500px</p>
                        </>
                      )}
                    </label>
                  )}
                  {uploadError && <p className="text-[11px] text-red-500 mt-1">{uploadError}</p>}
                  {errors.photoUrl && !uploadError && <p className="text-[11px] text-red-500 mt-1">{errors.photoUrl}</p>}
                </div>
              )}
            </div>
          ))}

          {/* General error */}
          {errors.general && (
            <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
              {errors.general}
            </p>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding || isLoading || uploading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold transition-all duration-300 shadow-sm active:scale-[0.98] mt-auto ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : added
                ? "bg-green-500 text-white"
                : "bg-[#c0555a] text-white hover:bg-[#a84449]"
            }`}
          >
            {adding   ? <><Loader2 size={17} className="animate-spin" /> Adding...</>
            : added   ? <><CheckCircle size={17} /> Added to cart!</>
            : isOutOfStock ? "Out of stock"
            : <><ShoppingBag size={17} /> Add personalized gift to cart</>}
          </button>

          {/* Reassurance */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              "✓ Preview matches final product",
              "✓ Premium quality print",
              "✓ Photo kept private & secure",
              "✓ Crafted within 24–48 hours",
            ].map((t, i) => (
              <p key={i} className="text-[11px] text-[#888]">{t}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}