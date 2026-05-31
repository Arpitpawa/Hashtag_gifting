"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle, ShoppingBag } from "lucide-react";
import CustomizationPreview from "./CustomizationPreview";
import { useCartStore } from "@/lib/store/cartStore";
import Image from "next/image";

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
  x:            number;
  y:            number;
  width:        number;
  height?:      number;
  fontSize?:    number;
  fontFamily?:  string;
  color?:       string;
  align?:       "left" | "center" | "right";
  maxLines?:    number;
  shape?:       "circle" | "rectangle";
  border?:      boolean;
  borderColor?: string;
  borderWidth?: number;
}

interface Props {
  productId:           number;
  productName:         string;
  customizationFields: CustomizationField[];
  previewTemplate:     string;
  previewZones:        PreviewZone[];
  price:               number;
  comparePrice?:       number;
  stock:               number;
}

export default function ProductCustomizer({
  productId,
  productName,
  customizationFields,
  previewTemplate,
  previewZones,
  price,
  comparePrice,
  stock,
}: Props) {
  const { addToCart, isLoading } = useCartStore();

  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [uploading,     setUploading]     = useState(false);
  const [uploadError,   setUploadError]   = useState("");
  const [adding,        setAdding]        = useState(false);
  const [added,         setAdded]         = useState(false);

  const updateField = (type: string, value: string) => {
    setCustomization((prev) => ({ ...prev, [type]: value }));
    if (errors[type]) setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  // ── PHOTO UPLOAD ──
  const handlePhotoUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file",   file);
      formData.append("folder", "hashtag-gifting/customization");

      const res  = await fetch("/api/customization/upload", {
        method: "POST",
        body:   formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setCustomization((prev) => ({ ...prev, photoUrl: data.url }));
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  // ── VALIDATE ──
  const validate = async (): Promise<boolean> => {
    const res  = await fetch("/api/customization/validate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ productId, customization }),
    });
    const data = await res.json();

    if (!data.valid) {
      setErrors(data.errors || {});
      return false;
    }
    return true;
  };

  // ── ADD TO CART ──
  const handleAddToCart = async () => {
    const valid = await validate();
    if (!valid) return;

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

  const isOutOfStock = stock <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ── LEFT — LIVE PREVIEW ── */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <CustomizationPreview
          templateImage={previewTemplate}
          previewZones={previewZones}
          customization={customization}
          productName={productName}
        />

        {/* PRICE */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold text-[#1a1a1a]">
            Rs. {(price / 100).toLocaleString("en-IN")}
          </span>
          {comparePrice && comparePrice > price && (
            <>
              <span className="text-[16px] text-gray-400 line-through">
                Rs. {(comparePrice / 100).toLocaleString("en-IN")}
              </span>
              <span className="text-[13px] font-semibold text-[#c0555a] bg-[#c0555a]/10 px-2 py-0.5 rounded-full">
                {Math.round(((comparePrice - price) / comparePrice) * 100)}% off
              </span>
            </>
          )}
        </div>

        {/* STOCK */}
        {stock <= 5 && stock > 0 && (
          <p className="text-[12px] text-orange-500 font-medium mt-1">
            Only {stock} left in stock!
          </p>
        )}
      </div>

      {/* ── RIGHT — CUSTOMIZATION FORM ── */}
      <div className="flex flex-col gap-6">

        <div>
          <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-1">
            Personalize your gift
          </h3>
          <p className="text-[13px] text-[#6b6b6b]">
            Changes appear live in the preview as you type
          </p>
        </div>

        {/* FIELDS */}
        {customizationFields.map((field, index) => (
          <div key={index} className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-[#1a1a1a] flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-[#c0555a]">*</span>}
            </label>

            {/* TEXT INPUT */}
            {field.type === "text" && (
              <div>
                <input
                  type="text"
                  value={customization[field.type] || ""}
                  onChange={(e) => updateField(field.type, e.target.value)}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  maxLength={field.maxLength}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-[14px] outline-none transition-colors ${
                    errors[field.type]
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#e8e0d5] focus:border-[#c0555a]"
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors[field.type] ? (
                    <p className="text-[12px] text-red-500">{errors[field.type]}</p>
                  ) : <span />}
                  {field.maxLength && (
                    <p className="text-[11px] text-[#aaa]">
                      {(customization[field.type] || "").length}/{field.maxLength}
                    </p>
                  )}
                </div>
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
                  className={`w-full border-2 rounded-xl px-4 py-3 text-[14px] outline-none transition-colors resize-none ${
                    errors[field.type]
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#e8e0d5] focus:border-[#c0555a]"
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors[field.type] ? (
                    <p className="text-[12px] text-red-500">{errors[field.type]}</p>
                  ) : <span />}
                  {field.maxLength && (
                    <p className="text-[11px] text-[#aaa]">
                      {(customization[field.type] || "").length}/{field.maxLength}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* IMAGE UPLOAD */}
            {field.type === "image" && (
              <div>
                {customization.photoUrl ? (
                  <div className="flex items-center gap-4 p-4 bg-[#f3efe8] rounded-xl border border-[#c0555a]/30">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={customization.photoUrl}
                        alt="Uploaded"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle size={14} className="text-green-500" />
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">
                          Photo uploaded
                        </p>
                      </div>
                      <p className="text-[12px] text-[#aaa]">
                        Visible in preview on the left
                      </p>
                    </div>
                    <button
                      onClick={() => setCustomization((p) => ({ ...p, photoUrl: undefined }))}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-[#c0555a] hover:bg-[#c0555a]/5 ${
                    uploading ? "pointer-events-none opacity-70" : ""
                  } ${errors.photoUrl ? "border-red-400" : "border-[#e8e0d5]"}`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                    {uploading ? (
                      <>
                        <Loader2 size={28} className="text-[#c0555a] animate-spin" />
                        <p className="text-[13px] text-[#c0555a] font-medium">
                          Uploading...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-[#c0555a]/10 rounded-full flex items-center justify-center">
                          <Upload size={22} className="text-[#c0555a]" />
                        </div>
                        <div className="text-center">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">
                            Click to upload photo
                          </p>
                          <p className="text-[12px] text-[#aaa] mt-1">
                            JPG, PNG, WEBP up to 8MB
                          </p>
                          <p className="text-[11px] text-[#c0555a] mt-1">
                            Best quality: minimum 500×500px
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                )}

                {uploadError && (
                  <p className="text-[12px] text-red-500 mt-1">{uploadError}</p>
                )}
                {errors.photoUrl && !uploadError && (
                  <p className="text-[12px] text-red-500 mt-1">{errors.photoUrl}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* GENERAL ERROR */}
        {errors.general && (
          <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">
            {errors.general}
          </p>
        )}

        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding || isLoading || uploading}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[15px] font-semibold transition-all duration-300 ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
              ? "bg-green-500 text-white"
              : "bg-[#c0555a] text-white hover:bg-[#a84449]"
          }`}
        >
          {adding ? (
            <><Loader2 size={18} className="animate-spin" /> Adding to cart...</>
          ) : added ? (
            <><CheckCircle size={18} /> Added to cart!</>
          ) : isOutOfStock ? (
            "Out of stock"
          ) : (
            <><ShoppingBag size={18} /> Add personalized gift to cart</>
          )}
        </button>

        {/* REASSURANCE */}
        <div className="flex flex-col gap-2 p-4 bg-[#f3efe8] rounded-xl">
          {[
            "✓ Preview shown is accurate to final product",
            "✓ High quality print on premium material",
            "✓ Your photo is private and secure",
            "✓ Production starts after order confirmed",
          ].map((text, i) => (
            <p key={i} className="text-[12px] text-[#6b6b6b]">{text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}