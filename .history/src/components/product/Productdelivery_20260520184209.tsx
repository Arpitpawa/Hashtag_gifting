"use client";

import { useState } from "react";
import { MapPin, Loader2, CheckCircle, X, Truck, ShieldCheck, RefreshCw } from "lucide-react";

export default function ProductDelivery() {
  const [pincode,     setPincode]     = useState("");
  const [pincodeInfo, setPincodeInfo] = useState<any>(null);
  const [checking,    setChecking]    = useState(false);

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setChecking(true);
    try {
      const res = await fetch("/api/pincode", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pincode }),
      });
      setPincodeInfo(await res.json());
    } catch {
      setPincodeInfo({ success: false, message: "Could not check pincode" });
    } finally {
      setChecking(false);
    }
  };

  const deliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (pincodeInfo?.estimatedDays || 5));
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Pincode row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              setPincodeInfo(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && checkPincode()}
            placeholder="Enter Pincode"
            className="w-full border border-[#e8e0d5] rounded-xl pl-8 pr-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a] transition-colors bg-white"
          />
        </div>
        <button
          onClick={checkPincode}
          disabled={pincode.length !== 6 || checking}
          className="px-5 py-2.5 bg-[#c0555a] text-white text-[12px] font-bold rounded-xl hover:bg-[#a84449] transition-colors disabled:opacity-50 tracking-wide uppercase"
        >
          {checking ? <Loader2 size={13} className="animate-spin" /> : "Submit"}
        </button>
      </div>

      {/* Result */}
      {!pincodeInfo && (
        <p className="text-[11px] text-[#aaa] pl-1">Please enter pincode/location to proceed</p>
      )}
      {pincodeInfo && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-[12px] font-medium ${
          pincodeInfo.success
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {pincodeInfo.success
            ? <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />
            : <X size={13} className="mt-0.5 flex-shrink-0" />}
          <div>
            <p>{pincodeInfo.message}</p>
            {pincodeInfo.success && (
              <p className="opacity-80 mt-0.5">Estimated delivery: <strong>{deliveryDate()}</strong></p>
            )}
          </div>
        </div>
      )}

      {/* Trust strip */}
      <div className="flex items-center justify-between border border-[#e8e0d5] bg-white rounded-xl px-3 py-2.5 divide-x divide-[#e8e0d5]">
        {[
          { icon: <ShieldCheck size={14} className="text-[#c0555a]" />, label: "Partial COD\nAvailable" },
          { icon: <Truck       size={14} className="text-[#c0555a]" />, label: "Freebie On\nEvery Order" },
          { icon: <RefreshCw   size={14} className="text-[#c0555a]" />, label: "Easy\nReturn" },
        ].map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 px-2">
            {item.icon}
            <p className="text-[10px] font-semibold text-[#444] text-center leading-tight whitespace-pre-line">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}