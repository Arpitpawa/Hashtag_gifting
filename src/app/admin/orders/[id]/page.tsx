"use client";

import { useEffect, useState, useCallback } from "react";
import AdminSelect from "@/components/admin/AdminSelect";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Loader2, Phone, MapPin, Package,
  User, CreditCard, Truck, Sparkles, Palette, Download,
} from "lucide-react";

function formatPrice(p: number) { return `Rs. ${(p / 100).toLocaleString("en-IN")}`; }

const STATUS_COLOR: Record<string, string> = {
  PAID:       "bg-green-100 text-green-700",
  PENDING:    "bg-yellow-100 text-yellow-700",
  FAILED:     "bg-red-100 text-red-600",
  REFUNDED:   "bg-gray-100 text-gray-600",
  PROCESSING: "bg-blue-100 text-blue-700",
  CONFIRMED:  "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-purple-100 text-purple-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-gray-100 text-gray-600",
};

const DELIVERY_STATUSES = ["PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES  = ["PENDING", "PAID", "FAILED", "REFUNDED"];

// Keys that get their own dedicated UI treatment below — everything else in
// a customization object is shown as a generic "label: value" line.
const SPECIAL_KEYS = new Set([
  "photo_upload", "preview_png", "photoUrl", "personalisation_font",
  "selected_charm", "charm_number", "isHamper", "hamperRef", "role",
  "variantSelections", "giftWrap", "greetingCard",
]);

function isImageValue(v: any): v is string {
  return typeof v === "string" && (v.startsWith("data:image") || v.startsWith("http"));
}

function CustomizationBlock({ customization }: { customization: Record<string, any> }) {
  const preview   = customization.preview_png;
  const photo     = customization.photo_upload || customization.photoUrl;
  const font      = customization.personalisation_font;
  const charm     = customization.selected_charm;
  const charmNum  = customization.charm_number;

  const textEntries = Object.entries(customization).filter(
    ([k, v]) => !SPECIAL_KEYS.has(k) && v !== null && v !== undefined && v !== "" && typeof v !== "object"
  );

  const hasAnything = preview || photo || font || charm || textEntries.length > 0;
  if (!hasAnything) return null;

  return (
    <div className="mt-3 p-4 bg-[#faf6f0] border border-[#f0e4d5] rounded-xl flex flex-col gap-3">
      <p className="text-[11px] font-bold text-[#c4922a] uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles size={12} /> Personalisation details
      </p>

      {(preview || photo) && (
        <div className="flex gap-3 flex-wrap">
          {preview && isImageValue(preview) && (
            <div>
              <p className="text-[10px] font-semibold text-[#aaa] uppercase mb-1">What to craft</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Live preview" className="w-32 h-32 rounded-lg object-cover border border-[#e8e0d5]" />
            </div>
          )}
          {photo && isImageValue(photo) && (
            <div>
              <p className="text-[10px] font-semibold text-[#aaa] uppercase mb-1">Customer's uploaded photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Uploaded photo" className="w-32 h-32 rounded-lg object-cover border border-[#e8e0d5]" />
            </div>
          )}
        </div>
      )}

      {textEntries.length > 0 && (
        <div className="flex flex-col gap-1">
          {textEntries.map(([k, v]) => (
            <p key={k} className="text-[13px] text-[#333]">
              <span className="font-semibold capitalize">{k.replace(/_/g, " ")}:</span>{" "}
              {String(v)}
            </p>
          ))}
        </div>
      )}

      {font && (
        <p className="text-[13px] text-[#333] flex items-center gap-1.5">
          <Palette size={13} className="text-[#c4922a]" />
          <span className="font-semibold">Font style:</span> {font}
        </p>
      )}

      {charm && (
        <p className="text-[13px] text-[#333]">
          <span className="font-semibold">Charm:</span> {charm}{charmNum ? ` (#${charmNum})` : ""}
        </p>
      )}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order,    setOrder]    = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.status === 404) { setNotFound(true); return; }
      const data = await res.json();
      setOrder(data);
    } finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const updateOrder = async (field: string, value: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      setOrder((prev: any) => prev ? { ...prev, [field]: value } : null);
    } finally { setUpdating(false); }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-[#c0555a]" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-[14px] text-[#888]">Order not found.</p>
        <button onClick={() => router.push("/admin/orders")}
          className="mt-3 flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold hover:underline">
          <ArrowLeft size={14} /> Back to orders
        </button>
      </div>
    );
  }

  const snap = order.addressSnapshot as any;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px]">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
        <button onClick={() => router.push("/admin/orders")}
          className="w-9 h-9 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-center hover:border-[#c0555a] hover:text-[#c0555a] transition-all flex-shrink-0">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] sm:text-[24px] font-bold text-[#1a1a1a]">Order #{order.id}</h1>
          <p className="text-[13px] text-[#888] mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0 w-full sm:w-auto">
          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${STATUS_COLOR[order.paymentStatus] || ""}`}>
            {order.paymentStatus}
          </span>
          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${STATUS_COLOR[order.deliveryStatus] || ""}`}>
            {order.deliveryStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* ── LEFT: Items + customization ── */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 sm:p-6">
            <h3 className="text-[14px] font-bold text-[#1a1a1a] mb-5 pb-3 border-b border-[#f0f0f0] flex items-center gap-2">
              <Package size={15} /> Items ({order.items?.length || 0})
            </h3>
            <div className="flex flex-col gap-5">
              {order.items?.map((item: any) => (
                <div key={item.id} className="pb-5 border-b border-[#f5f5f5] last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.product?.images?.[0] && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                        <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1a1a1a] capitalize">{item.product?.name}</p>
                      <p className="text-[12px] text-[#888]">Qty: {item.quantity} · {formatPrice(item.price)} each</p>
                      {item.product?.sku && (
                        <p className="text-[11px] text-[#aaa] font-mono mt-0.5">SKU: {item.product.sku}</p>
                      )}
                      {item.variantInfo?.optionName && (
                        <p className="text-[11px] text-[#c0555a] font-semibold mt-0.5">
                          {item.variantInfo.groupName || "Option"}: {item.variantInfo.optionName}
                        </p>
                      )}
                    </div>
                    <p className="text-[14px] font-bold text-[#1a1a1a] flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {item.customization && typeof item.customization === "object" && (
                    <CustomizationBlock customization={item.customization} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[15px] font-bold pt-4 mt-1 border-t border-[#f0f0f0]">
              <span>Total</span>
              <span className="text-[#c0555a]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Customer, address, status ── */}
        <div className="flex flex-col gap-5">

          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User size={12} /> Customer
            </p>
            <p className="text-[13px] font-semibold text-[#1a1a1a]">{snap?.name || order.user?.name || "Guest"}</p>
            <p className="text-[12px] text-[#888]">{order.user?.email || "—"}</p>
            {order.user?.phone && <p className="text-[12px] text-[#888]">{order.user.phone}</p>}
          </div>

          {snap && (
            <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
              <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin size={12} /> Delivery address
              </p>
              <p className="text-[13px] font-semibold text-[#1a1a1a]">{snap.name}</p>
              <p className="text-[12px] text-[#666] mt-1">{snap.street}</p>
              <p className="text-[12px] text-[#666]">{snap.city}, {snap.state} - {snap.pincode}</p>
              <p className="text-[12px] text-[#888] flex items-center gap-1 mt-2"><Phone size={11} />{snap.phone}</p>

              {/* Generated on-demand from live order data each time it's
                  clicked (see the /invoice route) — nothing to "generate"
                  ahead of time, it's always ready the moment an order exists. */}
              <a href={`/api/admin/orders/${order.id}/invoice`} target="_blank" rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#c0555a] text-white text-[13px] font-semibold rounded-full hover:bg-[#a84449] transition-colors">
                <Download size={14} /> Download Invoice
              </a>

              <a href={`https://wa.me/${snap?.phone?.replace(/\D/g, "")}?text=Hi ${snap?.name}! Your Hashtag Gifting order %23${order.id} has been ${order.deliveryStatus.toLowerCase()}.`}
                target="_blank" rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-[13px] font-semibold rounded-full hover:bg-[#1da851] transition-colors">
                <Phone size={14} /> Notify on WhatsApp
              </a>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard size={12} /> Payment
            </p>
            <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Payment status</label>
            <AdminSelect value={order.paymentStatus}
              onChange={e => updateOrder("paymentStatus", e.target.value)}
              disabled={updating}
              className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white disabled:opacity-50">
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </AdminSelect>
            {order.paymentMethod && (
              <p className="text-[12px] text-[#888] mt-2">Method: {order.paymentMethod.toUpperCase()}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5">
            <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Truck size={12} /> Delivery
            </p>
            <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Delivery status</label>
            <AdminSelect value={order.deliveryStatus}
              onChange={e => updateOrder("deliveryStatus", e.target.value)}
              disabled={updating}
              className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white disabled:opacity-50">
              {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </AdminSelect>
            {order.trackingId && (
              <p className="text-[12px] text-[#888] mt-2">Tracking ID: {order.trackingId}</p>
            )}
            {updating && (
              <p className="text-[12px] text-[#c0555a] flex items-center gap-1 mt-2">
                <Loader2 size={12} className="animate-spin" /> Updating...
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
