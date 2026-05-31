"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Phone,
  CheckCircle,
  Loader2,
  Clock,
  Truck,
  Home,
  MapPin,
} from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";

const STATUS_STEPS = [
  {
    key: "PROCESSING",
    label: "Order placed",
    icon: <CheckCircle size={16} />,
    desc: "We've received your order",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: <CheckCircle size={16} />,
    desc: "Payment confirmed",
  },
  {
    key: "SHIPPED",
    label: "Out for delivery",
    icon: <Truck size={16} />,
    desc: "On its way to you",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: <Home size={16} />,
    desc: "Enjoy your gift!",
  },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data.order || data);
    } catch (err: any) {
      setError(
        err.message || "Order not found. Check your order ID and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.deliveryStatus)
    : -1;

  const addr = order?.addressSnapshot as any;

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[680px] mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e8e0d5] shadow-sm">
            <Package size={28} className="text-[#c0555a]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-2">
            Track your order
          </h1>
          <p className="text-[14px] text-[#888]">
            Enter your order ID to check delivery status
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6 mb-6">
          <form onSubmit={handleTrack} className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider mb-1.5 block">
                Order ID <span className="text-[#c0555a]">*</span>
              </label>
              <div className="relative">
                <Package
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
                />
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) =>
                    setOrderId(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="e.g. 1042"
                  className="w-full pl-9 pr-4 py-3 border border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Tracking...
                </>
              ) : (
                <>
                  <Search size={16} /> Track order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order details */}
        {order && (
          <div className="flex flex-col gap-4">
            {/* Status timeline */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <p className="text-[16px] font-bold text-[#1a1a1a]">
                    Order #{order.id}
                  </p>
                  <p className="text-[12px] text-[#aaa] mt-0.5">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const current = i === currentStep;
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            done
                              ? "bg-[#c0555a] border-[#c0555a] text-white"
                              : "bg-white border-[#e8e0d5] text-[#aaa]"
                          }`}
                        >
                          {step.icon}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 my-1 min-h-[24px] ${done && i < currentStep ? "bg-[#c0555a]" : "bg-[#e8e0d5]"}`}
                          />
                        )}
                      </div>
                      <div className="pb-6 flex-1">
                        <p
                          className={`text-[14px] font-bold ${done ? "text-[#1a1a1a]" : "text-[#aaa]"}`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`text-[12px] mt-0.5 ${current ? "text-[#c0555a] font-medium" : "text-[#aaa]"}`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery address */}
            {addr && (
              <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
                <p className="text-[13px] font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-[#c0555a]" /> Delivery
                  address
                </p>
                <p className="text-[13px] text-[#555]">{addr.name}</p>
                <p className="text-[13px] text-[#555]">{addr.street}</p>
                <p className="text-[13px] text-[#555]">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-[12px] text-[#888] mt-1">{addr.phone}</p>
              </div>
            )}

            {/* Order total */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5 flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#555]">
                Order total
              </p>
              <p className="text-[18px] font-bold text-[#c0555a]">
                {formatPrice(order.totalAmount)}
              </p>
            </div>

            {/* WhatsApp support */}
            <a
              href={`https://wa.me/917665909909?text=Hi! My order ID is %23${order.id}. Can you help me?`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#1da851] transition-all"
            >
              <Phone size={16} /> Get help on WhatsApp
            </a>
          </div>
        )}

        {/* Note at bottom */}
        <p className="text-center text-[12px] text-[#aaa] mt-8">
          Need help?{" "}
          <a
            href="https://wa.me/917665909909"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c0555a] hover:underline"
          >
            WhatsApp us
          </a>{" "}
          or{" "}
          <Link href="/account" className="text-[#c0555a] hover:underline">
            view your orders
          </Link>
        </p>
      </div>
    </div>
  );
}
