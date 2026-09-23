"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp, ShoppingBag, Users, Package,
  AlertTriangle, Star, ArrowRight, IndianRupee,
  Clock, CheckCircle,
} from "lucide-react";

function formatPrice(p: number) {
  return `Rs. ${(p / 100).toLocaleString("en-IN")}`;
}

function StatCard({ label, value, sub, icon, color, href }: any) {
  const card = (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow h-full">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#888] font-medium">{label}</p>
        <p className="text-[20px] sm:text-[24px] font-bold text-[#1a1a1a] mt-0.5 leading-tight break-words">{value}</p>
        {sub && <p className="text-[12px] text-[#aaa] mt-0.5">{sub}</p>}
      </div>
      {href && <ArrowRight size={16} className="hidden sm:block text-[#ccc] mt-1 flex-shrink-0" />}
    </div>
  );
  return href ? <Link href={href} className="block">{card}</Link> : card;
}

const STATUS_COLOR: Record<string, string> = {
  PAID:       "bg-green-100 text-green-700",
  PENDING:    "bg-yellow-100 text-yellow-700",
  FAILED:     "bg-red-100 text-red-600",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-purple-100 text-purple-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-gray-100 text-gray-600",
  REFUNDED:   "bg-orange-100 text-orange-700",
};

export default function AdminDashboard() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard").then(r => r.json())
      .then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({length:8}).map((_,i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-[#e8e8e8] animate-pulse" />
        ))}
      </div>
    </div>
  );

  const s = data?.summary || {};
  const recentOrders    = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a]">Dashboard</h1>
        <p className="text-[14px] text-[#888] mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard label="Total revenue"  value={formatPrice(s.totalRevenue || 0)}
          sub={`This month: ${formatPrice(s.monthRevenue || 0)}`}
          icon={<IndianRupee size={22} className="text-green-600" />}
          color="bg-green-50" />
        <StatCard label="Total orders"   value={s.totalOrders || 0}
          sub={`${s.todayOrders || 0} today · ${s.pendingOrders || 0} pending`}
          icon={<ShoppingBag size={22} className="text-blue-600" />}
          color="bg-blue-50" href="/admin/orders" />
        <StatCard label="Customers"      value={s.totalCustomers || 0}
          icon={<Users size={22} className="text-purple-600" />}
          color="bg-purple-50" href="/admin/customers" />
        <StatCard label="Products"       value={`${s.activeProducts || 0} active`}
          sub={`${s.totalProducts || 0} total`}
          icon={<Package size={22} className="text-orange-600" />}
          color="bg-orange-50" href="/admin/products" />
        <StatCard label="Pending reviews" value={s.pendingReviews || 0}
          icon={<Star size={22} className="text-yellow-600" />}
          color="bg-yellow-50" href="/admin/reviews" />
        <StatCard label="Low stock"      value={s.lowStockCount || 0}
          sub="Items below 5 units"
          icon={<AlertTriangle size={22} className="text-red-500" />}
          color="bg-red-50" />
        <StatCard label="Today's orders" value={s.todayOrders || 0}
          icon={<Clock size={22} className="text-[#c0555a]" />}
          color="bg-[#c0555a]/10" />
        <StatCard label="Pending dispatch" value={s.pendingOrders || 0}
          icon={<CheckCircle size={22} className="text-teal-600" />}
          color="bg-teal-50" href="/admin/orders?deliveryStatus=PROCESSING" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">Recent orders</h2>
            <Link href="/admin/orders" className="text-[12px] text-[#c0555a] font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#f5f5f5]">
            {recentOrders.length === 0 ? (
              <div className="py-10 text-center text-[#aaa] text-[14px]">No orders yet</div>
            ) : recentOrders.map((order: any) => {
              const snap = order.addressSnapshot as any;
              const img  = order.items?.[0]?.product?.images?.[0];
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-[#fafafa] transition-colors">
                  {img && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-[#e8e8e8]">
                      <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">
                      #{order.id} — {snap?.name || order.user?.name || "Guest"}
                    </p>
                    <p className="text-[12px] text-[#888] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col-reverse items-end sm:flex-row sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.paymentStatus] || ""}`}>
                      {order.paymentStatus}
                    </span>
                    <span className="text-[13px] font-bold text-[#1a1a1a]">{formatPrice(order.totalAmount)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">Low stock alert</h2>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="divide-y divide-[#f5f5f5]">
            {lowStockProducts.length === 0 ? (
              <div className="py-10 text-center text-[#aaa] text-[14px]">All products stocked well</div>
            ) : lowStockProducts.map((p: any) => (
              <Link key={p.id} href={`/admin/products`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                {p.images?.[0] && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                    <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                )}
                <p className="text-[13px] text-[#1a1a1a] flex-1 line-clamp-1 capitalize">{p.name}</p>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  p.stock === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                }`}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}