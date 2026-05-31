"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle } from "lucide-react";
import type { CustomizationField } from "@/types/product";
import CustomizationForm    from "./CustomizationForm";
import CustomizationPreview from "./CustomizationPreview";

interface Props {
  fields:          CustomizationField[];
  customization:   Record<string, string>;
  setCustomization: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  custErrors:      Record<string, string>;
  setCustErrors:   React.Dispatch<React.SetStateAction<Record<string, string>>>;
  productId:       number;
}

export default function ProductCustomizer({
  fields, customization, setCustomization, custErrors, setCustErrors, productId,
}: Props) {
  const [showEmojis,  setShowEmojis]  = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [savedDraft,  setSavedDraft]  = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`draft-${productId}`);
      if (raw) {
        const { c } = JSON.parse(raw);
        if (c) setCustomization(c);
      }
    } catch {}
  }, [productId]);

  const handleChange = (key: string, value: string) => {
    setCustomization((prev) => ({ ...prev, [key]: value }));
    if (custErrors[key]) setCustErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/customization/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setCustomization((prev) => ({ ...prev, photoUrl: data.url }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setCustomization((prev) => {
      const next = { ...prev };
      delete next.photoUrl;
      return next;
    });
  };

  const saveDraft = () => {
    localStorage.setItem(`draft-${productId}`, JSON.stringify({ c: customization }));
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c0555a] to-[#a84449] px-5 py-3 flex items-center justify-between">
        <p className="text-[13px] font-bold text-white flex items-center gap-2">
          <Sparkles size={14} /> Personalize this gift
        </p>
        <span className="text-[11px] text-white/70">* = required</span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <CustomizationForm
          fields={fields}
          customization={customization}
          custErrors={custErrors}
          showEmojis={showEmojis}
          uploading={uploading}
          setShowEmojis={setShowEmojis}
          onChange={handleChange}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={handleRemovePhoto}
        />

        <CustomizationPreview customization={customization} />

        {/* Save draft */}
        <button
          onClick={saveDraft}
          className="flex items-center gap-1.5 text-[12px] text-[#aaa] hover:text-[#c0555a] transition-colors w-fit"
        >
          {savedDraft ? (
            <><CheckCircle size={13} className="text-green-500" /> Draft saved!</>
          ) : (
            "💾 Save for later"
          )}
        </button>
      </div>
    </div>
  );
}