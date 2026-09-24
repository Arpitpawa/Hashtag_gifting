"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { StoreButton } from "@/components/ui/StoreButton";

interface Charm {
  id: number; name: string; number: number; image: string;
}

interface Props {
  open:       boolean;
  onClose:    () => void;
  onSelect:   (charm: Charm | null) => void;
  selected:   Charm | null;
}

export default function CharmSelector({ open, onClose, onSelect, selected }: Props) {
  const [charms,  setCharms]  = useState<Charm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/admin/charms")
      .then(r => r.json())
      .then(data => setCharms(Array.isArray(data) ? data.filter((c: any) => c.active !== false) : []))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] flex-shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#1a1a1a]">Select Charm</h2>
            <p className="text-[12px] text-[#888] mt-0.5">Choose a charm to be added to your product</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f5f5f5] hover:bg-[#e8e8e8] flex items-center justify-center transition-colors" aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#c0555a]" />
            </div>
          ) : (
            // grid-cols-4 at the base (no smaller step) meant a 320px phone
            // squeezed 4 columns of w-14 (56px) images + p-3 padding into
            // cells narrower than the image itself. grid-cols-3 first,
            // stepping up from there, keeps every cell big enough.
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">

              {/* No charm option */}
              <button
                onClick={() => { onSelect(null); onClose(); }}
                className={`group relative aspect-square rounded-xl bg-[#f3efe8] flex flex-col items-center justify-center border-2 transition-all ${
                  selected === null ? "border-[#c0555a] shadow-md" : "border-transparent hover:border-[#c0555a]/50"
                }`}
              >
                <span className="text-[12px] sm:text-[13px] font-black text-[#1a1a1a] text-center leading-tight tracking-tight">NO<br/>CHARM</span>
                {selected === null && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#c0555a] rounded-full flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </span>
                )}
              </button>

              {charms.map(charm => (
                <button
                  key={charm.id}
                  onClick={() => { onSelect(charm); onClose(); }}
                  className={`group relative aspect-square rounded-xl bg-[#f3efe8] overflow-hidden border-2 transition-all ${
                    selected?.id === charm.id ? "border-[#c0555a] shadow-md" : "border-transparent hover:border-[#c0555a]/50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={charm.image} alt={charm.name} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <p className="absolute inset-x-0 bottom-0 pt-3 pb-1.5 px-1 text-[10px] sm:text-[11px] font-semibold text-[#1a1a1a] text-center leading-tight truncate bg-gradient-to-t from-[#ecdccf] via-[#ecdccf]/85 to-transparent">
                    {charm.number} - {charm.name}
                  </p>
                  {selected?.id === charm.id && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#c0555a] rounded-full flex items-center justify-center">
                      <Check size={9} className="text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#f0f0f0] flex-shrink-0 flex items-center justify-between">
          <p className="text-[12px] text-[#888]">
            {selected ? `Selected: ${selected.name}` : "No charm selected"}
          </p>
          <StoreButton onClick={onClose} variant="dark" size="sm">
            Done
          </StoreButton>
        </div>
      </div>
    </div>
  );
}