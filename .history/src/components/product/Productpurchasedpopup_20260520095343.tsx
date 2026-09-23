"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Props {
  images:      string[];
  productName: string;
}

export default function ProductPurchasedPopup({ images, productName }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true),  5000);
    const hide = setTimeout(() => setVisible(false), 10000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-4 z-50 animate-in slide-in-from-left-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-[#e8e0d5] max-w-[280px]">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={images[0]} alt="" fill className="object-cover" sizes="48px" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#6b6b6b]">Someone from Jaipur just bought</p>
          <p className="text-[12px] font-bold text-[#1a1a1a] truncate">{productName}</p>
          <p className="text-[11px] text-[#c0555a]">2 minutes ago</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-[#aaa] hover:text-[#555] flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}