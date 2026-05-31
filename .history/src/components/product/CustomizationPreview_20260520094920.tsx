"use client";

import Image from "next/image";

interface Props {
  customization: Record<string, string>;
}

export default function CustomizationPreview({ customization }: Props) {
  const hasText = !!(
    customization.text ||
    customization.name ||
    customization.message ||
    customization.textarea
  );
  const hasPhoto = !!customization.photoUrl;

  if (!hasText && !hasPhoto) return null;

  return (
    <div className="bg-[#f3efe8] rounded-xl p-4 border border-[#e8e0d5]">
      <p className="text-[11px] text-[#aaa] mb-2 uppercase tracking-wider font-semibold">
        ✨ Live preview
      </p>

      <div className="min-h-[80px] bg-white rounded-xl flex items-center justify-center border border-[#e8e0d5] px-4 py-3">
        <div className="text-center">
          {hasPhoto && (
            <div className="relative w-14 h-14 rounded-full overflow-hidden mx-auto mb-2 border-2 border-[#c0555a]">
              <Image
                src={customization.photoUrl}
                alt="Preview"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          )}

          {(customization.text || customization.name) && (
            <p
              className="text-[20px] font-semibold text-[#1a1a1a]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {customization.text || customization.name}
            </p>
          )}

          {(customization.textarea || customization.message) && (
            <p className="text-[13px] text-[#555] mt-1">
              {customization.textarea || customization.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}