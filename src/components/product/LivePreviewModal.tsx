"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Cropper from "react-easy-crop";
import {
  X, Upload, Loader2, ShoppingBag, Trash2, Check,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Sparkles, Scissors,
} from "lucide-react";
import type { PersonalizationZone, PersonalizationValues } from "@/lib/personalization/types";
import { getEnabledFontOptions, resolveFontFamily, PERSONALISATION_FONT_PRELOAD_CLASS } from "@/lib/personalization/fonts";

// ── Dynamic import — Konva is client-only. ssr:false is required. ───────────
// NOTE: forwardRef does NOT pass through next/dynamic automatically.
// We work around this by NOT passing a ref to the dynamic wrapper directly —
// instead we pass a callback prop `onReady` that hands us the export function.
const PersonalizationEngine = dynamic(
  () => import("./PersonalizationEngine"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square rounded-2xl bg-[#e8e0d5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c0555a] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

interface CustomField {
  type: string; label: string; required?: boolean;
  maxLength?: number; placeholder?: string; options?: string[];
}

interface Props {
  open:         boolean;
  onClose:      () => void;
  onAddToCart:  (customization: any) => void | Promise<void>;
  productName:  string;
  productPrice: number;
  productImages: string[];
  customFields: CustomField[];
  adding:       boolean;
  previewZones?:    PersonalizationZone[] | null;
  previewTemplate?: string | null;
  availableFonts?:  string[] | null;
}

const fp = (p: number) => `Rs. ${(p / 100).toLocaleString("en-IN")}`;

async function getCroppedImg(src: string, area: any): Promise<string> {
  const img    = await createImageBitmap(await fetch(src).then(r => r.blob()));
  const canvas = document.createElement("canvas");
  canvas.width  = area.width;
  canvas.height = area.height;
  canvas.getContext("2d")!.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

// Both the cropped customer photo AND the rendered live-preview PNG used to
// get embedded directly into the cart/order `customization` JSON as base64
// data URLs (up to ~9MB each, per the deliberately-generous cap in
// sanitizeCustomizationValue). On a small Postgres plan a handful of
// personalised orders like that is enough to fill the whole database.
// Uploading to Cloudinary first — same endpoint CustomizationForm.tsx
// already uses — and storing just the resulting URL fixes that; a
// Cloudinary URL is a ~120-byte string next to a multi-megabyte blob.
async function uploadDataUrlToCloudinary(dataUrl: string, filename: string): Promise<string> {
  const blob = await fetch(dataUrl).then(r => r.blob());
  const fd   = new FormData();
  fd.append("file", blob, filename);
  const res  = await fetch("/api/customization/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export default function LivePreviewModal({
  open, onClose, onAddToCart,
  productName, productPrice, productImages,
  customFields, adding,
  previewZones, previewTemplate, availableFonts,
}: Props) {

  const imageFields = customFields.filter(f => f.type === "image");
  const textFields  = customFields.filter(f => f.type !== "image");

  // ── Font picker — only shown when the admin enabled more than just "Default" ──
  const enabledFontOptions = getEnabledFontOptions(availableFonts);
  const showFontPicker     = enabledFontOptions.length > 1 && textFields.length > 0;
  const [selectedFontId, setSelectedFontId] = useState(enabledFontOptions[0]?.id || "default");
  const selectedFontFamily = resolveFontFamily(selectedFontId);

  const [rawPhoto,     setRawPhoto]     = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);
  const [crop,         setCrop]         = useState({ x: 0, y: 0 });
  const [zoom,         setZoom]         = useState(1);
  const [croppedArea,  setCroppedArea]  = useState<any>(null);
  const [cropMode,     setCropMode]     = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [values,       setValues]       = useState<PersonalizationValues>({});
  const [uploadedImgs, setUploadedImgs] = useState<Record<string, HTMLImageElement>>({});
  const [previewImg,   setPreviewImg]   = useState(0);
  // Separate from `adding` (which the parent only flips true once this
  // component hands it a finished payload) — this covers the Cloudinary
  // upload step that now happens *before* that, so the button doesn't sit
  // there looking idle/double-clickable while a multi-MB image uploads.
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState("");

  // ── Workaround: dynamic() + forwardRef doesn't pass refs through.
  // We store the export function via a normal callback instead of a ref. ────
  const exportFnRef = useRef<(() => string) | null>(null);

  // Stable callback — created once, never changes identity across renders.
  // This is critical: PersonalizationEngine's effect depends on this prop,
  // and an inline arrow function here would create a new reference every
  // render, re-firing that effect every render → infinite loop.
  const handleEngineReady = useCallback((exportFn: () => string) => {
    exportFnRef.current = exportFn;
  }, []);

  const onCropComplete = useCallback((_: any, px: any) => setCroppedArea(px), []);

  const handleUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const src = ev.target?.result as string;
      setRawPhoto(src);
      setCroppedPhoto(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropMode(true);
      setUploading(false);
      // Preload raw photo into uploadedImgs immediately so preview shows
      // before user confirms crop. applyCrop() will update with cropped version.
      try {
        const imgEl  = await loadImage(src);
        const imgZone = previewZones?.find(z => z.type === "image");
        const zoneId  = imgZone?.id || imgZone?.label || "photo_upload";
        setUploadedImgs(p => ({ ...p, [zoneId]: imgEl }));
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = async () => {
    if (!rawPhoto || !croppedArea) return;
    try {
      const cropped = await getCroppedImg(rawPhoto, croppedArea);
      setCroppedPhoto(cropped);
      const imgEl = await loadImage(cropped);
      const imgZone = previewZones?.find(z => z.type === "image");
      const zoneId  = imgZone?.id || imgZone?.label || "photo_upload";
      setUploadedImgs(p => ({ ...p, [zoneId]: imgEl }));
    } catch {
      setCroppedPhoto(rawPhoto);
    }
    setCropMode(false);
  };

  const removePhoto = () => {
    setRawPhoto(null); setCroppedPhoto(null);
    setCropMode(false); setZoom(1); setCrop({ x: 0, y: 0 });
    setUploadedImgs({});
  };

  const updateValue = (key: string, val: string) => setValues(p => ({ ...p, [key]: val }));

  const textZones = previewZones?.filter(z => z.type === "text") || [];

  // Apply the customer's chosen font to every text zone for live preview —
  // undefined selectedFontFamily ("Default") leaves each zone's own font as-is.
  const renderZones = previewZones?.map(z =>
    z.type === "text" && selectedFontFamily ? { ...z, fontFamily: selectedFontFamily } : z
  ) || previewZones;
  const engineValues: PersonalizationValues = {};
  textFields.forEach((field, i) => {
    const zone   = textZones[i];
    // Use zone.id if present (new zones), fall back to zone.label, then field.label.
    // This handles zones saved before the id fix was applied.
    const zoneId = zone?.id || zone?.label || field.label;
    engineValues[zoneId] = values[field.label] || "";
  });

  const handleAddToCart = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload: Record<string, any> = { ...values };
      const photo = croppedPhoto || rawPhoto;

      // The customer's photo is often a required field — if this upload
      // fails, stop here rather than silently falling back to embedding
      // the raw base64 (which is exactly the storage-bloat bug this fixes).
      if (photo) {
        try {
          payload["photo_upload"] = await uploadDataUrlToCloudinary(photo, "customer-photo.jpg");
        } catch {
          setSubmitError("Couldn't upload your photo. Please try again.");
          return;
        }
      }

      if (showFontPicker) {
        const chosen = enabledFontOptions.find(f => f.id === selectedFontId);
        if (chosen) payload["personalisation_font"] = chosen.label;
      }

      // The rendered preview is a nice-to-have for order fulfillment, not
      // something the customer is blocked on — if it fails to upload, just
      // skip it instead of blocking checkout or falling back to base64.
      if (exportFnRef.current) {
        try {
          const previewDataUrl = exportFnRef.current();
          if (previewDataUrl) {
            payload["preview_png"] = await uploadDataUrlToCloudinary(previewDataUrl, "live-preview.png");
          }
        } catch {}
      }

      await onAddToCart(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const canAdd = customFields.filter(f => f.required).every(f => {
    if (f.type === "image") return !!(croppedPhoto || rawPhoto);
    return values[f.label]?.trim();
  });

  if (!open) return null;

  const displayPhoto = croppedPhoto || rawPhoto;
  const currentImg   = productImages[previewImg] || productImages[0];
  const hasZones      = !!(previewTemplate && previewZones && previewZones.length > 0);
  const engineTemplate = previewTemplate || currentImg || "";


  return (
    <div className={`fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-2 md:p-4 ${PERSONALISATION_FONT_PRELOAD_CLASS}`} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[900px] max-h-[95vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] flex-shrink-0">
          <div>
            <h2 className="flex items-center gap-1.5 text-[16px] font-bold text-[#1a1a1a]">Personalise your gift <Sparkles size={15} className="text-[#c0555a]" /></h2>
            <p className="text-[12px] text-[#888] mt-0.5">{fp(productPrice)} · {productName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f5f5f5] hover:bg-[#e8e8e8] flex items-center justify-center transition-colors" aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 min-h-0">

          {/* ── LEFT: Preview ── */}
          <div className="p-5 bg-[#f8f5f0] border-b md:border-b-0 md:border-r border-[#ede8e0] flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest text-center">
              {cropMode ? "Adjust your photo" : "Live preview"}
            </p>

            {cropMode && rawPhoto ? (
              <>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
                  <Cropper image={rawPhoto} crop={crop} zoom={zoom} aspect={1}
                    onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
                    style={{ containerStyle: { borderRadius: "1rem" } }} />
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut size={14} className="text-[#888] flex-shrink-0" />
                  <input type="range" min={1} max={3} step={0.01} value={zoom}
                    onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-[#c0555a]" />
                  <ZoomIn size={14} className="text-[#888] flex-shrink-0" />
                </div>
                <button onClick={applyCrop} className="w-full py-3 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-all flex items-center justify-center gap-1.5">
                  <Check size={15} /> Use this crop
                </button>
                <button onClick={removePhoto} className="w-full py-2.5 border border-[#e8e0d5] text-[#888] text-[13px] rounded-full hover:border-red-300 hover:text-red-400 transition-all">
                  Cancel & remove photo
                </button>
              </>
            ) : (
              <>
                <PersonalizationEngine
                  templateUrl={engineTemplate}
                  zones={renderZones || []}
                  values={engineValues}
                  uploadedImgs={uploadedImgs}
                  hasZones={hasZones}
                  onReady={handleEngineReady}
                  fallbackFontFamily={selectedFontFamily}
                />

                {!hasZones && productImages.length > 1 && (
                  <div className="flex items-center justify-center gap-3">
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

                {displayPhoto && hasZones && (
                  <button onClick={() => setCropMode(true)}
                    className="w-full py-2.5 border-2 border-[#e8e0d5] text-[#555] text-[13px] font-medium rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all flex items-center justify-center gap-2">
                    <Scissors size={13} /> Adjust / re-crop photo
                  </button>
                )}

                <p className="text-center text-[10px] text-[#bbb] leading-relaxed">
                  Preview for reference only. Final product crafted exactly as per your inputs.
                </p>
              </>
            )}
          </div>

          {/* ── RIGHT: Form ── */}
          <div className="p-6 flex flex-col gap-5 overflow-y-auto">

            {imageFields.map((field, i) => (
              <div key={i}>
                <label className="text-[13px] font-bold text-[#1a1a1a] block mb-2">
                  {field.label} {field.required && <span className="text-[#c0555a]">*</span>}
                </label>
                {displayPhoto ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={displayPhoto} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1.5">
                        <Check size={14} /> Photo ready!
                      </p>
                      <p className="text-[11px] text-green-600">Click "Adjust" on the left to re-crop</p>
                    </div>
                    <button onClick={removePhoto} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0" aria-label="Remove">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center gap-3 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e0d5] hover:border-[#c0555a] hover:bg-[#c0555a]/5"}`}>
                    {uploading ? <Loader2 size={28} className="animate-spin text-[#c0555a]" /> : <Upload size={28} className="text-[#c0555a]" />}
                    <div className="text-center">
                      <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">
                        {uploading ? "Processing..." : "Click to upload your photo"}
                      </p>
                      <p className="text-[11px] text-[#888]">JPG, PNG, WEBP · Max 8MB · Best: square photo</p>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  </label>
                )}
              </div>
            ))}

            {textFields.map((field, i) => {
              const val = values[field.label] || "";
              const fieldId = `personalize-field-${i}`;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor={fieldId} className="text-[13px] font-bold text-[#1a1a1a]">
                      {field.label} {field.required && <span className="text-[#c0555a]">*</span>}
                    </label>
                    {field.maxLength && <span className="text-[11px] text-[#aaa]">{val.length}/{field.maxLength}</span>}
                  </div>
                  {field.type === "textarea" ? (
                    <textarea id={fieldId} rows={3} value={val}
                      onChange={e => updateValue(field.label, e.target.value.slice(0, field.maxLength || 500))}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className="w-full border-2 border-[#e8e0d5] focus:border-[#c0555a] rounded-xl px-4 py-3 text-[14px] outline-none transition-colors resize-none" />
                  ) : (
                    <input id={fieldId} type="text" value={val}
                      onChange={e => updateValue(field.label, e.target.value.slice(0, field.maxLength || 100))}
                      placeholder={field.placeholder || "e.g. Rahul"}
                      className="w-full border-2 border-[#e8e0d5] focus:border-[#c0555a] rounded-xl px-4 py-3 text-[14px] outline-none transition-colors" />
                  )}
                </div>
              );
            })}

            {showFontPicker && (
              <div>
                <label className="text-[13px] font-bold text-[#1a1a1a] block mb-2">
                  Choose a font style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {enabledFontOptions.map(f => (
                    <button key={f.id} type="button" onClick={() => setSelectedFontId(f.id)}
                      className={`px-3 py-3 rounded-xl border-2 text-[16px] truncate transition-all ${
                        selectedFontId === f.id
                          ? "border-[#c0555a] bg-[#c0555a]/5 text-[#c0555a]"
                          : "border-[#e8e0d5] text-[#555] hover:border-[#c0555a]/40"
                      }`}
                      style={{ fontFamily: f.family || "Georgia" }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAddToCart} disabled={adding || submitting || !canAdd || cropMode}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all shadow-md mt-2" aria-label="Open cart">
              {submitting
                ? <><Loader2 size={18} className="animate-spin" /> Uploading your photo...</>
                : adding
                ? <><Loader2 size={18} className="animate-spin" /> Adding...</>
                : <><ShoppingBag size={18} /> Add personalised gift to cart</>}
            </button>

            {submitError && <p className="text-center text-[12px] text-red-500">{submitError}</p>}
            {cropMode && <p className="text-center text-[12px] text-[#c0555a]">Please confirm your crop first ↑</p>}
            {!canAdd && !cropMode && !submitError && <p className="text-center text-[12px] text-[#c0555a]">Please fill all required fields *</p>}

            <div className="flex items-center justify-center gap-3 text-[11px] text-[#aaa] flex-wrap">
              <span className="flex items-center gap-1"><Check size={11} /> Photo kept private & secure</span>
              <span className="flex items-center gap-1"><Check size={11} /> Crafted in 24–48 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}