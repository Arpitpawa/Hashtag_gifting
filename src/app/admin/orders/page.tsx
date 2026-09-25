"use client";

import { useEffect, useState, useCallback } from "react";
import AdminSelect from "@/components/admin/AdminSelect";
import { useSearchParams, useRouter }        from "next/navigation";
import Image from "next/image";
import {
  Search, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { Suspense } from "react";

function formatPrice(p: number) { return `Rs. ${Math.round(p/100).toLocaleString("en-IN")}`; }

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

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a] mb-4 sm:mb-6">Orders</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-full sm:min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input placeholder="Search by order ID, name, email..." defaultValue={search}
            onKeyDown={e => { if(e.key==="Enter") updateUrl({ search: (e.target as HTMLInputElement).value }); }}
            className="w-full pl-8 pr-4 py-2.5 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-[#c0555a]" />
        </div>
        <AdminSelect value={dStatus} onChange={e => updateUrl({ deliveryStatus: e.target.value })}
          className="flex-1 min-w-[140px] border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white">
          <option value="all">All delivery status</option>
          {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </AdminSelect>
        <AdminSelect value={pStatus} onChange={e => updateUrl({ paymentStatus: e.target.value })}
          className="flex-1 min-w-[140px] border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white">
          <option value="all">All payment status</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </AdminSelect>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#c0555a]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-[#aaa] text-[14px]">No orders found</div>
        ) : (
          <>
          {/* ── MOBILE: card list ── */}
          <div className="md:hidden divide-y divide-[#f3f3f3]">
            {orders.map((o: any) => {
              const addr = o.addressSnapshot as any;
              return (
                <button key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)}
                  className="w-full text-left p-3.5 flex gap-3 active:bg-[#fafafa]">
                  {o.items?.[0]?.product?.images?.[0] ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                      <Image src={o.items[0].product.images[0]} alt="" fill className="object-cover" sizes="56px" />
                      {o.items.length > 1 && (
                        <span className="absolute bottom-0 right-0 bg-[#1a1a1a] text-white text-[9px] font-bold rounded-tl-lg px-1.5 py-0.5">+{o.items.length - 1}</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#f5f5f5] flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#c0555a] text-[13px]">#{o.id}</span>
                      <span className="text-[11px] text-[#999]">{new Date(o.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"short"})}</span>
                    </div>
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{addr?.name || o.user?.name || "Guest"}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[13px] font-bold text-[#1a1a1a] mr-1">{formatPrice(o.totalAmount)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.paymentStatus] || ""}`}>{o.paymentStatus}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[o.deliveryStatus] || ""}`}>{o.deliveryStatus}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {/* ── DESKTOP: table ── */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
              <tr>
                {["Order","Product","Customer","Items","Total","Payment","Delivery","Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {orders.map((o: any) => {
                const addr = o.addressSnapshot as any;
                return (
                  <tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)}
                    className="hover:bg-[#fafafa] cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-bold text-[#c0555a]">#{o.id}</td>
                    <td className="px-4 py-3">
                      {o.items?.[0]?.product?.images?.[0] ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                          <Image src={o.items[0].product.images[0]} alt="" fill className="object-cover" sizes="40px" />
                          {o.items.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-[#1a1a1a] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              +{o.items.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#f5f5f5]" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1a1a1a]">{addr?.name || o.user?.name || "Guest"}</p>
                      <p className="text-[11px] text-[#aaa]">{o.user?.email || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {o._count?.items || o.items?.length || "—"}
                      {o.items?.[0]?.product?.sku && (
                        <p className="text-[10px] text-[#aaa] font-mono">{o.items[0].product.sku}{o.items.length > 1 ? " +" : ""}</p>
                      )}
                    </td>
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
          </div>
          </>
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
  );
}

export default function OrdersPage() {
  return <Suspense fallback={<div className="p-8"><Loader2 size={24} className="animate-spin text-[#c0555a]" /></div>}>
    <OrdersContent />
  </Suspense>;
}
