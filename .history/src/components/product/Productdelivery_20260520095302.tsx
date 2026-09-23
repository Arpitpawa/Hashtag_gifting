"use client";

import { useState } from "react";
import {
  MapPin, Loader2, CheckCircle, X,
  Truck, ShieldCheck, RefreshCw, Package,
} from "lucide-react";

export default function ProductDelivery() {
  const [pincode,      setPincode]      = useState("");
  const [pincodeInfo,  setPincodeInfo]  = useState<any>(null);
  const [checkingPin,  setCheckingPin]  = useState(false);

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setCheckingPin(true);
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
      setCheckingPin(false);
    }
  };

  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (pincodeInfo?.estimatedDays || 5));
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  const trustItems = [
    { icon: <Truck size={15} />,       title: "Free delivery",  sub: "On orders above Rs. 999" },
    { icon: <ShieldCheck size={15} />, title: "Secure payment", sub: "100% safe & encrypted"   },
    { icon: <RefreshCw size={15} />,   title: "Easy returns",   sub: "7-day return policy"      },
    { icon: <Package size={15} />,     title: "Safe packaging", sub: "Damage-free delivery"     },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Pincode checker */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] p-4 shadow-sm">
        <p className="text-[13px] font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
          <MapPin size={14} className="text-[#c0555a]" /> Check delivery availability
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              setPincodeInfo(null);
            }}
            placeholder="Enter 6-digit pincode"
            className="flex-1 border border-[#e8e0d5] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
          />
          <button
            onClick={checkPincode}
            disabled={pincode.length !== 6 || checkingPin}
            className="px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#a84449] transition-colors disabled:opacity-50"
          >
            {checkingPin ? <Loader2 size={14} className="animate-spin" /> : "Check"}
          </button>
        </div>

        {pincodeInfo && (
          <div
            className={`mt-3 p-3 rounded-xl text-[13px] font-medium flex items-start gap-2 ${
              pincodeInfo.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {pincodeInfo.success
              ? <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              : <X size={14} className="mt-0.5 flex-shrink-0" />}
            <div>
              <p>{pincodeInfo.message}</p>
              {pincodeInfo.success && (
                <p className="text-[12px] mt-0.5 opacity-80">
                  Estimated: <strong>{getDeliveryDate()}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-2 gap-3">
        {trustItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#e8e0d5]">
            <span className="text-[#c0555a] flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-[12px] font-semibold text-[#1a1a1a]">{item.title}</p>
              <p className="text-[10px] text-[#aaa]">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}