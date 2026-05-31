"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  X, Upload, Loader2, ShoppingBag, Trash2, Check,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
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

// Get cropped image as base64
async function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<string> {
  const image = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
  const canvas = document.createElement("canvas");
  canvas.width  = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image,
    croppedAreaPixels.x, croppedAreaPixels.y,
    croppedAreaPixels.width, croppedAreaPixels.height,
    0, 0, croppedAreaPixels.width, croppedAreaPixels.height
  );
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function LivePreviewModal({
  open, onClose, onAddToCart, productName, productPrice,
  productImages, customFields, adding,
}: Props) {

  const imageFields = customFields.filter(f => f.type === "image");
  const textFields  = customFields.filter(f => f.type !== "image");

  // Upload + crop state
  const [rawPhoto,       setRawPhoto]       = useState<string | null>(null);
  const [croppedPhoto,   setCroppedPhoto]   = useState<string | null>(null);
  const [crop,           setCrop]           = useState({ x: 0, y: 0 });
  const [zoom,           setZoom]           = useState(1);
  const [croppedArea,    setCroppedArea]    = useState<any>(null);
  const [cropMode,       setCropMode]       = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [fieldValues,    setFieldValues]    = useState<Record<string, string>>({});
  const [previewImg,     setPreviewImg]     = useState(0);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      setRawPhoto(ev.target?.result as string);
      setCroppedPhoto(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropMode(true);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = async () => {
    if (!rawPhoto || !croppedArea) return;
    try {
      const cropped = await getCroppedImg(rawPhoto, croppedArea);
      setCroppedPhoto(cropped);
      setCropMode(false);
    } catch {
      setCroppedPhoto(rawPhoto);
      setCropMode(false);
    }
  };

  const removePhoto = () => {
    setRawPhoto(null); setCroppedPhoto(null); setCropMode(false);
    setZoom(1); setCrop({ x: 0, y: 0 });
  };

  const buildPayload = () => {
    const payload: Record<string, any> = { ...fieldValues };
    if (croppedPhoto || rawPhoto) payload["photo_upload"] = croppedPhoto || rawPhoto;
    return payload;
  };

  const canAdd = customFields.filter(f => f.required).every(f => {
    if (f.type === "image") return !!(croppedPhoto || rawPhoto);
    return fieldValues[f.label]?.trim();
  });

  if (!open) return null;

  const displayPhoto = croppedPhoto || rawPhoto;
  const currentImg   = productImages[previewImg] || productImages[0];

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-2 md:p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[900px] max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
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

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 min-h-0">

          {/* LEFT — preview / cropper */}
          <div className="p-5 bg-[#f8f5f0] border-b md:border-b-0 md:border-r border-[#ede8e0] flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest text-center">
              {cropMode ? "Adjust your photo" : "Live preview"}
            </p>

            {/* Crop mode */}
            {cropMode && rawPhoto ? (
              <>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
                  <Cropper
                    image={rawPhoto}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{
                      containerStyle: { borderRadius: "1rem" },
                    }}
                  />
                </div>

                {/* Zoom slider */}
                <div className="flex items-center gap-3">
                  <ZoomOut size={14} className="text-[#888] flex-shrink-0" />
                  <input type="range" min={1} max={3} step={0.01}
                    value={zoom} onChange={e => setZoom(Number(e.target.value))}
                    className="flex-1 accent-[#c0555a]" />
                  <ZoomIn size={14} className="text-[#888] flex-shrink-0" />
                </div>

                <button onClick={applyCrop}
                  className="w-full py-3 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-all">
                  ✓ Use this crop
                </button>
                <button onClick={removePhoto}
                  className="w-full py-2.5 border border-[#e8e0d5] text-[#888] text-[13px] rounded-full hover:border-red-300 hover:text-red-400 transition-all">
                  Cancel & remove photo
                </button>
              </>
            ) : (
              <>
                {/* Preview mode */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#e8e0d5]">
                  {/* Customer photo behind */}
                  {displayPhoto && (
                    <img src={displayPhoto} alt="Your photo" draggable={false}
                      className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 1 }} />
                  )}

                  {/* Product image on top */}
                  {currentImg && (
                    <img src={currentImg} alt={productName} draggable={false}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      style={{
                        zIndex: 2,
                        mixBlendMode: displayPhoto ? "multiply" : "normal",
                      }} />
                  )}

                  {/* Placeholder */}
                  {!displayPhoto && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ zIndex: 3 }}>
                      <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center">
                        <Upload size={22} className="text-[#c0555a]" />
                      </div>
                      <p className="text-[12px] text-[#888] font-medium text-center px-6">
                        Upload your photo to see it on the product
                      </p>
                    </div>
                  )}

                  {/* Name text overlay */}
                  {fieldValues[textFields[0]?.label] && (
                    <div className="absolute bottom-6 left-0 right-0 text-center" style={{ zIndex: 4 }}>
                      <p className="text-[#1a1a1a] font-bold text-[20px] drop-shadow-sm">
                        {fieldValues[textFields[0].label]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Re-crop button */}
                {displayPhoto && (
                  <button onClick={() => setCropMode(true)}
                    className="w-full py-2.5 border-2 border-[#e8e0d5] text-[#555] text-[13px] font-medium rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all flex items-center justify-center gap-2">
                    ✂️ Adjust / re-crop photo
                  </button>
                )}

                {/* Product image switcher */}
                {productImages.length > 1 && (
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

                <p className="text-center text-[10px] text-[#bbb] leading-relaxed">
                  Preview for reference only. Final product crafted exactly as per your inputs.
                </p>
              </>
            )}
          </div>

          {/* RIGHT — form */}
          <div className="p-6 flex flex-col gap-5 overflow-y-auto">

            {/* Photo upload */}
            {imageFields.map((field, i) => (
              <div key={i}>
                <label className="text-[13px] font-bold text-[#1a1a1a] block mb-2">
                  {field.label} {field.required && <span className="text-[#c0555a]">*</span>}
                </label>
                {displayPhoto ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                    <img src={displayPhoto} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1.5">
                        <Check size={14} /> Photo ready!
                      </p>
                      <p className="text-[11px] text-green-600">Click "Adjust" on the left to re-crop</p>
                    </div>
                    <button onClick={removePhoto} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
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
            <button onClick={() => onAddToCart(buildPayload())} disabled={adding || !canAdd || cropMode}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all shadow-md mt-2">
              {adding ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : <><ShoppingBag size={18} /> Add personalised gift to cart</>}
            </button>

            {cropMode && <p className="text-center text-[12px] text-[#c0555a]">Please confirm your crop first ↑</p>}
            {!canAdd && !cropMode && <p className="text-center text-[12px] text-[#c0555a]">Please fill all required fields *</p>}

            <div className="flex items-center justify-center gap-3 text-[11px] text-[#aaa] flex-wrap">
              <span>✓ Photo kept private & secure</span>
              <span>✓ Crafted in 24–48 hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}