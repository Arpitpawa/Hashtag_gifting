"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Tag, CheckCircle, X } from "lucide-react";

function formatPrice(p: number) { return `Rs. ${(p/100).toLocaleString("en-IN")}`; }

export default function AdminCoupons() {
  const [coupons,  setCoupons]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<number|null>(null);
  const [form, setForm] = useState({
    code: "", type: "PERCENT", value: "", minAmount: "",
    usageLimit: "", isActive: true, expiresAt: "",
  });

  const load = async () => {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(Array.isArray(data) ? data : (data.coupons || []));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value:      parseInt(form.value) * (form.type === "PERCENT" ? 1 : 100),
        minAmount:  form.minAmount ? parseInt(form.minAmount) * 100 : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        expiresAt:  form.expiresAt || null,
      }),
    });
    setForm({ code:"", type:"PERCENT", value:"", minAmount:"", usageLimit:"", isActive:true, expiresAt:"" });
    setShowForm(false); setSaving(false); load();
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    setDeleting(id);
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load(); setDeleting(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-[#1a1a1a]">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
          <Plus size={15} /> Create coupon
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-[#1a1a1a]">New coupon</h3>
            <button onClick={() => setShowForm(false)} className="text-[#aaa] hover:text-[#555]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {[
              { key:"code",       label:"Code",          placeholder:"e.g. WELCOME10",   upper:true },
              { key:"value",      label:"Value",         placeholder:"10 (% or amount)"             },
              { key:"minAmount",  label:"Min order (Rs)",placeholder:"e.g. 500"                     },
              { key:"usageLimit", label:"Usage limit",   placeholder:"Leave blank = unlimited"      },
              { key:"expiresAt",  label:"Expires",       type:"date"                                },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider block mb-1">{f.label}</label>
                <input type={f.type || "text"} placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({...p, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value}))}
                  className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a]" />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white">
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat amount (Rs.)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving || !form.code || !form.value}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><CheckCircle size={13} /> Save coupon</>}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-[#e8e8e8] text-[#555] text-[13px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#c0555a]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
              <tr>
                {["Code","Type","Value","Min order","Used","Limit","Expires","Status",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {coupons.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[#aaa]">No coupons yet</td></tr>
              ) : coupons.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3 font-bold text-[#1a1a1a] flex items-center gap-2"><Tag size={13} className="text-[#c0555a]" />{c.code}</td>
                  <td className="px-4 py-3 text-[#888]">{c.type}</td>
                  <td className="px-4 py-3 font-semibold">{c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}</td>
                  <td className="px-4 py-3">{c.minAmount ? formatPrice(c.minAmount) : "—"}</td>
                  <td className="px-4 py-3">{c.usedCount || 0}</td>
                  <td className="px-4 py-3">{c.usageLimit || "∞"}</td>
                  <td className="px-4 py-3 text-[#888]">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteCoupon(c.id)} disabled={deleting === c.id}
                      className="w-7 h-7 rounded-lg border border-[#e8e8e8] flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-[#888] disabled:opacity-40">
                      {deleting === c.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    </button>
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