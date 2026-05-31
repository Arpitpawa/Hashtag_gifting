"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Plus, Edit2, Trash2, Loader2, CheckCircle, X, Eye, EyeOff } from "lucide-react";

function formatPrice(p: number) { return `Rs. ${(p/100).toLocaleString("en-IN")}`; }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState<number|null>(null);
  const [toggling, setToggling] = useState<number|null>(null);

  const load = async () => {
    setLoading(true);
    const res  = await fetch("/api/admin/products");
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setProducts(list); setFiltered(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSearch = (q: string) => {
    setSearch(q);
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase())));
  };

  const toggleStatus = async (p: any) => {
    setToggling(p.id);
    const newStatus = p.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await load(); setToggling(null);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    await load(); setDeleting(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-[#1a1a1a]">Products</h1>
        <a href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
          <Plus size={15} /> Add product
        </a>
      </div>

      {/* Search + stats */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 mb-5 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-4 py-2.5 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-[#c0555a]" />
        </div>
        <p className="text-[13px] text-[#888] flex-shrink-0">{filtered.length} products</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#c0555a]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
              <tr>
                {["Product","Category","Price","Stock","Status","Sales","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-[#e8e8e8]">
                          <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-[#1a1a1a] capitalize line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-[#aaa]">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{formatPrice(p.price)}</p>
                    {p.comparePrice && <p className="text-[11px] text-[#aaa] line-through">{formatPrice(p.comparePrice)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      p.stock === 0 ? "bg-red-100 text-red-600"
                      : p.stock < 5 ? "bg-orange-100 text-orange-600"
                      : "bg-green-100 text-green-700"
                    }`}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(p)} disabled={toggling === p.id}
                      className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                        p.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      {toggling === p.id ? <Loader2 size={10} className="animate-spin" />
                        : p.status === "ACTIVE" ? <Eye size={10} /> : <EyeOff size={10} />}
                      {p.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{p._count?.orderItems || 0} sold</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/products/${p.id}/edit`}
                        className="w-8 h-8 rounded-lg border border-[#e8e8e8] flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all text-[#555]">
                        <Edit2 size={13} />
                      </a>
                      <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id}
                        className="w-8 h-8 rounded-lg border border-[#e8e8e8] flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-[#555] disabled:opacity-40">
                        {deleting === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
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