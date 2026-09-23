"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2, Check } from "lucide-react";

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
      .then(data => setCharms(Array.isArray(data) ? data.filter((c: any) => c.active) : []))
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
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">

              {/* No charm option */}
              <button
                onClick={() => { onSelect(null); onClose(); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  selected === null
                    ? "border-[#c0555a] bg-[#c0555a]/5"
                    : "border-[#e8e0d5] hover:border-[#c0555a]/50"
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-[#f3efe8] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#888] text-center leading-tight">NO<br/>CHARM</span>
                </div>
                <p className="text-[10px] font-semibold text-[#555]">No Charm</p>
                {selected === null && <Check size={12} className="text-[#c0555a]" />}
              </button>

              {charms.map(charm => (
                <button
                  key={charm.id}
                  onClick={() => { onSelect(charm); onClose(); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all relative ${
                    selected?.id === charm.id
                      ? "border-[#c0555a] bg-[#c0555a]/5"
                      : "border-[#e8e0d5] hover:border-[#c0555a]/50 hover:bg-[#f7f4ef]"
                  }`}
                >
                  <div className="relative w-14 h-14">
                    <Image src={charm.image} alt={charm.name} fill className="object-contain" sizes="56px" />
                  </div>
                  <p className="text-[10px] font-semibold text-[#555] text-center leading-tight">
                    {charm.number} - {charm.name}
                  </p>
                  {selected?.id === charm.id && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#c0555a] rounded-full flex items-center justify-center">
                      <Check size={9} className="text-white" />
                    </div>
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
          <button onClick={onClose}
            className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-bold rounded-full hover:bg-[#333] transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}