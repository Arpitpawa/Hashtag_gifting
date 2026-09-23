"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";

interface CustomizationField {
  type:      "text" | "textarea" | "image";
  label:     string;
  maxLength?: number;
  required:   boolean;
  placeholder?: string;
}

interface CustomizationData {
  name?:     string;
  message?:  string;
  photoUrl?: string;
  [key: string]: string | undefined;
}

interface Props {
  fields:   CustomizationField[];
  value:    CustomizationData;
  onChange: (data: CustomizationData) => void;
  errors?:  Record<string, string>;
}

export default function CustomizationForm({
  fields,
  value,
  onChange,
  errors = {},
}: Props) {
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (type: string, val: string) => {
    onChange({ ...value, [type]: val });
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res  = await fetch("/api/customization/upload", {
        method: "POST",
        body:   formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange({ ...value, photoUrl: data.url });
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    onChange({ ...value, photoUrl: undefined });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-5">
      {fields.map((field) => (
        <div key={field.type} className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#1a1a1a] flex items-center gap-1">
            {field.label}
            {field.required && (
              <span className="text-[#c0555a]">*</span>
            )}
          </label>

          {/* TEXT INPUT */}
          {field.type === "text" && (
            <div>
              <input
                type="text"
                value={value[field.type] || ""}
                onChange={(e) => handleTextChange(field.type, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                maxLength={field.maxLength}
                className={`w-full border rounded-xl px-4 py-3 text-[14px] text-[#1a1a1a] outline-none transition-colors ${
                  errors[field.type]
                    ? "border-red-400 focus:border-red-400"
                    : "border-[#e8e0d5] focus:border-[#c0555a]"
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors[field.type] ? (
                  <p className="text-[12px] text-red-500">{errors[field.type]}</p>
                ) : <span />}
                {field.maxLength && (
                  <p className="text-[11px] text-[#aaa]">
                    {(value[field.type] || "").length}/{field.maxLength}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TEXTAREA */}
          {field.type === "textarea" && (
            <div>
              <textarea
                value={value[field.type] || ""}
                onChange={(e) => handleTextChange(field.type, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                maxLength={field.maxLength}
                rows={3}
                className={`w-full border rounded-xl px-4 py-3 text-[14px] text-[#1a1a1a] outline-none transition-colors resize-none ${
                  errors[field.type]
                    ? "border-red-400 focus:border-red-400"
                    : "border-[#e8e0d5] focus:border-[#c0555a]"
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors[field.type] ? (
                  <p className="text-[12px] text-red-500">{errors[field.type]}</p>
                ) : <span />}
                {field.maxLength && (
                  <p className="text-[11px] text-[#aaa]">
                    {(value[field.type] || "").length}/{field.maxLength}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* IMAGE UPLOAD */}
          {field.type === "image" && (
            <div>
              {value.photoUrl ? (
                /* Preview uploaded photo */
                <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border-2 border-[#c0555a]">
                  <Image
                    src={value.photoUrl}
                    alt="Uploaded photo"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                   aria-label="Close">
                    <X size={14} className="text-red-500" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#c0555a] py-1 text-center">
                    <p className="text-white text-[11px] font-medium flex items-center justify-center gap-1">
                      <CheckCircle size={11} /> Photo uploaded
                    </p>
                  </div>
                </div>
              ) : (
                /* Upload area */
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-[#c0555a] hover:bg-[#c0555a]/5 ${
                    errors.photoUrl
                      ? "border-red-400 bg-red-50"
                      : "border-[#e8e0d5] bg-[#faf7f4]"
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={28} className="text-[#c0555a] animate-spin" />
                      <p className="text-[13px] text-[#6b6b6b]">Uploading photo...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={28} className="text-[#c0555a]" />
                      <p className="text-[13px] font-medium text-[#1a1a1a]">
                        Click to upload photo
                      </p>
                      <p className="text-[12px] text-[#aaa]">
                        JPG, PNG, WEBP up to 8MB
                      </p>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
              />

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
    </div>
  );
}