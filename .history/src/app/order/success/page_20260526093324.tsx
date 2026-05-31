"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ShoppingBag,
  Phone,
  Package,
  Home,
  ArrowRight,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method") || "online";

  return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-[#e8e0d5] shadow-xl max-w-md w-full p-8 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-[26px] font-bold text-[#1a1a1a] mb-2">
          Order placed!
        </h1>
        <p className="text-[14px] text-[#888] leading-relaxed mb-2">
          {method === "cod"
            ? "Your order has been confirmed. Pay when it arrives."
            : "Payment successful! Your order is confirmed."}
        </p>

        {orderId && (
          <div className="bg-[#f3efe8] rounded-2xl px-4 py-3 mb-6 inline-block">
            <p className="text-[12px] text-[#888] mb-0.5">Order ID</p>
            <p className="text-[16px] font-bold text-[#c0555a]">#{orderId}</p>
          </div>
        )}

        {/* Steps */}
        <div className="flex flex-col gap-3 mb-8 text-left">
          {[
            {
              icon: <Package size={16} className="text-[#c0555a]" />,
              text: "We'll start crafting your gift right away",
            },
            {
              icon: <CheckCircle size={16} className="text-[#c0555a]" />,
              text: "You'll receive a confirmation email shortly",
            },
            {
              icon: <Phone size={16} className="text-[#c0555a]" />,
              text: "Track your order via WhatsApp updates",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-[#f3efe8] rounded-xl"
            >
              {s.icon}
              <p className="text-[13px] text-[#555]">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/shop"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-colors"
          >
            <ShoppingBag size={16} /> Continue shopping
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-[#e8e0d5] text-[#555] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-colors"
          >
            <Home size={16} /> Back to home
          </Link>
          <a
            href={`https://wa.me/917665909909?text=Hi! My order ID is %23${orderId}. Can you help me track it?`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#1da851] transition-colors"
          >
            <Phone size={16} /> Track on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#c0555a] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
