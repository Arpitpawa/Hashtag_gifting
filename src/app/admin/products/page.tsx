"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import AdminSelect from "@/components/admin/AdminSelect";
import Image from "next/image";
import { expandToColorTiles } from "@/components/shop/ColorSwatchDots";
import {
  Search, Plus, Edit2, Trash2, Loader2, X, Eye, EyeOff,
  SlidersHorizontal, Square, CheckSquare, MinusSquare,
  Trash, RotateCcw, XCircle, Layers, GitBranch, CornerDownRight,
} from "lucide-react";

function formatPrice(p: number) { return `Rs. ${(p/100).toLocaleString("en-IN")}`; }

const SORT_OPTIONS = [
  { label: "Newest first",     value: "newest" },
  { label: "Oldest first",     value: "oldest" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Name: A to Z",     value: "name_asc" },
  { label: "Stock: low to high", value: "stock_asc" },
  { label: "Best selling",     value: "sales_desc" },
];

export default function AdminProducts() {
  const [view,      setView]      = useState<"active" | "trash">("active");
  const [products,  setProducts]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [busyId,    setBusyId]    = useState<number|null>(null);
  const [toggling,  setToggling]  = useState<number|null>(null);
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [bulkBusy,  setBulkBusy]  = useState(false);

  // ── Merge-as-variants modal ──
  const [mergeOpen,        setMergeOpen]        = useState(false);
  const [mergeParentId,    setMergeParentId]    = useState<number | null>(null);
  const [mergeGroupName,   setMergeGroupName]   = useState("Design");
  const [mergeOptionNames, setMergeOptionNames] = useState<Record<number, string>>({});
  const [mergeBusy,        setMergeBusy]        = useState(false);

  // ── Filters ──
  const [search,       setSearch]       = useState("");
  const [showFilters,  setShowFilters]  = useState(false);
  const [categoryId,   setCategoryId]   = useState("");
  const [minPrice,     setMinPrice]     = useState("");
  const [maxPrice,     setMaxPrice]     = useState("");
  const [stockFilter,  setStockFilter]  = useState("all"); // all | in | low | out
  const [statusFilter, setStatusFilter] = useState("all"); // all | ACTIVE | DRAFT
  const [sortBy,       setSortBy]       = useState("newest");

  const load = async (v: "active" | "trash" = view) => {
    setLoading(true);
    const res  = await fetch(`/api/admin/products${v === "trash" ? "?trash=1" : ""}`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setSelected(new Set());
    setLoading(false);
  };
  useEffect(() => { load(view); }, [view]);

  // Unique categories present in the current product list, for the dropdown
  const categories = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach(p => { if (p.category) map.set(p.category.id, p.category.name); });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    if (categoryId) {
      list = list.filter(p => String(p.category?.id) === categoryId);
    }
    if (minPrice) {
      list = list.filter(p => p.price >= Math.round(Number(minPrice) * 100));
    }
    if (maxPrice) {
      list = list.filter(p => p.price <= Math.round(Number(maxPrice) * 100));
    }
    if (stockFilter === "in")  list = list.filter(p => p.stock >= 5);
    if (stockFilter === "low") list = list.filter(p => p.stock > 0 && p.stock < 5);
    if (stockFilter === "out") list = list.filter(p => p.stock === 0);
    if (view === "active" && statusFilter !== "all") list = list.filter(p => p.status === statusFilter);

    switch (sortBy) {
      case "oldest":     list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "price_asc":  list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "name_asc":   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "stock_asc":  list.sort((a, b) => a.stock - b.stock); break;
      case "sales_desc": list.sort((a, b) => (b._count?.orderItems || 0) - (a._count?.orderItems || 0)); break;
      default:            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // newest
    }

    return list;
  }, [products, search, categoryId, minPrice, maxPrice, stockFilter, statusFilter, sortBy, view]);

  // One tile per color for products merged with color variants (a product with
  // 8 colors shows as 8 tiles here) — every tile still carries the real, shared
  // product `id`, so its checkbox/edit/delete/status actions all correctly act
  // on the one underlying product no matter which color tile triggered them.
  const tiles = useMemo(() => expandToColorTiles(filtered), [filtered]);

  // Walk the flat tile list once and mark, per tile, whether it's the first
  // color tile of its product ("family") plus that family's name and color
  // count — used to render one family-header + indented children instead of
  // N look-alike standalone rows, so admin can tell at a glance which tiles
  // are variants of the same product vs genuinely separate products.
  const familyRows = useMemo(() => {
    const counts = new Map<number, number>();
    tiles.forEach(t => counts.set(t.id, (counts.get(t.id) || 0) + 1));
    const seen = new Set<number>();
    return tiles.map(t => {
      const isFirstOfFamily = !!t.colorParam && !seen.has(t.id);
      if (t.colorParam) seen.add(t.id);
      return {
        tile:           t,
        isFirstOfFamily,
        familySize:     counts.get(t.id) || 1,
        familyName:     t.colorParam ? t.name.replace(/\s[–-]\s[^–-]+$/, "").trim() : t.name,
      };
    });
  }, [tiles]);

  const hasActiveFilters = !!(categoryId || minPrice || maxPrice || stockFilter !== "all" || (view === "active" && statusFilter !== "all"));

  const clearFilters = () => {
    setCategoryId(""); setMinPrice(""); setMaxPrice("");
    setStockFilter("all"); setStatusFilter("all");
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

  // ── Single-item actions — now just fast single-row updates ──
  const trashProduct = async (id: number) => {
    if (!confirm("Move this product to Trash? You can restore it later from the Trash tab.")) return;
    setBusyId(id);
    try {
      const res  = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to trash product.");
      }
    } catch {
      alert("Failed to trash product — check your connection and try again.");
    } finally {
      await load();
      setBusyId(null);
    }
  };

  const restoreProduct = async (id: number) => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedAt: null }),
      });
    } finally {
      await load();
      setBusyId(null);
    }
  };

  const purgeProduct = async (id: number) => {
    if (!confirm("Permanently delete this product? This CANNOT be undone.")) return;
    setBusyId(id);
    try {
      const res  = await fetch(`/api/admin/products/${id}?permanent=1`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) alert(data.error || "Failed to permanently delete product.");
    } catch {
      alert("Failed to permanently delete product — check your connection and try again.");
    } finally {
      await load();
      setBusyId(null);
    }
  };

  // ── Multi-select ──
  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allVisibleSelected  = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  const someVisibleSelected = filtered.some(p => selected.has(p.id)) && !allVisibleSelected;

  const toggleSelectAllVisible = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach(p => next.delete(p.id));
      } else {
        filtered.forEach(p => next.add(p.id));
      }
      return next;
    });
  };

  // ── Bulk actions — one request for any number of products ──
  const runBulk = async (action: "trash" | "restore" | "purge" | "activate" | "draft") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    if (action === "trash" || action === "restore" || action === "purge") {
      const confirmMsg =
        action === "trash"   ? `Move ${ids.length} selected product${ids.length > 1 ? "s" : ""} to Trash?` :
        action === "restore" ? `Restore ${ids.length} selected product${ids.length > 1 ? "s" : ""}?` :
        `Permanently delete ${ids.length} selected product${ids.length > 1 ? "s" : ""}? This CANNOT be undone.`;
      if (!confirm(confirmMsg)) return;
    }

    setBulkBusy(true);
    try {
      const res  = await fetch("/api/admin/products/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Bulk action failed.");
      } else if (action === "purge") {
        const parts: string[] = [];
        if (data.purged)  parts.push(`${data.purged} permanently deleted`);
        if (data.blocked) parts.push(`${data.blocked} kept (have past orders)`);
        if (data.failed)  parts.push(`${data.failed} failed`);
        alert(parts.join(" · ") || "Nothing to delete.");
      }
    } catch {
      alert("Bulk action failed — check your connection and try again.");
    } finally {
      setBulkBusy(false);
      await load();
    }
  };

  // ── Merge as variants — pick one selected product as the parent, the
  // rest get folded into it as ProductVariant rows (and the standalone
  // Product rows for those get deleted, same safety check as purge: blocked
  // if a product already has real past orders against it). ──
  const defaultOptionName = (p: any): string => {
    const m = p.sku?.match(/^HG-\d{2}-(\d+)$/);
    if (m) return `Design ${m[1]}`;
    return p.name;
  };

  const openMergeModal = () => {
    const names: Record<number, string> = {};
    products.filter(p => selected.has(p.id)).forEach(p => { names[p.id] = defaultOptionName(p); });
    setMergeOptionNames(names);
    setMergeParentId(null);
    setMergeGroupName("Design");
    setMergeOpen(true);
  };

  const runMerge = async () => {
    if (!mergeParentId) return;
    const childIds = Array.from(selected).filter(id => id !== mergeParentId);
    if (childIds.length === 0) return;

    setMergeBusy(true);
    try {
      const res = await fetch("/api/admin/products/merge-variants", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: mergeParentId,
          groupName: mergeGroupName.trim() || "Design",
          children: childIds.map(id => ({ productId: id, optionName: mergeOptionNames[id]?.trim() || "" })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Merge failed.");
      } else {
        const parts: string[] = [];
        if (data.merged)  parts.push(`${data.merged} merged into the parent as variants`);
        if (data.blocked) parts.push(`${data.blocked} kept as-is (have past orders)`);
        if (data.failed)  parts.push(`${data.failed} failed`);
        alert(parts.join(" · ") || "Nothing to merge.");
      }
    } catch {
      alert("Merge failed — check your connection and try again.");
    } finally {
      setMergeBusy(false);
      setMergeOpen(false);
      setSelected(new Set());
      await load();
    }
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${selected.size > 0 ? "pb-24" : ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a]">Products</h1>
        <a href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
          <Plus size={15} /> Add product
        </a>
      </div>

      {/* Active / Trash tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setView("active")}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
            view === "active" ? "bg-[#1a1a1a] text-white" : "bg-white border border-[#e8e8e8] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
          }`}>
          Active
        </button>
        <button onClick={() => setView("trash")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
            view === "trash" ? "bg-[#1a1a1a] text-white" : "bg-white border border-[#e8e8e8] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
          }`}>
          <Trash size={13} /> Trash
        </button>
      </div>

      {/* Search + filter toggle + sort */}
      <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 mb-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-4 py-2.5 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-[#c0555a]" />
        </div>

        <button onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
            showFilters || hasActiveFilters
              ? "bg-[#c0555a] text-white border-[#c0555a]"
              : "border-[#e8e8e8] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
          }`}>
          <SlidersHorizontal size={14} /> Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 bg-white text-[#c0555a] rounded-full text-[10px] font-bold flex items-center justify-center">
              {[categoryId, minPrice || maxPrice, stockFilter !== "all", view === "active" && statusFilter !== "all"].filter(Boolean).length}
            </span>
          )}
        </button>

        <div className="relative">
          <AdminSelect value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-[#c0555a] bg-white cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </AdminSelect>
        </div>

        <p className="text-[13px] text-[#888] flex-shrink-0">{filtered.length} of {products.length} products</p>
      </div>

      {/* Bulk action bar — floats above the list, fixed to the viewport, so it's
          always in reach without scrolling back up after selecting products
          further down a long list. Shifted right on desktop to stay centered
          in the content area next to the 240px sidebar (see admin/layout.tsx). */}
      {selected.size > 0 && (
        <div className="fixed bottom-5 left-1/2 lg:left-[calc(50%+120px)] -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-auto max-w-xl flex items-center gap-3 bg-[#1a1a1a] text-white rounded-2xl px-5 py-3 shadow-2xl flex-wrap">
          <p className="text-[13px] font-semibold flex-1">
            {selected.size} product{selected.size > 1 ? "s" : ""} selected
          </p>
          <button onClick={() => setSelected(new Set())}
            className="text-[12px] text-white/70 hover:text-white transition-colors">
            Clear
          </button>
          {view === "active" ? (
            <>
              <button onClick={() => runBulk("activate")} disabled={bulkBusy}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-full text-[12px] font-bold transition-colors">
                {bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                Set Active
              </button>
              <button onClick={() => runBulk("draft")} disabled={bulkBusy}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 rounded-full text-[12px] font-bold transition-colors">
                {bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <EyeOff size={13} />}
                Set Draft
              </button>
              {selected.size >= 2 && (
                <button onClick={openMergeModal} disabled={bulkBusy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 disabled:opacity-50 rounded-full text-[12px] font-bold transition-colors">
                  <Layers size={13} /> Merge as variants
                </button>
              )}
              <button onClick={() => runBulk("trash")} disabled={bulkBusy}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full text-[12px] font-bold transition-colors">
                {bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Move to Trash
              </button>
            </>
          ) : (
            <>
              <button onClick={() => runBulk("restore")} disabled={bulkBusy}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-full text-[12px] font-bold transition-colors">
                {bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                Restore
              </button>
              <button onClick={() => runBulk("purge")} disabled={bulkBusy}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full text-[12px] font-bold transition-colors">
                {bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                Delete forever
              </button>
            </>
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold text-[#1a1a1a]">Filter products</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-[12px] text-[#c0555a] font-semibold hover:underline">
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Category</label>
              <AdminSelect value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-[#e8e0d5] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white">
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </AdminSelect>
            </div>

            {/* Price range */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Price range (Rs.)</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  placeholder="Min" className="w-full border border-[#e8e0d5] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a]" />
                <span className="text-[#aaa]">–</span>
                <input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Max" className="w-full border border-[#e8e0d5] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a]" />
              </div>
            </div>

            {/* Status — only meaningful for the Active view */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Status</label>
              <AdminSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)} disabled={view === "trash"}
                className="w-full border border-[#e8e0d5] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white disabled:opacity-40">
                <option value="all">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
              </AdminSelect>
            </div>
          </div>

          {/* Stock */}
          <div className="mt-4">
            <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Stock</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "in",  label: "In stock (5+)" },
                { key: "low", label: "Low stock (1–4)" },
                { key: "out", label: "Out of stock" },
              ].map(opt => (
                <button key={opt.key} onClick={() => setStockFilter(opt.key)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                    stockFilter === opt.key
                      ? "bg-[#c0555a] text-white border-[#c0555a]"
                      : "border-[#e8e0d5] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#c0555a]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-12 text-center">
          <p className="text-[15px] font-bold text-[#1a1a1a] mb-2">
            {view === "trash" ? "Trash is empty" : "No products match these filters"}
          </p>
          <p className="text-[13px] text-[#888] mb-5">
            {view === "trash" ? "Deleted products show up here and can be restored." : "Try adjusting or clearing your filters"}
          </p>
          {view === "active" && (hasActiveFilters || search) && (
            <button onClick={() => { clearFilters(); setSearch(""); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
        {/* ── MOBILE: card list (tables don't fit a phone) ── */}
        <div className="md:hidden space-y-2.5">
          <button onClick={toggleSelectAllVisible}
            className="flex items-center gap-2 text-[12px] font-semibold text-[#555] px-1 py-1">
            {allVisibleSelected
              ? <CheckSquare size={16} className="text-[#c0555a]" />
              : someVisibleSelected
              ? <MinusSquare size={16} className="text-[#c0555a]" />
              : <Square size={16} />}
            Select all shown
          </button>
          {familyRows.map(({ tile: p, isFirstOfFamily, familySize, familyName }) => (
            <Fragment key={p.tileKey}>
              {isFirstOfFamily && (
                <div className="flex items-center gap-1.5 px-2 pt-1.5 text-[11px] font-bold text-indigo-500">
                  <GitBranch size={12} />
                  <span className="capitalize truncate">{familyName}</span>
                  <span className="font-normal text-indigo-400 flex-shrink-0">— {familySize} colors</span>
                </div>
              )}
            <div
              className={`bg-white rounded-2xl border p-3 ${p.colorParam ? "ml-3 border-l-2" : ""} ${
                selected.has(p.id) ? "border-[#c0555a] bg-[#fdf3f0]"
                : p.colorParam ? "border-indigo-200 bg-indigo-50/40"
                : "border-[#e8e8e8]"
              }`}>
              <div className="flex gap-3">
                <button onClick={() => toggleSelect(p.id)} aria-label="Select product"
                  className="self-start pt-1 text-[#888]">
                  {selected.has(p.id) ? <CheckSquare size={18} className="text-[#c0555a]" /> : <Square size={18} />}
                </button>
                <a href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  {p.images?.[0] ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f5] border border-[#e8e8e8]">
                      <Image src={p.images[0]} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#f5f5f5]" />
                  )}
                </a>
                <div className="min-w-0 flex-1">
                  <a href={`/admin/products/${p.id}/edit`} className="block">
                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2 capitalize">{p.name}</p>
                  </a>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <p className="text-[11px] text-[#999] truncate">{p.category?.name || "—"}</p>
                    {p.colorParam && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                        <CornerDownRight size={9} /> {p.colorParam}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[14px] font-bold text-[#1a1a1a]">{formatPrice(p.price)}</span>
                    {p.comparePrice && <span className="text-[11px] text-[#aaa] line-through">{formatPrice(p.comparePrice)}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f3f3f3] flex-wrap">
                <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                  p.stock === 0 ? "bg-red-100 text-red-600" : p.stock < 5 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"
                }`}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                </span>
                {view === "trash" ? (
                  <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500">Trashed</span>
                ) : (
                  <button onClick={() => toggleStatus(p)} disabled={toggling === p.id}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                    {toggling === p.id ? <Loader2 size={10} className="animate-spin" /> : p.status === "ACTIVE" ? <Eye size={10} /> : <EyeOff size={10} />}
                    {p.status}
                  </button>
                )}
                <span className="text-[11px] text-[#999]">{p._count?.orderItems || 0} sold</span>
                <div className="ml-auto flex items-center gap-2">
                  {view === "active" ? (
                    <>
                      <a href={`/admin/products/${p.id}/edit`} aria-label="Edit"
                        className="w-10 h-10 rounded-xl border border-[#e8e8e8] flex items-center justify-center text-[#555] active:bg-[#c0555a] active:text-white">
                        <Edit2 size={15} />
                      </a>
                      <button onClick={() => trashProduct(p.id)} disabled={busyId === p.id} aria-label="Move to Trash"
                        className="w-10 h-10 rounded-xl border border-[#e8e8e8] flex items-center justify-center text-[#555] active:bg-red-500 active:text-white disabled:opacity-40">
                        {busyId === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => restoreProduct(p.id)} disabled={busyId === p.id} aria-label="Restore"
                        className="w-10 h-10 rounded-xl border border-[#e8e8e8] flex items-center justify-center text-[#555] active:bg-green-600 active:text-white disabled:opacity-40">
                        {busyId === p.id ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                      </button>
                      <button onClick={() => purgeProduct(p.id)} disabled={busyId === p.id} aria-label="Delete forever"
                        className="w-10 h-10 rounded-xl border border-[#e8e8e8] flex items-center justify-center text-[#555] active:bg-red-500 active:text-white disabled:opacity-40">
                        {busyId === p.id ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            </Fragment>
          ))}
        </div>

        {/* ── DESKTOP: table ── */}
        <div className="hidden md:block bg-white rounded-2xl border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fafafa] border-b border-[#f0f0f0]">
              <tr>
                <th className="px-4 py-3 w-8">
                  <button onClick={toggleSelectAllVisible} className="flex items-center text-[#888] hover:text-[#c0555a] transition-colors">
                    {allVisibleSelected
                      ? <CheckSquare size={16} className="text-[#c0555a]" />
                      : someVisibleSelected
                      ? <MinusSquare size={16} className="text-[#c0555a]" />
                      : <Square size={16} />}
                  </button>
                </th>
                {["Product","Category","Price","Stock","Status","Sales","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {familyRows.map(({ tile: p, isFirstOfFamily, familySize, familyName }) => (
                <Fragment key={p.tileKey}>
                {isFirstOfFamily && (
                  <tr className="bg-indigo-50/60 shadow-[inset_3px_0_0_0_#a5b4fc]">
                    <td colSpan={8} className="px-4 py-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500">
                        <GitBranch size={12} />
                        <span className="capitalize">{familyName}</span>
                        <span className="font-normal text-indigo-400">— {familySize} colors</span>
                      </div>
                    </td>
                  </tr>
                )}
                <tr className={`hover:bg-[#fafafa] transition-colors ${
                  selected.has(p.id) ? "bg-[#fdf3f0]" : p.colorParam ? "bg-indigo-50/40" : ""
                } ${p.colorParam ? "shadow-[inset_3px_0_0_0_#a5b4fc]" : ""}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(p.id)} className="flex items-center text-[#888] hover:text-[#c0555a] transition-colors">
                      {selected.has(p.id)
                        ? <CheckSquare size={16} className="text-[#c0555a]" />
                        : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-3 ${p.colorParam ? "pl-4 border-l-2 border-indigo-200" : ""}`}>
                      <a href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer" title="View on storefront">
                        {p.images?.[0] ? (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-[#e8e8e8] hover:border-[#c0555a] transition-colors">
                            <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex-shrink-0" />
                        )}
                      </a>
                      <a href={`/admin/products/${p.id}/edit`} title="Edit product">
                        <p className="font-semibold text-[#1a1a1a] capitalize line-clamp-1 hover:text-[#c0555a] transition-colors">{p.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[11px] text-[#aaa]">{p.slug}</p>
                          {p.colorParam && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                              <CornerDownRight size={9} /> {p.colorParam}
                            </span>
                          )}
                        </div>
                      </a>
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
                    {view === "trash" ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Trashed
                      </span>
                    ) : (
                      <button onClick={() => toggleStatus(p)} disabled={toggling === p.id}
                        className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                          p.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}>
                        {toggling === p.id ? <Loader2 size={10} className="animate-spin" />
                          : p.status === "ACTIVE" ? <Eye size={10} /> : <EyeOff size={10} />}
                        {p.status}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#888]">{p._count?.orderItems || 0} sold</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {view === "active" ? (
                        <>
                          <a href={`/admin/products/${p.id}/edit`}
                            className="w-8 h-8 rounded-lg border border-[#e8e8e8] flex items-center justify-center hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all text-[#555]">
                            <Edit2 size={13} />
                          </a>
                          <button onClick={() => trashProduct(p.id)} disabled={busyId === p.id}
                            title="Move to Trash"
                            className="w-8 h-8 rounded-lg border border-[#e8e8e8] flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-[#555] disabled:opacity-40">
                            {busyId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => restoreProduct(p.id)} disabled={busyId === p.id}
                            title="Restore"
                            className="w-8 h-8 rounded-lg border border-[#e8e8e8] flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-all text-[#555] disabled:opacity-40">
                            {busyId === p.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                          </button>
                          <button onClick={() => purgeProduct(p.id)} disabled={busyId === p.id}
                            title="Delete forever"
                            className="w-8 h-8 rounded-lg border border-[#e8e8e8] flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-[#555] disabled:opacity-40">
                            {busyId === p.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Merge-as-variants modal */}
      {mergeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => !mergeBusy && setMergeOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#f0f0f0] flex items-center justify-between">
              <div>
                <p className="text-[15px] font-bold text-[#1a1a1a]">Merge as variants</p>
                <p className="text-[12px] text-[#888] mt-0.5">
                  Pick one product to be the parent — the rest become variants under it and are removed as separate listings.
                </p>
              </div>
              <button onClick={() => setMergeOpen(false)} className="text-[#aaa] hover:text-[#1a1a1a]">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Variant group name</label>
              <input value={mergeGroupName} onChange={e => setMergeGroupName(e.target.value)}
                placeholder="e.g. Design, Colour"
                className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] mb-5" />

              <div className="space-y-2">
                {products.filter(p => selected.has(p.id)).map(p => (
                  <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                    mergeParentId === p.id ? "border-[#c0555a] bg-[#fdf3f0]" : "border-[#f0f0f0]"
                  }`}>
                    <button onClick={() => setMergeParentId(p.id)}
                      title="Make this the parent product"
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        mergeParentId === p.id ? "border-[#c0555a] bg-[#c0555a]" : "border-[#ccc]"
                      }`} />
                    {p.images?.[0] ? (
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                        <Image src={p.images[0]} alt="" fill className="object-cover" sizes="36px" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex-shrink-0" />
                    )}
                    <p className="text-[12px] font-semibold text-[#1a1a1a] line-clamp-1 flex-1 min-w-0">{p.name}</p>
                    {mergeParentId === p.id ? (
                      <span className="text-[10px] font-bold text-[#c0555a] uppercase flex-shrink-0">Parent</span>
                    ) : (
                      <input value={mergeOptionNames[p.id] ?? ""} onChange={e => setMergeOptionNames(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Option name"
                        className="w-32 border border-[#e8e8e8] rounded-lg px-2 py-1.5 text-[12px] outline-none focus:border-[#c0555a] flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {!mergeParentId && (
                <p className="text-[11px] text-[#c0555a] mt-3">Select the dot next to a product to make it the parent.</p>
              )}
            </div>

            <div className="p-5 border-t border-[#f0f0f0] flex justify-end gap-2">
              <button onClick={() => setMergeOpen(false)} disabled={mergeBusy}
                className="px-4 py-2.5 rounded-full text-[13px] font-semibold text-[#555] hover:bg-[#f5f5f5] transition-colors">
                Cancel
              </button>
              <button onClick={runMerge} disabled={mergeBusy || !mergeParentId}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-40 transition-all">
                {mergeBusy ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />}
                Merge {selected.size} into 1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
