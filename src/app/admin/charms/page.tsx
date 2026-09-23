"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, Sparkles, ImagePlus, CheckCircle, X, ToggleLeft, ToggleRight } from "lucide-react";

interface Charm {
  id: number; name: string; number: number;
  image: string; active: boolean;
}

// Default charms from The Black Box Co. (seeded if DB is empty)
const DEFAULT_CHARMS = [
  { number: 1,  name: "Plane" },       { number: 2,  name: "Jet" },
  { number: 3,  name: "Compass" },     { number: 4,  name: "Anchor" },
  { number: 5,  name: "Sailor Helm" }, { number: 6,  name: "King" },
  { number: 7,  name: "Queen" },       { number: 8,  name: "Mr." },
  { number: 9,  name: "Mrs." },        { number: 10, name: "Love" },
  { number: 11, name: "Camera" },      { number: 12, name: "Bulb" },
  { number: 13, name: "Glasses" },     { number: 14, name: "Music" },
  { number: 15, name: "Earth" },       { number: 16, name: "Cap" },
  { number: 17, name: "Star" },        { number: 18, name: "Peace" },
  { number: 19, name: "Coffee" },      { number: 20, name: "Beer" },
  { number: 21, name: "Dog" },         { number: 22, name: "Butterfly" },
  { number: 23, name: "Vintage Car" }, { number: 24, name: "Car" },
  { number: 25, name: "Scooter" },     { number: 26, name: "Boy" },
  { number: 27, name: "Girl" },        { number: 28, name: "Elephant" },
  { number: 29, name: "Owl" },
];

export default function AdminCharmsPage() {
  const [charms,    setCharms]    = useState<Charm[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success,   setSuccess]   = useState("");
  const [form, setForm] = useState({ name: "", number: "", image: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const res  = await fetch("/api/admin/charms");
    const data = await res.json();
    setCharms(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm(p => ({ ...p, image: data.url }));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.number || !form.image) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/charms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, number: Number(form.number), image: form.image }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Charm added!");
        setForm({ name: "", number: "", image: "" });
        setShowForm(false);
        load();
        setTimeout(() => setSuccess(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (charm: Charm) => {
    await fetch(`/api/admin/charms/${charm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !charm.active }),
    });
    load();
  };

  const deleteCharm = async (id: number) => {
    if (!confirm("Delete this charm?")) return;
    await fetch(`/api/admin/charms/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a]">Charms</h1>
          <p className="text-[13px] text-[#888] mt-0.5">Manage charms available for personalised products</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
          <Plus size={15} /> Add charm
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-[13px] px-4 py-3 rounded-xl mb-5">
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">Add new charm</h2>
            <button onClick={() => setShowForm(false)} className="text-[#aaa] hover:text-[#555]"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Number *</label>
              <input type="number" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))}
                placeholder="30" className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a]" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Heart" className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a]" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Image *</label>
              <div className="flex gap-2">
                <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="URL or upload →" className="flex-1 border border-[#e8e0d5] rounded-xl px-3 py-3 text-[12px] outline-none focus:border-[#c0555a]" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 border border-[#e8e0d5] rounded-xl text-[#555] hover:border-[#c0555a] transition-all">
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </div>
              {form.image && (
                <img src={form.image} alt="" className="w-12 h-12 mt-2 rounded-lg object-contain bg-[#f3efe8] border border-[#e8e0d5]" />
              )}
            </div>
          </div>
          <button onClick={save} disabled={saving || !form.name || !form.number || !form.image}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all">
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><CheckCircle size={13} /> Add charm</>}
          </button>
        </div>
      )}

      {/* Charms grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#c0555a]" />
        </div>
      ) : charms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-12 text-center">
          <Sparkles size={36} className="text-[#e8e0d5] mx-auto mb-3" />
          <p className="text-[15px] font-bold text-[#1a1a1a] mb-2">No charms yet</p>
          <p className="text-[13px] text-[#888] mb-5">Add your first charm to get started</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
            <Plus size={14} /> Add first charm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
          {charms.map(charm => (
            <div key={charm.id} className={`bg-white rounded-2xl border p-3 text-center group relative transition-all ${charm.active ? "border-[#e8e0d5]" : "border-[#f0ece6] opacity-50"}`}>
              <div className="relative w-14 h-14 mx-auto mb-2">
                <Image src={charm.image} alt={charm.name} fill className="object-contain" sizes="56px" />
              </div>
              <p className="text-[10px] font-bold text-[#1a1a1a] truncate">{charm.number} - {charm.name}</p>
              {/* Actions on hover */}
              <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-1">
                <button onClick={() => toggleActive(charm)} title={charm.active ? "Deactivate" : "Activate"}
                  className="w-5 h-5 rounded-full bg-white border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-[#c0555a] transition-all shadow-sm">
                  {charm.active ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
                </button>
                <button onClick={() => deleteCharm(charm.id)}
                  className="w-5 h-5 rounded-full bg-white border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-red-500 transition-all shadow-sm">
                  <Trash2 size={9} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-5">
        <p className="text-[12px] font-bold text-[#1a1a1a] mb-2">How charms work</p>
        <div className="flex flex-col gap-1.5 text-[12px] text-[#666]">
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Enable "Has charm option" on a product → charm selector appears on the product page</p>
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Customer picks their charm → saved with the order</p>
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Deactivate a charm to hide it without deleting</p>
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Add new charms anytime — they appear instantly on all charm-enabled products</p>
        </div>
      </div>
    </div>
  );
}