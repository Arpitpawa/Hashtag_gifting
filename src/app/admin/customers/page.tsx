"use client";

import { useEffect, useState } from "react";
import { Search, Mail, Phone, ShoppingBag, Loader2 } from "lucide-react";

function formatPrice(p: number) { return `Rs. ${(p/100).toLocaleString("en-IN")}`; }

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered,  setFiltered]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    fetch("/api/admin/customers").then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : (data.customers || []);
      setCustomers(list); setFiltered(list);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (q: string) => {
    setSearch(q);
    setFiltered(customers.filter(c =>
      c.name?.toLowerCase().includes(q.toLowerCase()) ||
      c.email?.toLowerCase().includes(q.toLowerCase()) ||
      c.phone?.includes(q)
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a] mb-6">Customers</h1>

      <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 mb-5 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-8 pr-4 py-2.5 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-[#c0555a]" />
        </div>
        <p className="text-[13px] text-[#888] flex-shrink-0">{filtered.length} customers</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#c0555a]" />
        </div>
      ) : (
        <>
        {/* ── MOBILE: card list ── */}
        <div className="md:hidden space-y-2.5">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-[#e8e8e8] p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c0555a] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
                  {c.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1a1a1a] text-[14px] truncate">{c.name || "—"}</p>
                  <p className="text-[12px] text-[#666] truncate flex items-center gap-1.5"><Mail size={11} className="flex-shrink-0" />{c.email}</p>
                  {c.phone && <p className="text-[12px] text-[#888] flex items-center gap-1.5"><Phone size={11} className="flex-shrink-0" />{c.phone}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f3f3f3] text-[12px]">
                <span className="flex items-center gap-1 text-[#555]"><ShoppingBag size={12} /> {c._count?.orders || 0} orders</span>
                <span className="font-bold text-[#1a1a1a]">{formatPrice(c.orders?.reduce((s: number, o: any) => s + o.totalAmount, 0) || 0)}</span>
                <span className="text-[#999]">{new Date(c.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}</span>
              </div>
            </div>
          ))}
        </div>
        {/* ── DESKTOP: table ── */}
        <div className="hidden md:block bg-white rounded-2xl border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
              <tr>
                {["Customer","Contact","Orders","Total spent","Joined"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#c0555a] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                        {c.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <p className="font-semibold text-[#1a1a1a]">{c.name || "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[#555]"><Mail size={12} />{c.email}</p>
                    {c.phone && <p className="flex items-center gap-1.5 text-[#888] mt-0.5"><Phone size={12} />{c.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-[#555]">
                      <ShoppingBag size={12} /> {c._count?.orders || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(c.orders?.reduce((s: number, o: any) => s + o.totalAmount, 0) || 0)}
                  </td>
                  <td className="px-4 py-3 text-[#888]">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}