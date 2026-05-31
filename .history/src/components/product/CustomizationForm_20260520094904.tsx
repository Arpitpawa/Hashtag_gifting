"use client";

import Image from "next/image";
import { Loader2, X, CheckCircle } from "lucide-react";
import type { CustomizationField } from "@/types/product";

const EMOJIS = ["❤️","🎉","🎂","💝","✨","🌹","💫","🎁","😍","🥰","💖","🌟"];

interface Props {
  fields:          CustomizationField[];
  customization:   Record<string, string>;
  custErrors:      Record<string, string>;
  showEmojis:      string | null;
  uploading:       boolean;
  setShowEmojis:   (key: string | null) => void;
  onChange:        (key: string, value: string) => void;
  onPhotoUpload:   (file: File) => void;
  onRemovePhoto:   () => void;
}

export default function CustomizationForm({
  fields, customization, custErrors, showEmojis, uploading,
  setShowEmojis, onChange, onPhotoUpload, onRemovePhoto,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((field, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#1a1a1a]">
            {field.label}
            {field.required && <span className="text-[#c0555a] ml-1">*</span>}
          </label>

          {/* TEXT */}
          {field.type === "text" && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={field.maxLength}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  value={customization[field.type] || ""}
                  onChange={(e) => onChange(field.type, e.target.value)}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-[14px] outline-none transition-all bg-white ${
                    field.maxLength ? "pr-16" : ""
                  } ${custErrors[field.type] ? "border-red-400" : "border-[#e8e0d5] focus:border-[#c0555a]"}`}
                />
                {field.maxLength && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#aaa]">
                    {(customization[field.type] || "").length}/{field.maxLength}
                  </span>
                )}
              </div>

              {/* Emoji picker */}
              <div className="relative mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowEmojis(showEmojis === field.type ? null : field.type)}
                  className="text-[12px] text-[#aaa] hover:text-[#c0555a] transition-colors"
                >
                  😊 Add emoji
                </button>
                {showEmojis === field.type && (
                  <div className="absolute top-7 left-0 z-20 bg-white rounded-xl shadow-xl border border-[#e8e0d5] p-3 flex flex-wrap gap-2 w-[220px]">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onChange(field.type, (customization[field.type] || "") + emoji);
                          setShowEmojis(null);
                        }}
                        className="text-xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {custErrors[field.type] && (
                <p className="text-[12px] text-red-500 mt-1">{custErrors[field.type]}</p>
              )}
            </div>
          )}

          {/* TEXTAREA */}
          {field.type === "textarea" && (
            <div>
              <textarea
                rows={3}
                maxLength={field.maxLength}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                value={customization[field.type] || ""}
                onChange={(e) => onChange(field.type, e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 text-[14px] outline-none transition-all resize-none bg-white ${
                  custErrors[field.type] ? "border-red-400" : "border-[#e8e0d5] focus:border-[#c0555a]"
                }`}
              />
              <div className="flex justify-between mt-1">
                {custErrors[field.type]
                  ? <p className="text-[12px] text-red-500">{custErrors[field.type]}</p>
                  : <span />}
                {field.maxLength && (
                  <p className="text-[11px] text-[#aaa]">
                    {(customization[field.type] || "").length}/{field.maxLength}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* IMAGE */}
          {field.type === "image" && (
            <div>
              {customization.photoUrl ? (
                <div className="flex items-center gap-3 p-3 bg-[#f3efe8] rounded-xl border border-[#c0555a]/20">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={customization.photoUrl} alt="Uploaded" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-green-700 flex items-center gap-1">
                      <CheckCircle size={13} /> Photo ready!
                    </p>
                    <p className="text-[11px] text-[#aaa]">Tap X to change</p>
                  </div>
                  <button
                    onClick={onRemovePhoto}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm"
                  >
                    <X size={13} className="text-red-400" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    uploading ? "pointer-events-none opacity-60" : "hover:border-[#c0555a] hover:bg-[#c0555a]/5"
                  } ${custErrors.photoUrl ? "border-red-400" : "border-[#e8e0d5]"}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhotoUpload(f); }}
                  />
                  {uploading ? (
                    <>
                      <Loader2 size={24} className="text-[#c0555a] animate-spin" />
                      <p className="text-[13px] text-[#c0555a] font-medium">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-[#c0555a]/10 rounded-full flex items-center justify-center text-2xl">📷</div>
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">Click to upload photo</p>
                      <p className="text-[11px] text-[#aaa]">JPG, PNG, WEBP — max 8MB</p>
                    </>
                  )}
                </label>
              )}
              {custErrors.photoUrl && (
                <p className="text-[12px] text-red-500 mt-1">{custErrors.photoUrl}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}