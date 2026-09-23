"use client";

import { useEffect, useState, useRef } from "react";
import AdminSelect from "@/components/admin/AdminSelect";
import Image from "next/image";
import {
  Plus, Trash2, Loader2, FolderOpen, FolderTree,
  ExternalLink, Edit2, CheckCircle, X, ImagePlus,
  ChevronRight, Package, AlertTriangle, Eye, EyeOff,
} from "lucide-react";

interface Category {
  id:          number;
  name:        string;
  slug:        string;
  description: string | null;
  image:       string | null;
  parentId:    number | null;
  showInNav:   boolean;
  navOrder:    number;
  children:    Category[];
  _count:      { products: number };
}

const EMPTY_FORM = {
  name: "", description: "", image: "", parentId: "", showInNav: false, navOrder: "0",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<number | null>(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [moving,     setMoving]     = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name:        cat.name,
      description: cat.description ?? "",
      image:       cat.image ?? "",
      parentId:    cat.parentId ? String(cat.parentId) : "",
      showInNav:   cat.showInNav,
      navOrder:    String(cat.navOrder ?? 0),
    });
    setEditingId(cat.id);
    setError("");
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "categories");
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm(p => ({ ...p, image: data.url }));
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) { setError("Category name is required"); return; }
    setSaving(true); setError("");
    try {
      const url    = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name.trim(),
          description: form.description.trim() || null,
          image:       form.image.trim() || null,
          parentId:    form.parentId ? Number(form.parentId) : null,
          showInNav:   form.showInNav,
          navOrder:    form.navOrder ? Number(form.navOrder) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      setSuccess(editingId ? "Category updated!" : "Category created! Page is now live at /category/" + data.category?.slug);
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      setEditingId(null);
      load();
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: number, name: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Cannot delete "${name}" — it has ${productCount} product(s). Move them to another category first.`);
      return;
    }
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to delete category — check the server logs for details.");
      }
    } catch {
      alert("Failed to delete category — check your connection and try again.");
    } finally {
      await load();
      setDeleting(null);
    }
  };

  // Flat list of all categories for parent dropdown
  const allFlat = categories.flatMap(c => [c, ...(c.children || [])]);

  // Quick re-parent — used by the "Move to" dropdown on each row, so
  // reorganizing a bunch of top-level categories into subcategories
  // doesn't require opening the full edit form for each one.
  const moveCategory = async (cat: Category, newParentId: string) => {
    if ((cat.parentId ? String(cat.parentId) : "") === newParentId) return;
    setMoving(cat.id);
    try {
      const res  = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        cat.name,
          description: cat.description,
          image:       cat.image,
          parentId:    newParentId ? Number(newParentId) : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) alert(data.error || "Failed to move category.");
    } catch {
      alert("Failed to move category — check your connection and try again.");
    } finally {
      await load();
      setMoving(null);
    }
  };

  // Quick show/hide-in-nav toggle — used by the eye icon on each row, so
  // curating the navbar doesn't require opening the full edit form.
  const toggleNavVisibility = async (cat: Category) => {
    setMoving(cat.id);
    try {
      const res  = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        cat.name,
          description: cat.description,
          image:       cat.image,
          parentId:    cat.parentId,
          showInNav:   !cat.showInNav,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) alert(data.error || "Failed to update category.");
    } catch {
      alert("Failed to update category — check your connection and try again.");
    } finally {
      await load();
      setMoving(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a]">Categories</h1>
          <p className="text-[13px] text-[#888] mt-0.5">
            Each category automatically creates a page at /category/slug
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all"
        >
          <Plus size={15} /> New category
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-[13px] px-4 py-3 rounded-xl mb-5">
          <CheckCircle size={14} className="flex-shrink-0" />
          {success}
        </div>
      )}

      {/* ── Create / Edit Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">
              {editingId ? "Edit category" : "New category"}
            </h2>
            <button onClick={() => { setShowForm(false); setError(""); }}
              className="text-[#aaa] hover:text-[#555]">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">
                Category name *
              </label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Personalised Diaries"
                className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
              />
              {form.name && (
                <p className="text-[11px] text-[#aaa] mt-1">
                  Page will be live at:{" "}
                  <span className="text-[#c0555a] font-medium">
                    /category/{form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
                  </span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">
                Description (optional — shows on category page)
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2}
                placeholder="e.g. Beautiful personalised diaries and notebooks for every occasion"
                className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] transition-colors resize-none"
              />
            </div>

            {/* Parent category */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">
                Parent category (optional)
              </label>
              <AdminSelect
                value={form.parentId}
                onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] bg-white"
              >
                <option value="">None (top-level category)</option>
                {categories
                  .filter(c => !c.parentId && c.id !== editingId)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                }
              </AdminSelect>
            </div>

            {/* Image */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">
                Category image (optional)
              </label>
              <div className="flex gap-2">
                <input
                  value={form.image}
                  onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="Paste image URL or upload →"
                  className="flex-1 border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a]"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 border border-[#e8e0d5] rounded-xl text-[#555] hover:border-[#c0555a] hover:text-[#c0555a] transition-all flex-shrink-0"
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                </button>
                <input
                  ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </div>
              {form.image && (
                <div className="relative w-16 h-16 mt-2 rounded-xl overflow-hidden border border-[#e8e0d5]">
                  <Image src={form.image} alt="" fill className="object-cover" sizes="64px" />
                </div>
              )}
            </div>

            {/* Show in navbar */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">
                Storefront navbar
              </label>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, showInNav: !p.showInNav }))}
                className="flex items-center gap-2.5 border border-[#e8e0d5] rounded-xl px-4 py-3 w-full hover:border-[#c0555a] transition-colors"
              >
                <span
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.showInNav ? "bg-[#c0555a]" : "bg-[#e0dcd3]"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.showInNav ? "translate-x-4" : "translate-x-0"}`}
                  />
                </span>
                <span className="text-[13px] text-[#555] font-medium">
                  {form.showInNav ? "Shown in navbar" : "Hidden from navbar"}
                </span>
              </button>
            </div>

            {/* Nav order */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">
                Nav order (lower shows first)
              </label>
              <input
                type="number"
                value={form.navOrder}
                onChange={e => setForm(p => ({ ...p, navOrder: e.target.value }))}
                placeholder="0"
                className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-500 font-medium mb-3">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all"
            >
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                : <><CheckCircle size={13} /> {editingId ? "Update category" : "Create category"}</>
              }
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-5 py-2.5 border border-[#e8e0d5] text-[#555] text-[13px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Categories List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#c0555a]" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-12 text-center">
          <FolderOpen size={36} className="text-[#e8e0d5] mx-auto mb-3" />
          <p className="text-[15px] font-bold text-[#1a1a1a] mb-2">No categories yet</p>
          <p className="text-[13px] text-[#888] mb-5">
            Create your first category — a page will automatically go live at /category/slug
          </p>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
            <Plus size={14} /> Create first category
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden">

              {/* Parent category row */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                {/* Image */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#f3efe8] flex-shrink-0 border border-[#e8e0d5]">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderTree size={18} className="text-[#ccc]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[150px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold text-[#1a1a1a]">{cat.name}</p>
                    {cat.children?.length > 0 && (
                      <span className="text-[10px] text-[#888] bg-[#f3efe8] px-2 py-0.5 rounded-full">
                        {cat.children.length} subcategories
                      </span>
                    )}
                    {!cat.showInNav && (
                      <span className="flex items-center gap-1 text-[10px] text-[#aaa] bg-[#f3efe8] px-2 py-0.5 rounded-full">
                        <EyeOff size={9} /> Hidden from navbar
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <p className="text-[12px] text-[#aaa]">/category/{cat.slug}</p>
                    <span className="flex items-center gap-1 text-[11px] text-[#888]">
                      <Package size={10} /> {cat._count.products} products
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-[12px] text-[#888] mt-0.5 truncate max-w-md">{cat.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start border-t border-[#f5f0eb] pt-3 sm:border-0 sm:pt-0">
                  <div className="relative">
                    <AdminSelect
                      value={cat.parentId ? String(cat.parentId) : ""}
                      onChange={e => moveCategory(cat, e.target.value)}
                      disabled={moving === cat.id}
                      title="Move to another category"
                      className="appearance-none border border-[#e8e0d5] rounded-xl pl-3 pr-7 py-2 text-[12px] outline-none focus:border-[#c0555a] bg-white text-[#555] cursor-pointer disabled:opacity-40 max-w-[160px] mr-auto sm:mr-0"
                    >
                      <option value="">Top-level</option>
                      {categories
                        .filter(c => c.id !== cat.id)
                        .map(c => (
                          <option key={c.id} value={c.id}>Move under: {c.name}</option>
                        ))
                      }
                    </AdminSelect>
                    {moving === cat.id
                      ? <Loader2 size={12} className="animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c0555a] pointer-events-none" />
                      : null
                    }
                  </div>
                  <button
                    onClick={() => toggleNavVisibility(cat)}
                    disabled={moving === cat.id}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all disabled:opacity-40 ${cat.showInNav ? "border-[#e8e0d5] text-[#555] hover:text-[#c0555a] hover:border-[#c0555a]" : "border-[#e8e0d5] text-[#ccc] hover:text-[#555]"}`}
                    title={cat.showInNav ? "Showing in navbar — click to hide" : "Hidden from navbar — click to show"}
                  >
                    {moving === cat.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : cat.showInNav ? <Eye size={13} /> : <EyeOff size={13} />
                    }
                  </button>
                  <a
                    href={`/category/${cat.slug}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-[#c0555a] hover:border-[#c0555a] transition-all"
                    title="View page"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-8 h-8 rounded-xl border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-all"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id, cat.name, cat._count.products)}
                    disabled={deleting === cat.id}
                    className="w-8 h-8 rounded-xl border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-40"
                    title="Delete"
                  >
                    {deleting === cat.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
                </div>
              </div>

              {/* Sub-categories */}
              {cat.children?.length > 0 && (
                <div className="border-t border-[#f5f0eb] bg-[#fafaf9]">
                  {cat.children.map((child, i) => (
                    <div
                      key={child.id}
                      className={`flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 ${i < cat.children.length - 1 ? "border-b border-[#f5f0eb]" : ""}`}
                    >
                      <ChevronRight size={12} className="text-[#ccc] flex-shrink-0 sm:ml-4" />
                      {/* Image */}
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#f3efe8] flex-shrink-0 border border-[#e8e0d5]">
                        {child.image ? (
                          <Image src={child.image} alt={child.name} fill className="object-cover" sizes="36px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen size={12} className="text-[#ccc]" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{child.name}</p>
                        <p className="text-[11px] text-[#aaa]">/category/{child.slug}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                        <div className="relative">
                          <AdminSelect
                            value={String(cat.id)}
                            onChange={e => moveCategory(child as any, e.target.value)}
                            disabled={moving === child.id}
                            title="Move to another category"
                            className="appearance-none border border-[#e8e0d5] rounded-lg pl-2.5 pr-6 py-1.5 text-[11px] outline-none focus:border-[#c0555a] bg-white text-[#555] cursor-pointer disabled:opacity-40 max-w-[140px] mr-auto sm:mr-0"
                          >
                            <option value="">Top-level</option>
                            {categories
                              .filter(c => c.id !== child.id)
                              .map(c => (
                                <option key={c.id} value={c.id}>Move under: {c.name}</option>
                              ))
                            }
                          </AdminSelect>
                          {moving === child.id
                            ? <Loader2 size={10} className="animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-[#c0555a] pointer-events-none" />
                            : null
                          }
                        </div>
                        <button
                          onClick={() => toggleNavVisibility(child)}
                          disabled={moving === child.id}
                          className={`w-7 h-7 rounded-lg border border-[#e8e0d5] flex items-center justify-center transition-all disabled:opacity-40 ${child.showInNav ? "text-[#555] hover:text-[#c0555a] hover:border-[#c0555a]" : "text-[#ccc] hover:text-[#555]"}`}
                          title={child.showInNav ? "Showing in navbar — click to hide" : "Hidden from navbar — click to show"}
                        >
                          {moving === child.id
                            ? <Loader2 size={11} className="animate-spin" />
                            : child.showInNav ? <Eye size={11} /> : <EyeOff size={11} />
                          }
                        </button>
                        <a
                          href={`/category/${child.slug}`} target="_blank" rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-[#c0555a] hover:border-[#c0555a] transition-all"
                        >
                          <ExternalLink size={11} />
                        </a>
                        <button
                          onClick={() => openEdit(child as any)}
                          className="w-7 h-7 rounded-lg border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-[#1a1a1a] transition-all"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => deleteCategory(child.id, child.name, (child as any)._count?.products || 0)}
                          disabled={deleting === child.id}
                          className="w-7 h-7 rounded-lg border border-[#e8e0d5] flex items-center justify-center text-[#aaa] hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-40"
                        >
                          {deleting === child.id
                            ? <Loader2 size={11} className="animate-spin" />
                            : <Trash2 size={11} />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Add sub-category button */}
                  <button
                    onClick={() => {
                      setForm({ ...EMPTY_FORM, parentId: String(cat.id) });
                      setEditingId(null);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full flex items-center gap-2 px-5 py-2.5 text-[12px] text-[#c0555a] font-semibold hover:bg-[#f3efe8] transition-colors"
                  >
                    <Plus size={12} /> Add subcategory under {cat.name}
                  </button>
                </div>
              )}

              {/* Add sub-category (when no children exist) */}
              {!cat.children?.length && (
                <div className="border-t border-[#f5f0eb]">
                  <button
                    onClick={() => {
                      setForm({ ...EMPTY_FORM, parentId: String(cat.id) });
                      setEditingId(null);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full flex items-center gap-2 px-5 py-2.5 text-[12px] text-[#aaa] hover:text-[#c0555a] hover:bg-[#f3efe8] transition-colors"
                  >
                    <Plus size={11} /> Add subcategory
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-5">
        <p className="text-[12px] font-bold text-[#1a1a1a] mb-2">How it works</p>
        <div className="flex flex-col gap-1.5 text-[12px] text-[#666]">
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Create a category → page goes live instantly at <strong>/category/slug</strong></p>
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Add products to this category → they appear on the page automatically</p>
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Search for any product → shows all matching products across all categories</p>
          <p className="flex items-start gap-1.5"><CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" /> Subcategories appear under parent in navigation and filters</p>
          <p className="flex items-start gap-1.5"><AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" /> You cannot delete a category that has products — move products first</p>
        </div>
      </div>
    </div>
  );
}