"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Upload, X, Loader2, CheckCircle,
  ShoppingBag, Sparkles, Eye, RefreshCw,
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
  id: string; type: "text" | "image"; fieldType: "text" | "textarea" | "image";
  x: number; y: number; width: number; height?: number;
  fontSize?: number; fontFamily?: string; color?: string;
  align?: "left" | "center" | "right"; maxLines?: number;
  shape?: "circle" | "rectangle"; border?: boolean;
  borderColor?: string; borderWidth?: number;
}

interface Props {
  productId:           number;
  productName:         string;
  customizationFields: CustomizationField[];
  previewTemplate:     string;
  previewZones:        PreviewZone[];
  stock:               number;
}

// ─── Live preview card (used both inline + in the popup) ────────────────────
function PreviewCard({
  customization,
  productName,
  size = "normal",
}: {
  customization: Record<string, string>;
  productName:   string;
  size?:         "normal" | "large";
}) {
  const name     = customization.text || customization.name || "";
  const message  = customization.textarea || customization.message || "";
  const photoUrl = customization.photoUrl || "";
  const hasContent = !!(name || message || photoUrl);

  const photoSize  = size === "large" ? "w-36 h-36"  : "w-24 h-24";
  const nameSize   = size === "large" ? "text-[28px]" : "text-[22px]";
  const msgSize    = size === "large" ? "text-[15px]" : "text-[13px]";

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-[#fdf9f5] to-[#f3efe8] rounded-2xl border border-[#e8e0d5] flex flex-col items-center justify-center overflow-hidden">
      {/* Corner accents */}
      {["top-4 left-4","top-4 right-4","bottom-4 left-4","bottom-4 right-4"].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full bg-[#c0555a]/20`} />
      ))}

      {hasContent ? (
        <div className="flex flex-col items-center gap-3 p-8 text-center w-full">
          {photoUrl && (
            <div className={`relative ${photoSize} rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0`}>
              <Image src={photoUrl} alt="Your photo" fill className="object-cover" sizes="144px" />
            </div>
          )}
          {name && (
            <p className={`${nameSize} font-bold text-[#1a1a1a] leading-tight`}
               style={{ fontFamily: "var(--font-heading, Georgia, serif)" }}>
              {name}
            </p>
          )}
          {message && (
            <p className={`${msgSize} text-[#666] italic leading-relaxed max-w-[220px]`}>
              "{message}"
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#c0555a]/10 flex items-center justify-center">
            <Sparkles size={26} className="text-[#c0555a]" />
          </div>
          <p className="text-[14px] font-semibold text-[#444]">Live preview</p>
          <p className="text-[12px] text-[#aaa] leading-relaxed">
            Fill in the fields to see<br/>your personalised gift
          </p>
        </div>
      )}

      {/* Bottom note */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-[#e8e0d5] py-1.5 text-center">
        <p className="text-[10px] text-[#aaa]">Preview for reference only</p>
      </div>
    </div>
  );
}

// ─── Photo preview popup ─────────────────────────────────────────────────────
function PhotoPreviewPopup({
  customization,
  productName,
  onClose,
  onChangePhoto,
}: {
  customization:  Record<string, string>;
  productName:    string;
  onClose:        () => void;
  onChangePhoto:  () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5]">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-[#c0555a]" />
            <p className="text-[14px] font-bold text-[#1a1a1a]">Your personalised gift preview</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3efe8] flex items-center justify-center hover:bg-[#e8e0d5] transition-colors"
          >
            <X size={15} className="text-[#555]" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-5">
          <PreviewCard
            customization={customization}
            productName={productName}
            size="large"
          />
        </div>

        {/* Product name pill */}
        <div className="flex items-center justify-center -mt-2 mb-4">
          <span className="text-[11px] text-[#888] bg-[#f3efe8] border border-[#e8e0d5] px-3 py-1 rounded-full capitalize">
            {productName}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onChangePhoto}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#e8e0d5] text-[#555] text-[13px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all"
          >
            <RefreshCw size={14} />
            Change photo
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all"
          >
            <CheckCircle size={14} />
            Looks great!
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ProductCustomizer({
  productId,
  productName,
  customizationFields,
  previewTemplate,
  previewZones,
  stock,
}: Props) {
  const { addToCart, isLoading } = useCartStore();

  const [customization,   setCustomization]   = useState<Record<string, string>>({});
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [uploading,       setUploading]       = useState(false);
  const [uploadError,     setUploadError]     = useState("");
  const [adding,          setAdding]          = useState(false);
  const [added,           setAdded]           = useState(false);
  const [showPopup,       setShowPopup]       = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const hasCanvas    = !!(previewTemplate && previewZones?.length > 0);
  const isOutOfStock = stock <= 0;

  const updateField = (type: string, value: string) => {
    setCustomization((prev) => ({ ...prev, [type]: value }));
    if (errors[type]) setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  // ── Photo upload → auto-open preview popup ──
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
      // Auto-open preview popup after successful upload
      setShowPopup(true);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleRemovePhoto = () => {
    setCustomization((prev) => { const n = { ...prev }; delete n.photoUrl; return n; });
  };

  const handleAddToCart = async () => {
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

  // Hidden file input ref for "Change photo" button in popup
  const [fileInputEl, setFileInputEl] = useState<HTMLInputElement | null>(null);

  const handleChangePhoto = () => {
    setShowPopup(false);
    // Small delay so modal closes first, then trigger file picker
    setTimeout(() => fileInputEl?.click(), 150);
  };

  return (
    <>
      {/* ── Preview popup (auto-opens after photo upload) ── */}
      {showPopup && (
        <PhotoPreviewPopup
          customization={customization}
          productName={productName}
          onClose={() => setShowPopup(false)}
          onChangePhoto={handleChangePhoto}
        />
      )}

      <div className="bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden shadow-sm">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e0d5] bg-[#fdfaf7]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#c0555a]" />
            <div>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Personalize your gift</p>
              <p className="text-[11px] text-[#888]">Changes appear live in the preview as you type</p>
            </div>
          </div>
          {/* Manual preview trigger */}
          {(customization.photoUrl || customization.text || customization.name) && (
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center gap-1.5 text-[12px] text-[#c0555a] font-semibold hover:underline"
            >
              <Eye size={13} />
              Preview
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#e8e0d5]">

          {/* LEFT — Live preview panel */}
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
              <PreviewCard customization={customization} productName={productName} />
            )}
          </div>

          {/* RIGHT — Form */}
          <div className="p-5 flex flex-col gap-5">

            {customizationFields.map((field, i) => (
              <div key={i} className="flex flex-col gap-1.5">

                {/* Label + char count */}
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
                      /* ── Uploaded state ── */
                      <div className="flex items-center gap-3 p-3 bg-[#f3efe8] rounded-xl border border-[#c0555a]/20">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#e8e0d5]">
                          <Image src={customization.photoUrl} alt="Uploaded" fill className="object-cover" sizes="56px" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1">
                            <CheckCircle size={13} /> Photo uploaded!
                          </p>
                          <button
                            onClick={() => setShowPopup(true)}
                            className="text-[11px] text-[#c0555a] font-medium hover:underline mt-0.5 flex items-center gap-1"
                          >
                            <Eye size={11} /> View preview
                          </button>
                        </div>
                        <button
                          onClick={handleRemovePhoto}
                          className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm flex-shrink-0"
                        >
                          <X size={13} className="text-red-400" />
                        </button>
                      </div>
                    ) : (
                      /* ── Upload area ── */
                      <label className={`flex flex-col items-center gap-2.5 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploading ? "pointer-events-none opacity-60" : "hover:border-[#c0555a] hover:bg-[#c0555a]/3"
                      } ${errors.photoUrl ? "border-red-400 bg-red-50" : "border-[#e8e0d5] bg-[#fdfaf7]"}`}>
                        <input
                          ref={(el) => setFileInputEl(el)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
                        />
                        {uploading ? (
                          <>
                            <Loader2 size={24} className="text-[#c0555a] animate-spin" />
                            <p className="text-[13px] text-[#c0555a] font-medium">Uploading photo...</p>
                            <p className="text-[11px] text-[#aaa]">Preview will open once uploaded</p>
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
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-bold transition-all duration-300 shadow-sm active:scale-[0.98] ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : added
                  ? "bg-green-500 text-white"
                  : "bg-[#c0555a] text-white hover:bg-[#a84449]"
              }`}
            >
              {adding       ? <><Loader2    size={17} className="animate-spin" /> Adding...</>
              : added       ? <><CheckCircle size={17} /> Added to cart!</>
              : isOutOfStock ? "Out of stock"
              : <><ShoppingBag size={17} /> Add personalized gift to cart</>}
            </button>

            {/* Reassurance grid */}
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
    </>
  );
}