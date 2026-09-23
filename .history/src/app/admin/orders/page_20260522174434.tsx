"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter }        from "next/navigation";
import Image from "next/image";
import {
  Search, ChevronLeft, ChevronRight,
  Loader2, Phone, MapPin, Package,
  CheckCircle, X,
} from "lucide-react";
import { Suspense } from "react";

function formatPrice(p: number) { return `Rs. ${(p/100).toLocaleString("en-IN")}`; }

const STATUS_COLOR: Record<string,string> = {
  PAID:       "bg-green-100 text-green-700",
  PENDING:    "bg-yellow-100 text-yellow-700",
  FAILED:     "bg-red-100 text-red-600",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-purple-100 text-purple-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-gray-100 text-gray-600",
  COD:        "bg-orange-100 text-orange-700",
};

const DELIVERY_STATUSES = ["PROCESSING","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"];
const PAYMENT_STATUSES  = ["PENDING","PAID","FAILED","REFUNDED"];

function OrdersContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [orders,  setOrders]  = useState<any[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const page    = parseInt(searchParams.get("page") || "1");
  const search  = searchParams.get("search") || "";
  const dStatus = searchParams.get("deliveryStatus") || "all";
  const pStatus = searchParams.get("paymentStatus")  || "all";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search)  params.set("search",  search);
      if (dStatus !== "all") params.set("deliveryStatus", dStatus);
      if (pStatus !== "all") params.set("paymentStatus",  pStatus);
      const res  = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }, [page, search, dStatus, pStatus]);

  useEffect(() => { load(); }, [load]);

  const updateUrl = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k,v]) => { if(v) p.set(k,v); else p.delete(k); });
    p.delete("page");
    router.push(`/admin/orders?${p.toString()}`);
  };

  const updateOrder = async (orderId: number, field: string, value: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      setSelected((prev: any) => prev ? { ...prev, [field]: value } : null);
      await load();
    } finally { setUpdating(false); }
  };

  const totalPages = Math.ceil(total / 20);
  const snap = selected?.addressSnapshot as any;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-6">Orders</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input placeholder="Search by order ID, name, email..." defaultValue={search}
            onKeyDown={e => { if(e.key==="Enter") updateUrl({ search: (e.target as HTMLInputElement).value }); }}
            className="w-full pl-8 pr-4 py-2.5 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-[#c0555a]" />
        </div>
        <select value={dStatus} onChange={e => updateUrl({ deliveryStatus: e.target.value })}
          className="border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white">
          <option value="all">All delivery status</option>
          {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={pStatus} onChange={e => updateUrl({ paymentStatus: e.target.value })}
          className="border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white">
          <option value="all">All payment status</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex gap-5">
        {/* Orders list */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[#c0555a]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-[#aaa] text-[14px]">No orders found</div>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
                  <tr>
                    {["Order","Customer","Items","Total","Payment","Delivery","Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f5]">
                  {orders.map((o: any) => {
                    const addr = o.addressSnapshot as any;
                    return (
                      <tr key={o.id} onClick={() => setSelected(o)}
                        className="hover:bg-[#fafafa] cursor-pointer transition-colors">
                        <td className="px-4 py-3 font-bold text-[#c0555a]">#{o.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1a1a1a]">{addr?.name || o.user?.name || "Guest"}</p>
                          <p className="text-[11px] text-[#aaa]">{o.user?.email || "—"}</p>
                        </td>
                        <td className="px-4 py-3">{o._count?.items || o.items?.length || "—"}</td>
                        <td className="px-4 py-3 font-semibold">{formatPrice(o.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.paymentStatus] || ""}`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.deliveryStatus] || ""}`}>
                            {o.deliveryStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#888] whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"short"})}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-[13px] text-[#888]">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => updateUrl({ page: String(page-1) })} disabled={page===1}
                  className="w-8 h-8 rounded-lg border border-[#e8e8e8] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] disabled:opacity-40 transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => updateUrl({ page: String(page+1) })} disabled={page===totalPages}
                  className="w-8 h-8 rounded-lg border border-[#e8e8e8] bg-white flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] disabled:opacity-40 transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order detail panel */}
        {selected && (
          <div className="w-[320px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#e8e8e8] sticky top-6">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="text-[14px] font-bold text-[#1a1a1a]">Order #{selected.id}</h3>
                <button onClick={() => setSelected(null)} className="text-[#aaa] hover:text-[#555]">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Address */}
                {snap && (
                  <div>
                    <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MapPin size={11} /> Delivery address
                    </p>
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">{snap.name}</p>
                    <p className="text-[12px] text-[#666]">{snap.street}</p>
                    <p className="text-[12px] text-[#666]">{snap.city}, {snap.state} - {snap.pincode}</p>
                    <p className="text-[12px] text-[#888] flex items-center gap-1 mt-1"><Phone size={11}/>{snap.phone}</p>
                  </div>
                )}

                {/* Items */}
                {selected.items?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Package size={11} /> Items ({selected.items.length})
                    </p>
                    {selected.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        {item.product?.images?.[0] && (
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                            <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="36px" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-[#1a1a1a] line-clamp-1 capitalize">{item.product?.name}</p>
                          <p className="text-[11px] text-[#888]">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-[13px] font-bold pt-2 border-t border-[#f0f0f0]">
                  <span>Total</span>
                  <span className="text-[#c0555a]">{formatPrice(selected.totalAmount)}</span>
                </div>

                {/* Update status */}
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Payment status</label>
                    <select value={selected.paymentStatus}
                      onChange={e => updateOrder(selected.id, "paymentStatus", e.target.value)}
                      disabled={updating}
                      className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white disabled:opacity-50">
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Delivery status</label>
                    <select value={selected.deliveryStatus}
                      onChange={e => updateOrder(selected.id, "deliveryStatus", e.target.value)}
                      disabled={updating}
                      className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white disabled:opacity-50">
                      {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {updating && <p className="text-[12px] text-[#c0555a] flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Updating...</p>}
                </div>

                {/* WhatsApp */}
                <a href={`https://wa.me/${snap?.phone?.replace(/\D/g,"")}?text=Hi ${snap?.name}! Your Hashtag Gifting order %23${selected.id} has been ${selected.deliveryStatus.toLowerCase()}.`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-[13px] font-semibold rounded-full hover:bg-[#1da851] transition-colors">
                  <Phone size={14} /> Notify on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return <Suspense fallback={<div className="p-8"><Loader2 size={24} className="animate-spin text-[#c0555a]" /></div>}>
    <OrdersContent />
  </Suspense>;
}