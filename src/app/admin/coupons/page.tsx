"use client";

import { useEffect, useState } from "react";
import AdminSelect from "@/components/admin/AdminSelect";
import Image from "next/image";
import {
  Plus, Trash2, Loader2, Tag, CheckCircle, X,
  Package, FolderOpen, Globe, Search, ChevronDown,
} from "lucide-react";

function formatPrice(p: number) {
  return `Rs. ${Math.round(p / 100).toLocaleString("en-IN")}`;
}

const EMPTY_FORM = {
  code: "", type: "PERCENT", value: "", minAmount: "",
  usageLimit: "", isActive: true, validFrom: "", validTo: "",
  applyTo: "ALL" as "ALL" | "SPECIFIC_PRODUCTS" | "SPECIFIC_CATEGORIES",
  productIds:  [] as number[],
  categoryIds: [] as number[],
};

export default function AdminCoupons() {
  const [coupons,    setCoupons]    = useState<any[]>([]);
  const [products,   setProducts]   = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<number | null>(null);
  const [error,      setError]      = useState("");
  const [prodSearch, setProdSearch] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, pRes, catsRes] = await Promise.all([
        fetch("/api/admin/coupons"),
        fetch("/api/products?limit=100&status=ACTIVE"),
        fetch("/api/admin/categories"),
      ]);
      const [cData, pData, catsData] = await Promise.all([
        cRes.json(), pRes.json(), catsRes.json(),
      ]);
      setCoupons(Array.isArray(cData) ? cData : (cData.coupons || []));
      setProducts(pData.products || []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleProductId = (id: number) => {
    setForm((p) => ({
      ...p,
      productIds: p.productIds.includes(id)
        ? p.productIds.filter((x) => x !== id)
        : [...p.productIds, id],
    }));
  };

  const toggleCategoryId = (id: number) => {
    setForm((p) => ({
      ...p,
      categoryIds: p.categoryIds.includes(id)
        ? p.categoryIds.filter((x) => x !== id)
        : [...p.categoryIds, id],
    }));
  };

  const save = async () => {
    if (!form.code || !form.value) { setError("Code and value are required"); return; }
    if (form.applyTo === "SPECIFIC_PRODUCTS"   && form.productIds.length  === 0) { setError("Select at least one product");  return; }
    if (form.applyTo === "SPECIFIC_CATEGORIES" && form.categoryIds.length === 0) { setError("Select at least one category"); return; }

    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code:        form.code.toUpperCase(),
          type:        form.type,
          value:       form.type === "PERCENT" ? parseInt(form.value) : parseInt(form.value),
          minAmount:   form.minAmount ? parseInt(form.minAmount) : 0,
          usageLimit:  form.usageLimit ? parseInt(form.usageLimit) : null,
          isActive:    form.isActive,
          validFrom:   form.validFrom || null,
          validTo:     form.validTo   || null,
          applyTo:     form.applyTo,
          productIds:  form.productIds,
          categoryIds: form.categoryIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      load();
    } catch { setError("Something went wrong"); }
    finally   { setSaving(false); }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    setDeleting(id);
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load(); setDeleting(null);
  };

  const filteredProducts = prodSearch.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
    : products;

  const inputCls = "w-full border border-[#e8e8e8] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-[#c0555a] bg-white";

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a1a]">Coupons</h1>
          <p className="text-[13px] text-[#888] mt-0.5">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all"
        >
          <Plus size={15} /> Create coupon
        </button>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold text-[#1a1a1a]">New coupon</h3>
            <button onClick={() => setShowForm(false)} className="text-[#aaa] hover:text-[#555]">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

            {/* Code */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                Coupon code *
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                placeholder="e.g. BIRTHDAY20"
                className={inputCls}
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                Discount type *
              </label>
              <AdminSelect
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className={inputCls}
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat amount (Rs.)</option>
              </AdminSelect>
            </div>

            {/* Value */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                {form.type === "PERCENT" ? "Discount %" : "Discount amount (Rs.)"} *
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                placeholder={form.type === "PERCENT" ? "e.g. 20" : "e.g. 100"}
                className={inputCls}
              />
            </div>

            {/* Min order */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                Min order (Rs.)
              </label>
              <input
                type="number"
                value={form.minAmount}
                onChange={(e) => setForm((p) => ({ ...p, minAmount: e.target.value }))}
                placeholder="Leave blank = no minimum"
                className={inputCls}
              />
            </div>

            {/* Usage limit */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                Usage limit
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
                placeholder="Leave blank = unlimited"
                className={inputCls}
              />
            </div>

            {/* Valid from */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                Valid from
              </label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Valid to */}
            <div>
              <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                Valid until (expiry)
              </label>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.isActive ? "bg-[#c0555a]" : "bg-[#e8e8e8]"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.isActive ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <span className="text-[13px] font-medium text-[#1a1a1a]">
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* ── Apply To Section ── */}
          <div className="mb-5">
            <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-3">
              Apply coupon to
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "ALL",                  label: "All products",        icon: Globe,      desc: "Works on entire cart" },
                { value: "SPECIFIC_PRODUCTS",    label: "Specific products",   icon: Package,    desc: "Only selected products" },
                { value: "SPECIFIC_CATEGORIES",  label: "Specific categories", icon: FolderOpen, desc: "Only selected categories" },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setForm((p) => ({ ...p, applyTo: value as any, productIds: [], categoryIds: [] }))}
                  className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition-all ${
                    form.applyTo === value
                      ? "border-[#c0555a] bg-[#c0555a]/5"
                      : "border-[#e8e8e8] hover:border-[#c0555a]/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={15} className={form.applyTo === value ? "text-[#c0555a]" : "text-[#aaa]"} />
                    <span className={`text-[13px] font-bold ${form.applyTo === value ? "text-[#c0555a]" : "text-[#1a1a1a]"}`}>
                      {label}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#888] pl-5">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Product Picker ── */}
          {form.applyTo === "SPECIFIC_PRODUCTS" && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-[#1a1a1a]">
                  Select products
                  {form.productIds.length > 0 && (
                    <span className="ml-2 text-[#c0555a]">· {form.productIds.length} selected</span>
                  )}
                </label>
                {form.productIds.length > 0 && (
                  <button
                    onClick={() => setForm((p) => ({ ...p, productIds: [] }))}
                    className="text-[11px] text-[#aaa] hover:text-red-500"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border border-[#e8e8e8] rounded-xl pl-8 pr-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a]"
                />
              </div>

              <div className="max-h-[280px] overflow-y-auto border border-[#f0f0f0] rounded-xl" style={{ scrollbarWidth: "none" }}>
                {filteredProducts.map((product) => {
                  const isSel = form.productIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProductId(product.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-[#f5f5f5] last:border-0 ${
                        isSel ? "bg-[#c0555a]/5" : "hover:bg-[#fafafa]"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSel ? "bg-[#c0555a] border-[#c0555a]" : "border-[#ddd]"
                      }`}>
                        {isSel && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Product image */}
                      {product.images?.[0] && (
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#f3efe8]">
                          <Image src={product.images[0]} alt="" fill className="object-cover" sizes="36px" />
                        </div>
                      )}

                      {/* Name + price */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium truncate ${isSel ? "text-[#c0555a]" : "text-[#1a1a1a]"}`}>
                          {product.name}
                        </p>
                        <p className="text-[11px] text-[#aaa]">
                          Rs. {(product.price / 100).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Category Picker ── */}
          {form.applyTo === "SPECIFIC_CATEGORIES" && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-[#1a1a1a]">
                  Select categories
                  {form.categoryIds.length > 0 && (
                    <span className="ml-2 text-[#c0555a]">· {form.categoryIds.length} selected</span>
                  )}
                </label>
                {form.categoryIds.length > 0 && (
                  <button
                    onClick={() => setForm((p) => ({ ...p, categoryIds: [] }))}
                    className="text-[11px] text-[#aaa] hover:text-red-500"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-[280px] overflow-y-auto border border-[#f0f0f0] rounded-xl" style={{ scrollbarWidth: "none" }}>
                {categories.map((parent: any) => (
                  <div key={parent.id}>
                    {/* Parent */}
                    <button
                      onClick={() => toggleCategoryId(parent.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#f5f5f5] transition-all ${
                        form.categoryIds.includes(parent.id) ? "bg-[#c0555a]/5" : "hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        form.categoryIds.includes(parent.id) ? "bg-[#c0555a] border-[#c0555a]" : "border-[#ddd]"
                      }`}>
                        {form.categoryIds.includes(parent.id) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <FolderOpen size={13} className={form.categoryIds.includes(parent.id) ? "text-[#c0555a]" : "text-[#aaa]"} />
                      <span className={`text-[13px] font-bold ${form.categoryIds.includes(parent.id) ? "text-[#c0555a]" : "text-[#1a1a1a]"}`}>
                        {parent.name}
                      </span>
                    </button>

                    {/* Children */}
                    {parent.children?.map((child: any) => (
                      <button
                        key={child.id}
                        onClick={() => toggleCategoryId(child.id)}
                        className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-left border-b border-[#f5f5f5] last:border-0 transition-all ${
                          form.categoryIds.includes(child.id) ? "bg-[#c0555a]/5" : "hover:bg-[#fafafa]"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          form.categoryIds.includes(child.id) ? "bg-[#c0555a] border-[#c0555a]" : "border-[#ddd]"
                        }`}>
                          {form.categoryIds.includes(child.id) && (
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ddd] flex-shrink-0" />
                        <span className={`text-[12px] ${form.categoryIds.includes(child.id) ? "text-[#c0555a] font-medium" : "text-[#555]"}`}>
                          {child.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-[12px] text-red-500 font-medium mb-3">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] disabled:opacity-50 transition-all"
            >
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
                : <><CheckCircle size={13} /> Save coupon</>
              }
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); setForm({ ...EMPTY_FORM }); }}
              className="px-5 py-2.5 border border-[#e8e8e8] text-[#555] text-[13px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Coupons Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#c0555a]" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8e8e8] p-12 text-center">
              <Tag size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-[14px] text-[#aaa]">No coupons yet</p>
            </div>
          ) : coupons.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl border border-[#e8e8e8] p-5 hover:border-[#e0e0e0] transition-all">
              <div className="flex items-start justify-between gap-4">

                {/* Left */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Code badge */}
                  <div className="flex-shrink-0 bg-[#c0555a]/10 px-3 py-1.5 rounded-xl">
                    <p className="text-[14px] font-bold text-[#c0555a] tracking-wider">{c.code}</p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Discount value */}
                      <span className="text-[13px] font-bold text-[#1a1a1a]">
                        {c.type === "PERCENT" ? `${c.value}% off` : formatPrice(c.value * 100)}
                      </span>

                      {/* Status */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>

                      {/* Scope badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        c.applyTo === "ALL"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {c.applyTo === "ALL"
                          ? <><Globe size={9} /> All products</>
                          : c.applyTo === "SPECIFIC_PRODUCTS"
                          ? <><Package size={9} /> {c.products?.length} product{c.products?.length !== 1 ? "s" : ""}</>
                          : <><FolderOpen size={9} /> {c.categories?.length} categor{c.categories?.length !== 1 ? "ies" : "y"}</>
                        }
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[#888]">
                      {c.minAmount > 0 && <span>Min: {formatPrice(c.minAmount)}</span>}
                      <span>Used: {c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</span>
                      {c.validFrom && <span>From: {new Date(c.validFrom).toLocaleDateString("en-IN")}</span>}
                      {(c.validTo || c.expiresAt) && (
                        <span>Expires: {new Date(c.validTo || c.expiresAt).toLocaleDateString("en-IN")}</span>
                      )}
                    </div>

                    {/* Specific products list */}
                    {c.applyTo === "SPECIFIC_PRODUCTS" && c.products?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.products.slice(0, 4).map((cp: any) => (
                          <span key={cp.productId} className="flex items-center gap-1 text-[11px] bg-[#f3efe8] text-[#555] px-2 py-0.5 rounded-full">
                            <Package size={9} /> {cp.product?.name}
                          </span>
                        ))}
                        {c.products.length > 4 && (
                          <span className="text-[11px] text-[#aaa]">+{c.products.length - 4} more</span>
                        )}
                      </div>
                    )}

                    {/* Specific categories list */}
                    {c.applyTo === "SPECIFIC_CATEGORIES" && c.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.categories.map((cc: any) => (
                          <span key={cc.categoryId} className="flex items-center gap-1 text-[11px] bg-[#f3efe8] text-[#555] px-2 py-0.5 rounded-full">
                            <FolderOpen size={9} /> {cc.category?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteCoupon(c.id)}
                  disabled={deleting === c.id}
                  className="w-8 h-8 rounded-xl border border-[#e8e8e8] flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-[#aaa] flex-shrink-0 disabled:opacity-40"
                >
                  {deleting === c.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Trash2 size={12} />
                  }
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}