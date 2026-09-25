"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package, Search, Phone, CheckCircle, Loader2,
  Truck, Home, MapPin, Clock, ShoppingBag,
  ExternalLink, Gift, AlertCircle, Copy, Pencil,
} from "lucide-react";

// ── Status config ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    key:   "PROCESSING",
    label: "Order Placed",
    desc:  "We've received your order and are preparing it",
    icon:  ShoppingBag,
  },
  {
    key:   "CONFIRMED",
    label: "Confirmed",
    desc:  "Payment confirmed — your gift is being crafted",
    icon:  CheckCircle,
  },
  {
    key:   "SHIPPED",
    label: "Shipped",
    desc:  "Your gift is on its way",
    icon:  Truck,
  },
  {
    key:   "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    desc:  "Almost there — arriving today!",
    icon:  MapPin,
  },
  {
    key:   "DELIVERED",
    label: "Delivered",
    desc:  "Your gift has arrived. Enjoy!",
    icon:  Home,
  },
];

const CANCELLED = {
  key:   "CANCELLED",
  label: "Cancelled",
  desc:  "This order was cancelled",
  icon:  AlertCircle,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatPrice(paise: number) {
  return `Rs. ${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

// Estimated delivery = order date + 3-5 days
function getEstimatedDelivery(createdAt: string) {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId]   = useState(searchParams.get("orderId") || "");
  const [phone,   setPhone]     = useState("");
  const [order,   setOrder]     = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [copied,  setCopied]    = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    if (!phone.trim()) {
      setError("Please enter the phone number used on this order.");
      return;
    }
    setLoading(true); setError(""); setOrder(null);
    try {
      const res  = await fetch("/api/track", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId: orderId.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Order not found. Please check your order ID.");
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    if (!order?.trackingId) return;
    navigator.clipboard.writeText(order.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find current step index
  const isCancelled   = order?.deliveryStatus === "CANCELLED";
  const currentStepIdx = order
    ? STEPS.findIndex((s) => s.key === order.deliveryStatus)
    : -1;

  const addr = order?.addressSnapshot;

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-10 md:py-14">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e8e0d5] shadow-sm">
            <Package size={26} className="text-[#c0555a]" strokeWidth={1.5} />
          </div>
          <h1
            className="text-[32px] md:text-[40px] text-[#1a1a1a] font-normal mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Track your order
          </h1>
          <p className="text-[14px] text-[#888]">
            Enter your order ID to see real-time delivery status
          </p>
        </div>

        {/* ── Search form ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6 mb-6 shadow-sm">
          <form onSubmit={handleTrack} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order ID */}
              <div>
                <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest block mb-1.5">
                  Order ID *
                </label>
                <div className="relative">
                  <Package size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 1042"
                    className="w-full pl-9 pr-4 py-3 border border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors bg-[#fafafa]"
                  />
                </div>
              </div>
              {/* Phone — required to verify this order belongs to you */}
              <div>
                <label className="text-[11px] font-bold text-[#888] uppercase tracking-widest block mb-1.5">
                  Phone *
                </label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-3 border border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors bg-[#fafafa]"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#aaa] -mt-2">
              Your phone number is used to confirm this order belongs to you before showing your delivery address.
            </p>

            {error && (
              <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c0555a] text-white text-[14px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             aria-label="Search">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Tracking…</>
                : <><Search size={16} /> Track Order</>
              }
            </button>
          </form>
        </div>

        {/* ── Order result ── */}
        {order && (
          <div className="flex flex-col gap-4">

            {/* ── Status card ── */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden shadow-sm">

              {/* Top bar */}
              <div className="px-6 py-4 border-b border-[#f0ece6] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[17px] font-bold text-[#1a1a1a]">Order #{order.id}</p>
                  <p className="text-[12px] text-[#aaa] mt-0.5">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {order.paymentStatus === "PAID" ? <span className="flex items-center gap-1"><CheckCircle size={11} /> Paid</span> : order.paymentStatus}
                  </span>
                  {order.paymentMethod === "cod" && (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                      Cash on Delivery
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar — cancelled or active */}
              {isCancelled ? (
                <div className="px-6 py-6">
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-4">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-[14px] font-bold text-red-600">Order Cancelled</p>
                      <p className="text-[12px] text-red-400 mt-0.5">
                        This order has been cancelled. If you paid online, a refund will be processed within 5-7 business days.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-6">
                  {/* Estimated delivery */}
                  {order.deliveryStatus !== "DELIVERED" && (
                    <div className="flex items-center gap-2 bg-[#f3efe8] rounded-xl px-4 py-3 mb-6 border border-[#e8e0d5]">
                      <Clock size={14} className="text-[#c4922a] flex-shrink-0" />
                      <p className="text-[13px] text-[#555]">
                        Estimated delivery:{" "}
                        <span className="font-bold text-[#1a1a1a]">
                          {order.shippedAt
                            ? getEstimatedDelivery(order.shippedAt)
                            : getEstimatedDelivery(order.createdAt)}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Steps timeline */}
                  <div className="flex flex-col gap-0">
                    {STEPS.map((step, i) => {
                      const Icon    = step.icon;
                      const done    = i <= currentStepIdx;
                      const current = i === currentStepIdx;
                      const isLast  = i === STEPS.length - 1;

                      // Get timestamp for this step
                      let timestamp = "";
                      if (step.key === "PROCESSING" || step.key === "CONFIRMED") {
                        timestamp = done ? formatDateTime(order.createdAt) : "";
                      } else if (step.key === "SHIPPED" && order.shippedAt) {
                        timestamp = formatDateTime(order.shippedAt);
                      } else if (step.key === "DELIVERED" && order.deliveredAt) {
                        timestamp = formatDateTime(order.deliveredAt);
                      }

                      return (
                        <div key={step.key} className="flex gap-4">
                          {/* Icon + connector */}
                          <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                              current
                                ? "bg-[#c0555a] border-[#c0555a] text-white shadow-md shadow-[#c0555a]/20"
                                : done
                                ? "bg-[#c0555a] border-[#c0555a] text-white"
                                : "bg-white border-[#e8e0d5] text-[#ccc]"
                            }`}>
                              <Icon size={15} />
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 flex-1 my-1 min-h-[28px] transition-all ${
                                done && i < currentStepIdx ? "bg-[#c0555a]" : "bg-[#e8e0d5]"
                              }`} />
                            )}
                          </div>

                          {/* Content */}
                          <div className={`pb-5 flex-1 ${isLast ? "pb-0" : ""}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-[14px] font-bold leading-none ${
                                  done ? "text-[#1a1a1a]" : "text-[#ccc]"
                                }`}>
                                  {step.label}
                                  {current && (
                                    <span className="ml-2 text-[10px] bg-[#c0555a] text-white px-2 py-0.5 rounded-full font-semibold align-middle">
                                      Current
                                    </span>
                                  )}
                                </p>
                                <p className={`text-[12px] mt-1 ${
                                  current ? "text-[#c0555a] font-medium" : done ? "text-[#888]" : "text-[#ccc]"
                                }`}>
                                  {step.desc}
                                </p>
                              </div>
                              {timestamp && (
                                <p className="text-[11px] text-[#aaa] whitespace-nowrap flex-shrink-0">
                                  {timestamp}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking ID */}
              {order.trackingId && (
                <div className="px-6 pb-5">
                  <div className="flex items-center justify-between bg-[#f3efe8] rounded-xl px-4 py-3 border border-[#e8e0d5]">
                    <div>
                      <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                        Courier Tracking ID
                      </p>
                      <p className="text-[14px] font-bold text-[#1a1a1a] mt-0.5">
                        {order.trackingId}
                      </p>
                    </div>
                    <button
                      onClick={copyTrackingId}
                      className="flex items-center gap-1.5 text-[12px] text-[#c0555a] font-semibold hover:underline"
                     aria-label="Copy">
                      <Copy size={12} />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Order items ── */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#f0ece6]">
                <p className="text-[13px] font-bold text-[#1a1a1a] flex items-center gap-2">
                  <Gift size={14} className="text-[#c0555a]" />
                  Order items ({order.items.length})
                </p>
              </div>
              <div className="divide-y divide-[#f5f0eb]">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Product image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f3efe8] flex-shrink-0 border border-[#e8e0d5]">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={18} className="text-[#ccc]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-[13px] font-semibold text-[#1a1a1a] hover:text-[#c0555a] transition-colors truncate block"
                      >
                        {item.product.name}
                      </Link>
                      {item.customization && (
                        <p className="flex items-center gap-1 text-[11px] text-[#888] mt-0.5">
                          <Pencil size={10} /> Personalised
                        </p>
                      )}
                      <p className="text-[12px] text-[#aaa] mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="text-[13px] font-bold text-[#1a1a1a] flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="px-5 py-4 border-t border-[#f0ece6] bg-[#fafaf9]">
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] text-green-600 font-medium">Coupon discount</span>
                    <span className="text-[12px] text-green-600 font-bold">
                      − {formatPrice(order.couponDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-[#1a1a1a]">Total paid</span>
                  <span
                    className="text-[18px] font-bold text-[#c0555a]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Delivery address ── */}
            {addr && (
              <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5 shadow-sm">
                <p className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MapPin size={12} className="text-[#c0555a]" />
                  Delivering to
                </p>
                <p className="text-[14px] font-bold text-[#1a1a1a]">{addr.name}</p>
                <p className="text-[13px] text-[#555] mt-1">{addr.street}</p>
                <p className="text-[13px] text-[#555]">
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                {addr.phone && (
                  <p className="text-[12px] text-[#aaa] mt-1">{addr.phone}</p>
                )}
              </div>
            )}

            {/* ── WhatsApp support ── */}
            <a
              href={`https://wa.me/917665909909?text=Hi! I need help with my order %23${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white text-[14px] font-bold rounded-full hover:bg-[#1da851] transition-all"
            >
              <Phone size={16} />
              Need help? Chat on WhatsApp
            </a>

          </div>
        )}

        {/* ── Bottom tip ── */}
        {!order && (
          <div className="mt-6 bg-white rounded-2xl border border-[#e8e0d5] p-5 shadow-sm">
            <p className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-3">
              Where to find your Order ID?
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "Check your email confirmation from orders@hashtaggifting.com",
                "Go to My Account → Orders",
                "Check the WhatsApp confirmation we sent you",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#f3efe8] border border-[#e8e0d5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#c0555a]">{i + 1}</span>
                  </div>
                  <p className="text-[13px] text-[#555] leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#f0ece6] flex items-center justify-between">
              <Link
                href="/account"
                className="text-[13px] text-[#c0555a] font-semibold hover:underline flex items-center gap-1"
              >
                View my orders <ExternalLink size={11} />
              </Link>
              <a
                href="https://wa.me/917665909909"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#25D366] font-semibold hover:underline flex items-center gap-1"
              >
                <Phone size={11} /> WhatsApp us
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f5f0]" />}>
      <TrackOrderForm />
    </Suspense>
  );
}