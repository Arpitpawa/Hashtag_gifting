"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Package, MapPin, CreditCard,
  Truck, CheckCircle, Clock, Gift,
  Phone, ShoppingBag, Copy, AlertCircle,
  Loader2, Pencil, Check,
} from "lucide-react";

const STEPS = [
  { key: "PROCESSING",       label: "Order placed",      icon: ShoppingBag  },
  { key: "CONFIRMED",        label: "Confirmed",          icon: CheckCircle  },
  { key: "SHIPPED",          label: "Shipped",            icon: Truck        },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery",   icon: MapPin       },
  { key: "DELIVERED",        label: "Delivered",          icon: CheckCircle  },
];

const STATUS_COLOR: Record<string, string> = {
  PROCESSING:       "bg-blue-100 text-blue-700",
  CONFIRMED:        "bg-blue-100 text-blue-700",
  SHIPPED:          "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED:        "bg-green-100 text-green-700",
  CANCELLED:        "bg-gray-100 text-gray-600",
};

const PAYMENT_COLOR: Record<string, string> = {
  PAID:     "bg-green-100 text-green-700",
  PENDING:  "bg-yellow-100 text-yellow-700",
  FAILED:   "bg-red-100 text-red-600",
  REFUNDED: "bg-blue-100 text-blue-700",
};

