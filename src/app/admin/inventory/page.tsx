"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Package, AlertTriangle, CheckCircle, Loader2, Download } from "lucide-react";

const fp = (p: number) => `Rs. ${(p/100).toLocaleString("en-IN")}`;

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState<Record<number, boolean>>({});
  const [edits,    setEdits]    = useState<Record<number, number>>({});
  const [filter,   setFilter]   = useState<"all"|"low"|"out">("all");
  const [saved,    setSaved]    = useState<Set<number>>(new Set());

  const load = async () => {
    const res  = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStock = async (id: number) => {
    if (edits[id] === undefined) return;
    setSaving(p => ({ ...p, [id]: true }));
    const newStock = edits[id];
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock }),
    });

    // Auto-trigger stock notifications if restocked from 0
    if (newStock > 0) {
      const res  = await fetch("/api/admin/stock-notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (data.sent > 0) {
        alert(`✅ Stock updated! ${data.sent} customer${data.sent > 1 ? "s" : ""} notified by email that "${data.product}" is back in stock.`);
      }
    }

    setSaving(p => ({ ...p, [id]: false }));
    setSaved(p => new Set([...p, id]));
    setTimeout(() => setSaved(p => { const n = new Set(p); n.delete(id); return n; }), 2000);
    load();
  };

  const exportCSV = () => {
    const rows = [["Name","SKU","Stock","Price","Status"]];
    products.forEach(p => rows.push([p.name, p.slug, p.stock, (p.price/100).toString(), p.status]));
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a    = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "inventory.csv"; a.click();
  };

  const filtered = products.filter(p =>
    filter === "out" ? p.stock === 0 :
    filter === "low" ? p.stock > 0 && p.stock < 10 : true
  );

  const lowCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1a1a]">Inventory</h1>
          <p className="text-[13px] text-[#888] mt-0.5">{products.length} products · {lowCount} low · {outCount} out of stock</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#e8e8e8] text-[13px] font-semibold text-[#555] rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all bg-white">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key:"all", label:`All (${products.length})` },
          { key:"low", label:`⚠️ Low stock (${lowCount})` },
          { key:"out", label:`❌ Out of stock (${outCount})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
              filter === f.key ? "bg-[#c0555a] text-white" : "bg-white border border-[#e8e8e8] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
            }`}>{f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#c0555a]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
              <tr>
                {["Product","Category","Price","Current stock","Update stock","Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {filtered.map(p => (
                <tr key={p.id} className={`hover:bg-[#fafafa] transition-colors ${p.stock === 0 ? "bg-red-50/30" : p.stock < 10 ? "bg-orange-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-[#e8e8e8]">
                          <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />
                        </div>
                      ) : <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex-shrink-0" />}
                      <p className="font-semibold text-[#1a1a1a] capitalize line-clamp-1">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 font-semibold">{fp(p.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.stock === 0
                        ? <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                        : p.stock < 10
                        ? <AlertTriangle size={14} className="text-orange-500 flex-shrink-0" />
                        : <Package size={14} className="text-green-500 flex-shrink-0" />}
                      <span className={`font-bold ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-orange-500" : "text-green-700"}`}>
                        {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input type="number" min="0"
                        placeholder={String(p.stock)}
                        value={edits[p.id] !== undefined ? edits[p.id] : ""}
                        onChange={e => setEdits(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                        className="w-20 border border-[#e8e8e8] rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-[#c0555a] text-center"
                      />
                      <button onClick={() => updateStock(p.id)}
                        disabled={saving[p.id] || edits[p.id] === undefined}
                        className="px-3 py-1.5 bg-[#c0555a] text-white text-[12px] font-bold rounded-lg hover:bg-[#a84449] disabled:opacity-40 transition-all whitespace-nowrap">
                        {saving[p.id] ? <Loader2 size={11} className="animate-spin" />
                          : saved.has(p.id) ? <CheckCircle size={11} />
                          : "Update"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}