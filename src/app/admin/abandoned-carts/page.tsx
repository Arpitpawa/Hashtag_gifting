"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MessageCircle, Check, Clock, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/helpers";

interface Alert {
  id:                number;
  customerName:      string | null;
  customerEmail:     string | null;
  phone:             string;
  itemCount:         number;
  subtotal:          number;
  firstProductName:  string;
  firstProductImage: string | null;
  messageText:       string;
  status:            "READY" | "SENT";
  sentAt:            string | null;
  createdAt:         string;
  chatLink:          string;
}

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(ms / 3_600_000);
  if (hrs < 1) return `${Math.max(1, Math.floor(ms / 60_000))}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AbandonedCartsAdmin() {
  const [alerts,  setAlerts]  = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"READY" | "SENT">("READY");
  const [acting,  setActing]  = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res  = await fetch(`/api/admin/abandoned-carts?status=${filter}`);
    const data = await res.json();
    setAlerts(data.alerts || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const markSent = async (id: number) => {
    setActing(id);
    await fetch(`/api/admin/abandoned-carts/${id}/mark-sent`, { method: "POST" });
    setActing(null);
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a] mb-1">Abandoned Carts</h1>
      <p className="text-[13px] text-[#888] mb-6 max-w-2xl">
        Customers who added something to cart and didn&apos;t come back. No WhatsApp API is
        connected yet, so nothing sends automatically — click &quot;Chat on WhatsApp&quot; to open
        a pre-filled message and send it yourself, then mark it as sent.
      </p>

      <div className="flex gap-2 mb-5">
        {(["READY", "SENT"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
              filter === s
                ? "bg-[#c0555a] text-white"
                : "bg-white border border-[#e8e8e8] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
            }`}
          >
            {s === "READY" ? "Needs action" : "Sent"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[13px] text-[#888]">Loading…</p>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-[#e8e8e8] rounded-2xl p-10 text-center">
          <ShoppingCart size={28} className="mx-auto text-[#ccc] mb-2" />
          <p className="text-[13px] text-[#888]">
            {filter === "READY" ? "No abandoned carts right now." : "Nothing marked as sent yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-white border border-[#e8e8e8] rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f5f0e8] flex-shrink-0">
                {a.firstProductImage && (
                  <Image src={a.firstProductImage} alt={a.firstProductName} fill sizes="64px" className="object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[14px] font-bold text-[#1a1a1a]">{a.customerName || "Customer"}</p>
                  <span className="text-[12px] text-[#aaa]">+91 {a.phone}</span>
                  <span className="text-[11px] text-[#aaa] flex items-center gap-1"><Clock size={11} /> {timeAgo(a.createdAt)}</span>
                </div>
                <p className="text-[13px] text-[#555] mt-0.5">
                  {a.itemCount} item{a.itemCount > 1 ? "s" : ""} · {a.firstProductName}
                  {a.itemCount > 1 ? " + more" : ""} · {formatPrice(a.subtotal)}
                </p>
                <p className="text-[12px] text-[#999] mt-1.5 italic">&quot;{a.messageText}&quot;</p>
              </div>

              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <a
                  href={a.chatLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-[12px] font-bold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <MessageCircle size={14} /> Chat on WhatsApp
                </a>
                {a.status === "READY" && (
                  <button
                    onClick={() => markSent(a.id)}
                    disabled={acting === a.id}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#e8e8e8] text-[#555] text-[12px] font-bold rounded-xl hover:border-[#c0555a] hover:text-[#c0555a] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    <Check size={14} /> Mark as sent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