function fmt(paise: number) {
  return `Rs. ${(paise / 100).toLocaleString("en-IN")}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OrderDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params?.id as string;

  const [order,   setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(String(order.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#c0555a]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f3efe8] flex flex-col items-center justify-center px-4 text-center gap-4">
      <AlertCircle size={36} className="text-red-400" />
      <p className="text-[16px] font-bold text-[#1a1a1a]">{error}</p>
      <p className="text-[13px] text-[#888]">Make sure you're logged in and this is your order.</p>
      <div className="flex gap-3 mt-2">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#e8e0d5] text-[#555] text-[13px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
          <ArrowLeft size={14} /> Go back
        </button>
        <Link href="/account?tab=orders"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
          My orders
        </Link>
      </div>
    </div>
  );

  const addr           = order.addressSnapshot as any;
  const isCancelled    = order.deliveryStatus === "CANCELLED";
  const currentStepIdx = STEPS.findIndex(s => s.key === order.deliveryStatus);
  const subtotal       = order.items.reduce((s: number, i: any) => s + (i.price * i.quantity), 0);

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[780px] mx-auto px-4 md:px-6 py-8">

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-[13px] text-[#888] hover:text-[#c0555a] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to orders
        </button>

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6 mb-4 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[20px] font-bold text-[#1a1a1a]">Order #{order.id}</h1>
                <button onClick={copyOrderId}
                  className="flex items-center gap-1 text-[11px] text-[#aaa] hover:text-[#c0555a] transition-colors" aria-label="Copy">
                  <Copy size={11} /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-[13px] text-[#aaa] flex items-center gap-1">
                <Clock size={12} /> Placed on {fmtDate(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${PAYMENT_COLOR[order.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                {order.paymentStatus === "PAID" ? <span className="flex items-center gap-1"><Check size={11} /> Paid</span> : order.paymentStatus}
              </span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[order.deliveryStatus] || "bg-gray-100 text-gray-600"}`}>
                {order.deliveryStatus.replace("_", " ")}
              </span>
              {order.paymentMethod === "cod" && (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                  Cash on Delivery
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Delivery timeline ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6 mb-4 shadow-sm">
          <p className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-5 flex items-center gap-2">
            <Truck size={12} className="text-[#c0555a]" /> Delivery status
          </p>

          {isCancelled ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-4">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-[14px] font-bold text-red-600">Order Cancelled</p>
                <p className="text-[12px] text-red-400 mt-0.5">
                  This order has been cancelled. Refunds are processed within 5-7 business days.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Estimated delivery */}
              {order.deliveryStatus !== "DELIVERED" && (
                <div className="flex items-center gap-2 bg-[#f3efe8] rounded-xl px-4 py-3 mb-5 border border-[#e8e0d5]">
                  <Clock size={13} className="text-[#c4922a] flex-shrink-0" />
                  <p className="text-[13px] text-[#555]">
                    Estimated delivery:{" "}
                    <span className="font-bold text-[#1a1a1a]">
                      {(() => {
                        const d = new Date(order.shippedAt || order.createdAt);
                        d.setDate(d.getDate() + 4);
                        return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
                      })()}
                    </span>
                  </p>
                </div>
              )}

              {/* Steps */}
              <div className="flex flex-col gap-0">
                {STEPS.map((step, i) => {
                  const Icon    = step.icon;
                  const done    = i <= currentStepIdx;
                  const current = i === currentStepIdx;
                  const isLast  = i === STEPS.length - 1;

                  let timestamp = "";
                  if ((step.key === "PROCESSING" || step.key === "CONFIRMED") && done)
                    timestamp = fmtDateTime(order.createdAt);
                  else if (step.key === "SHIPPED" && order.shippedAt)
                    timestamp = fmtDateTime(order.shippedAt);
                  else if (step.key === "DELIVERED" && order.deliveredAt)
                    timestamp = fmtDateTime(order.deliveredAt);

                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          current ? "bg-[#c0555a] border-[#c0555a] text-white shadow-md shadow-[#c0555a]/20"
                          : done   ? "bg-[#c0555a] border-[#c0555a] text-white"
                          :          "bg-white border-[#e8e0d5] text-[#ccc]"
                        }`}>
                          <Icon size={14} />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${done && i < currentStepIdx ? "bg-[#c0555a]" : "bg-[#e8e0d5]"}`} />
                        )}
                      </div>
                      <div className={`pb-5 flex-1 ${isLast ? "pb-0" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-[14px] font-bold leading-none ${done ? "text-[#1a1a1a]" : "text-[#ccc]"}`}>
                              {step.label}
                              {current && (
                                <span className="ml-2 text-[10px] bg-[#c0555a] text-white px-2 py-0.5 rounded-full font-semibold align-middle">
                                  Current
                                </span>
                              )}
                            </p>
                          </div>
                          {timestamp && (
                            <p className="text-[11px] text-[#aaa] flex-shrink-0 whitespace-nowrap">{timestamp}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tracking ID */}
              {order.trackingId && (
                <div className="mt-4 flex items-center justify-between bg-[#f3efe8] rounded-xl px-4 py-3 border border-[#e8e0d5]">
                  <div>
                    <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Courier tracking ID</p>
                    <p className="text-[14px] font-bold text-[#1a1a1a] mt-0.5">{order.trackingId}</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(order.trackingId); }}
                    className="text-[12px] text-[#c0555a] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Order items ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden mb-4 shadow-sm">
          <div className="px-5 py-4 border-b border-[#f0ece6]">
            <p className="text-[12px] font-bold text-[#888] uppercase tracking-widest flex items-center gap-2">
              <Gift size={12} className="text-[#c0555a]" />
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-[#f5f0eb]">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                {/* Product image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f3efe8] flex-shrink-0 border border-[#e8e0d5]">
                  {item.product?.images?.[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.name}
                      fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-[#ccc]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product?.slug}`}
                    className="text-[14px] font-semibold text-[#1a1a1a] hover:text-[#c0555a] transition-colors truncate block">
                    {item.product?.name}
                  </Link>
                  {item.customization && (
                    <div className="mt-1.5 space-y-0.5">
                      {typeof item.customization === "object" &&
                        Object.entries(item.customization as Record<string, any>)
                          .filter(([k]) => !["isHamper","hamperRef","role"].includes(k))
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <p key={k} className="text-[11px] text-[#888]">
                              <span className="font-medium capitalize">{k}:</span>{" "}
                              {typeof v === "string" ? v.slice(0, 40) : <Check size={11} className="inline" />}
                            </p>
                          ))
                      }
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#c0555a] bg-[#c0555a]/10 px-2 py-0.5 rounded-full">
                        <Pencil size={9} /> Personalised
                      </span>
                    </div>
                  )}
                  <p className="text-[12px] text-[#aaa] mt-1">Qty: {item.quantity}</p>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[14px] font-bold text-[#1a1a1a]">
                    {fmt(item.price * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[11px] text-[#aaa]">{fmt(item.price)} each</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="px-5 py-4 border-t border-[#f0ece6] bg-[#fafaf9] space-y-2">
            <div className="flex justify-between text-[13px] text-[#888]">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-[13px] text-green-600 font-medium">
                <span>Coupon discount</span>
                <span>− {fmt(order.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px] text-[#888]">
              <span>Delivery</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#f0ece6]">
              <span className="text-[14px] font-bold text-[#1a1a1a]">Total</span>
              <span
                className="text-[22px] font-bold text-[#c0555a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {fmt(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Delivery address ── */}
        {addr && (
          <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5 mb-4 shadow-sm">
            <p className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin size={12} className="text-[#c0555a]" /> Delivering to
            </p>
            <p className="text-[15px] font-bold text-[#1a1a1a]">{addr.name}</p>
            <p className="text-[13px] text-[#555] mt-1">{addr.street}</p>
            <p className="text-[13px] text-[#555]">{addr.city}, {addr.state} — {addr.pincode}</p>
            {addr.phone && <p className="text-[12px] text-[#aaa] mt-1">{addr.phone}</p>}
          </div>
        )}

        {/* ── Payment info ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5 mb-4 shadow-sm">
          <p className="text-[12px] font-bold text-[#888] uppercase tracking-widest mb-3 flex items-center gap-2">
            <CreditCard size={12} className="text-[#c0555a]" /> Payment
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#888]">Method</span>
              <span className="font-medium text-[#1a1a1a] capitalize">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod || "Online"}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#888]">Status</span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${PAYMENT_COLOR[order.paymentStatus]}`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.razorpayPaymentId && (
              <div className="flex justify-between text-[13px]">
                <span className="text-[#888]">Payment ID</span>
                <span className="font-mono text-[12px] text-[#555]">{order.razorpayPaymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/track?orderId=${order.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1a1a1a] text-white text-[13px] font-bold rounded-full hover:bg-[#333] transition-all"
          >
            <Truck size={15} /> Track this order
          </Link>
          <a
            href={`https://wa.me/917665909909?text=Hi! I need help with order %23${order.id}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white text-[13px] font-bold rounded-full hover:bg-[#1da851] transition-all"
          >
            <Phone size={15} /> WhatsApp support
          </a>
        </div>

      </div>
    </div>
  );
}