"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, Phone, IndianRupee } from "lucide-react";

const fp = (p: number) => `Rs. ${(p/100).toLocaleString("en-IN")}`;

const COLUMNS = [
  { key: "PROCESSING", label: "Pending",    color: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-400" },
  { key: "CONFIRMED",  label: "Confirmed",  color: "bg-blue-50 border-blue-200",    dot: "bg-blue-500"   },
  { key: "SHIPPED",    label: "Shipped",    color: "bg-purple-50 border-purple-200",dot: "bg-purple-500" },
  { key: "DELIVERED",  label: "Delivered",  color: "bg-green-50 border-green-200",  dot: "bg-green-500"  },
  { key: "CANCELLED",  label: "Cancelled",  color: "bg-gray-50 border-gray-200",    dot: "bg-gray-400"   },
];

export default function KanbanPage() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [dragging, setDragging] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res  = await fetch("/api/admin/orders?limit=100&page=1");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDrop = async (orderId: number, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.deliveryStatus === newStatus) return;
    setUpdating(orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryStatus: newStatus } : o));
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: newStatus }),
      });
    } catch { load(); }
    finally { setUpdating(null); }
  };

  const colOrders = (key: string) => orders.filter(o => o.deliveryStatus === key);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-[#c0555a]" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1a1a]">Order Kanban</h1>
          <p className="text-[13px] text-[#888] mt-0.5">Drag cards to update delivery status</p>
        </div>
        <button onClick={load} className="text-[13px] text-[#c0555a] font-semibold hover:underline">Refresh</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "70vh" }}>
        {COLUMNS.map(col => {
          const colItems = colOrders(col.key);
          return (
            <div key={col.key}
              className={`flex-shrink-0 w-[260px] rounded-2xl border-2 ${col.color} flex flex-col`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const id = parseInt(e.dataTransfer.getData("orderId"));
                handleDrop(id, col.key);
              }}>
              {/* Column header */}
              <div className="px-4 py-3 flex items-center gap-2 border-b border-current border-opacity-10">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className="text-[13px] font-bold text-[#1a1a1a]">{col.label}</span>
                <span className="ml-auto text-[11px] font-bold text-[#888] bg-white px-2 py-0.5 rounded-full">
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "75vh", scrollbarWidth: "none" }}>
                {colItems.map(order => {
                  const snap = order.addressSnapshot as any;
                  const img  = order.items?.[0]?.product?.images?.[0];
                  const isUpdating = updating === order.id;

                  return (
                    <div key={order.id}
                      draggable
                      onDragStart={e => { e.dataTransfer.setData("orderId", String(order.id)); setDragging(order.id); }}
                      onDragEnd={() => setDragging(null)}
                      className={`bg-white rounded-xl border border-[#e8e8e8] p-3.5 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                        dragging === order.id ? "opacity-50 rotate-1" : ""
                      } ${isUpdating ? "animate-pulse" : ""}`}>

                      {/* Order header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-bold text-[#c0555a]">#{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "PAID" ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"}`}>
                          {order.paymentStatus}
                        </span>
                      </div>

                      {/* Product preview */}
                      {img && (
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-[#e8e8e8]">
                            <Image src={img} alt="" fill className="object-cover" sizes="40px" />
                          </div>
                          <p className="text-[11px] text-[#555] line-clamp-2 flex-1">
                            {order.items?.[0]?.product?.name}
                            {order._count?.items > 1 && ` +${order._count.items - 1} more`}
                          </p>
                        </div>
                      )}

                      {/* Customer */}
                      <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{snap?.name || order.user?.name || "Guest"}</p>
                      {snap?.phone && (
                        <p className="text-[11px] text-[#888] flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {snap.phone}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f5f5f5]">
                        <span className="text-[13px] font-bold text-[#1a1a1a]">{fp(order.totalAmount)}</span>
                        <span className="text-[10px] text-[#aaa]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                        </span>
                      </div>

                      {/* Quick status buttons */}
                      <div className="flex gap-1.5 mt-2.5">
                        {COLUMNS.filter(c => c.key !== col.key && c.key !== "CANCELLED").slice(0,2).map(c => (
                          <button key={c.key} onClick={() => handleDrop(order.id, c.key)}
                            className="flex-1 text-[9px] font-bold py-1 rounded-lg border border-[#e8e8e8] text-[#888] hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                            → {c.label}
                          </button>
                        ))}
                        {snap?.phone && (
                          <a href={`https://wa.me/${snap.phone.replace(/\D/g,"")}?text=Hi ${snap.name}! Your order %23${order.id} status: ${col.label}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-2 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold hover:bg-[#25D366]/20 transition-all">
                            WA
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colItems.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-[12px] text-[#ccc] text-center py-8">Drop orders here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}