"use client";

import { useState, useEffect, useRef } from "react";
import AdminSelect from "@/components/admin/AdminSelect";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Plus, X, Loader2, CheckCircle,
  Upload, Sparkles, Tag, Package, ImagePlus,
  ChevronDown, ChevronLeft, ChevronRight, Trash2, Check, Zap,
} from "lucide-react";
import ZoneSelector from "./ZoneSelector";
import VariantBuilder, { type VariantRow } from "./VariantBuilder";
import { FONT_OPTIONS, PERSONALISATION_FONT_PRELOAD_CLASS } from "@/lib/personalization/fonts";

interface Category {
  id:       number;
  name:     string;
  slug:     string;
  parentId: number | null;
  children?: { id: number; name: string; slug: string }[];
}

interface CustomField {
  type:         "text" | "textarea" | "image" | "select";
  label:        string;
  required:     boolean;
  placeholder?: string;
  maxLength?:   number;
  options?:     string[];
}

interface Props {
  mode:       "create" | "edit";
  productId?: number;
}

const BADGES     = ["Best seller", "New", "Trending", "Premium", "Limited", "Sale"];
const STATUS_OPT = ["ACTIVE", "DRAFT"];

function Section({ title, children, collapsible, defaultOpen = true, badge }: {
  title: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] p-4 sm:p-6 min-w-0">
      {collapsible ? (
        <button type="button" onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between mb-5 pb-3 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-[#1a1a1a]">{title}</h3>
            {!open && badge}
          </div>
          <ChevronDown size={16} className={`text-[#888] transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <h3 className="text-[14px] font-bold text-[#1a1a1a] mb-5 pb-3 border-b border-[#f0f0f0]">{title}</h3>
      )}
      {(!collapsible || open) && children}
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[12px] text-[#888] font-medium hover:text-[#c0555a] transition-colors">
        <span className="w-4 h-4 rounded-full bg-[#f3efe8] text-[10px] flex items-center justify-center">ⓘ</span>
        {title}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="bg-[#f3efe8] rounded-xl p-4 mt-2 text-[13px] text-[#555] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label className="text-[12px] font-semibold text-[#555] flex items-center gap-1">
        {label} {required && <span className="text-[#c0555a]">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export default function ProductForm({ mode, productId }: Props) {
  const router = useRouter();

  // ── Form state ──
  const [name,         setName]         = useState("");
  const [sku,          setSku]          = useState("");
  const [description,  setDescription]  = useState("");
  const [detailsDescription, setDetailsDescription] = useState("");
  const [price,        setPrice]        = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock,        setStock]        = useState("");
  const [badge,        setBadge]        = useState("");
  const [tags,         setTags]         = useState<string[]>([]);
  const [tagInput,     setTagInput]     = useState("");
  const [categoryIds,  setCategoryIds]  = useState<number[]>([]); // ← MULTI-CATEGORY
  const [status,       setStatus]       = useState("ACTIVE");
  const [customizable, setCustomizable] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [hasCharm,     setHasCharm]     = useState(false);
  const [images,       setImages]       = useState<string[]>([]);
  const [custFields,   setCustFields]   = useState<CustomField[]>([]);
  const [specs,        setSpecs]        = useState<{ label: string; value: string }[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState("");
  const [previewZones,    setPreviewZones]    = useState("");
  const [availableFonts,  setAvailableFonts]  = useState<string[]>([]);
  const [variants,       setVariants]       = useState<VariantRow[]>([]);

  // ── UI state ──
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [saving,       setSaving]       = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [uploading,    setUploading]    = useState(false);
  const [imageUrl,     setImageUrl]     = useState("");
  const [catSearch,    setCatSearch]    = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(data => {
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  // Load product for edit mode
  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    fetch(`/api/admin/products/${productId}`).then(r => r.json()).then(p => {
      setName(p.name || "");
      setSku(p.sku || "");
      setDescription(p.description || "");
      setDetailsDescription(p.detailsDescription || "");
      setPrice(p.price ? (p.price / 100).toString() : "");
      setComparePrice(p.comparePrice ? (p.comparePrice / 100).toString() : "");
      setStock(p.stock?.toString() || "");
      setBadge(p.badge || "");
      setTags(p.tags || []);
      // Load multi-category IDs — fallback to single categoryId
      setCategoryIds(
        p.categoryIds?.length
          ? p.categoryIds
          : p.categoryId ? [p.categoryId] : []
      );
      setStatus(p.status || "ACTIVE");
      setCustomizable(p.customizable || false);
      setFastDelivery(p.fastDelivery || false);
      setHasCharm(p.hasCharm || false);
      setImages(p.images || []);
      setCustFields(p.customizationFields || []);
      setSpecs(p.specifications || []);
      setPreviewTemplate(p.previewTemplate || "");
      setPreviewZones(p.previewZones ? JSON.stringify(p.previewZones, null, 2) : "");
      setAvailableFonts(p.availableFonts || []);
      // Load existing variants
      if (p.variants?.length > 0) {
        setVariants(p.variants.map((v: any) => ({
          groupName:    v.groupName,
          optionName:   v.optionName,
          price:        v.price != null ? (v.price / 100).toString() : "",
          comparePrice: v.comparePrice ? (v.comparePrice / 100).toString() : "",
          stock:        v.stock?.toString() ?? "0",
          images:       v.images ?? [],
          sku:          v.sku   ?? "",
          isDefault:    v.isDefault ?? false,
        })));
      }
    });
  }, [mode, productId]);

  // ── Handlers ──
  const toggleCategory = (id: number) => {
    setCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Category tree accordion — a parent is open if the admin explicitly
  // toggled it, OR (by default) if it already has a selected child, OR while
  // actively searching (so results are never hidden behind a collapsed row).
  // Derived live rather than stored, so it always reflects current selection
  // state with no init-timing issues.
  const [openOverride, setOpenOverride] = useState<Record<number, boolean>>({});
  const isParentOpen = (parent: Category) => {
    if (parent.id in openOverride) return openOverride[parent.id];
    if (catSearch.trim()) return true;
    return !!parent.children?.some(c => categoryIds.includes(c.id));
  };
  const toggleParentOpen = (parent: Category) => {
    setOpenOverride(prev => ({ ...prev, [parent.id]: !isParentOpen(parent) }));
  };

  const toggleFont = (id: string) => {
    setAvailableFonts(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput("");
  };

  // Uploads every selected file in order and appends them all — lets the
  // admin pick a whole batch of product photos at once instead of one at a
  // time. Sequential so results land in the order they were picked.
  const uploadImages = async (files: FileList) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of fileArr) {
        const fd = new FormData(); fd.append("file", file);
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
        else alert(data.error || `Upload failed for "${file.name}" — check Cloudinary keys`);
      }
      if (uploaded.length > 0) setImages(p => [...p, ...uploaded]);
    } catch { alert("Upload failed"); }
    finally { setUploading(false); }
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    setImages(p => [...p, imageUrl.trim()]);
    setImageUrl("");
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    setImages(p => {
      const arr = [...p];
      const target = i + dir;
      if (target < 0 || target >= arr.length) return p;
      [arr[i], arr[target]] = [arr[target], arr[i]];
      return arr;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())          e.name     = "Product name is required";
    if (!price)                e.price    = "Price is required";
    if (parseFloat(price) <= 0) e.price   = "Price must be greater than 0";
    if (categoryIds.length === 0) e.category = "Select at least one category";
    if (!stock)                e.stock    = "Stock is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name, sku: sku.trim() || null, description,
        detailsDescription: detailsDescription || null,
        price:        parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock:        parseInt(stock),
        badge:        badge || null,
        tags,
        categoryId:   categoryIds[0] ?? null,   // primary (backward compat)
        categoryIds,                             // full list
        status, customizable, fastDelivery, hasCharm,
        images,
        specifications:      specs.filter(s => s.label && s.value),
        customizationFields: customizable ? custFields : [],
        previewTemplate:     previewTemplate || null,
        previewZones:        previewZones ? JSON.parse(previewZones) : null,
        availableFonts,
        variants:            variants.map((v, i) => ({
          groupName:    v.groupName,
          optionName:   v.optionName,
          price:        v.price ? parseFloat(v.price) : null,
          comparePrice: v.comparePrice ? parseFloat(v.comparePrice) : null,
          stock:        parseInt(v.stock) || 0,
          images:       v.images || [],
          sku:          v.sku   || null,
          isDefault:    v.isDefault,
          sortOrder:    i,
        })),
      };

      const url    = mode === "edit" ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      // If this save just took stock from 0 to something, the server auto-
      // emails everyone on the "notify me" waitlist for this product — see
      // src/app/api/admin/products/[id]/route.ts.
      if (data.notified > 0) {
        alert(`${data.notified} customer${data.notified > 1 ? "s" : ""} just got emailed that this product is back in stock.`);
      }
      router.push("/admin/products");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally { setSaving(false); }
  };

  const inputCls = (err?: string) =>
    `w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors bg-white ${
      err ? "border-red-400 focus:border-red-400" : "border-[#e8e8e8] focus:border-[#c0555a]"
    }`;

  // Filter categories by search
  const filteredCats = catSearch.trim()
    ? categories.map(parent => ({
        ...parent,
        children: parent.children?.filter(c =>
          c.name.toLowerCase().includes(catSearch.toLowerCase())
        ),
      })).filter(p =>
        p.name.toLowerCase().includes(catSearch.toLowerCase()) ||
        (p.children && p.children.length > 0)
      )
    : categories;

  // Get names of selected categories for the summary
  const selectedCatNames = categories.flatMap(p => [
    p, ...(p.children || [])
  ]).filter(c => categoryIds.includes(c.id)).map(c => c.name);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] pb-28 lg:pb-8">

      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7 flex-wrap">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-center hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[20px] sm:text-[24px] font-bold text-[#1a1a1a]">
            {mode === "edit" ? "Edit product" : "Add new product"}
          </h1>
          <p className="hidden sm:block text-[13px] text-[#888] mt-0.5">
            {mode === "edit" ? "Update product details" : "Fill in the details to create a new product"}
          </p>
        </div>
        <div className="fixed bottom-0 inset-x-0 z-30 flex gap-3 bg-white/95 backdrop-blur border-t border-[#e8e8e8] p-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:static lg:z-auto lg:ml-auto lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:p-0 lg:pb-0">
          <button onClick={() => router.back()}
            className="px-5 py-3 lg:py-2.5 border border-[#e8e8e8] text-[13px] font-semibold text-[#555] rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-6 py-3 lg:py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-60">
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : <><CheckCircle size={15} /> {mode === "edit" ? "Save changes" : "Publish product"}</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-5 min-w-0">

          {/* Basic info */}
          <Section title="Basic information">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-4">
                <Field label="Product name" error={errors.name} required>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Personalised birthday mug for her"
                    className={inputCls(errors.name)} />
                </Field>
                <Field label="SKU (admin only)">
                  <input value={sku} onChange={e => setSku(e.target.value)}
                    placeholder="e.g. HG-MUG-001"
                    className={inputCls()} />
                </Field>
              </div>
              <p className="text-[11px] text-[#aaa] -mt-2.5">
                SKU is just for your own reference — it shows up in Orders and Inventory so you can quickly tell what a customer ordered. Customers never see it.
              </p>
              <Field label="Short description / tagline">
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={4} placeholder="A short line or two, e.g. Make it uniquely theirs — personalised with love, crafted just for your special someone"
                  className={`${inputCls()} resize-none`} />
                <p className="text-[11px] text-[#aaa]">Shown right under the product title at the top of the page.</p>
              </Field>
              <Field label="Product details description (SEO)">
                <textarea value={detailsDescription} onChange={e => setDetailsDescription(e.target.value)}
                  rows={6} placeholder="Full product description for SEO and the 'Product Details' tab..."
                  className={`${inputCls()} resize-none`} />
                <p className="text-[11px] text-[#aaa]">Shown in full under "Product Details" on the product page. Line breaks are preserved.</p>
              </Field>
            </div>
          </Section>

          {/* Pricing & Stock */}
          <Section title="Pricing & stock">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Price (Rs.)" error={errors.price} required>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="399" min="0" className={inputCls(errors.price)} />
              </Field>
              <Field label="Compare price (Rs.)">
                <input type="number" value={comparePrice} onChange={e => setComparePrice(e.target.value)}
                  placeholder="599" min="0" className={inputCls()} />
                <p className="text-[11px] text-[#aaa]">Shows crossed out</p>
              </Field>
              <Field label="Stock quantity" error={errors.stock} required>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)}
                  placeholder="50" min="0" className={inputCls(errors.stock)} />
              </Field>
            </div>
            {price && comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
              <p className="text-[12px] text-green-600 font-semibold mt-3">
                Discount: {Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100)}% off
              </p>
            )}
          </Section>

          {/* Images */}
          <Section title="Product images">
            <div className="flex flex-col gap-4">
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-[#e8e8e8]">
                      <Image src={img} alt="" fill className="object-cover" sizes="120px" />
                      {i === 0 && (
                        <div className="absolute top-1 left-1 bg-[#c0555a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Main</div>
                      )}
                      <button onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <X size={11} />
                      </button>
                      <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveImage(i, -1)} disabled={i === 0} title="Move left"
                          className="w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/80 transition-colors">
                          <ChevronLeft size={12} />
                        </button>
                        <button onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} title="Move right"
                          className="w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/80 transition-colors">
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[#e8e8e8] rounded-xl text-[13px] text-[#888] hover:border-[#c0555a] hover:text-[#c0555a] transition-all disabled:opacity-50">
                  {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                    : <><Upload size={16} /> Upload from device — pick multiple at once</>}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => { if (e.target.files?.length) uploadImages(e.target.files); e.target.value = ""; }} />
              </div>
              <div className="flex gap-2">
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addImageUrl()}
                  placeholder="Or paste an image URL..."
                  className={`${inputCls()} flex-1`} />
                <button onClick={addImageUrl}
                  className="px-4 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">
                  Add
                </button>
              </div>
              <p className="text-[11px] text-[#aaa]">First image is the main display image. Add up to 6 images.</p>
            </div>
          </Section>

          {/* Specifications */}
          <Section title="Product specifications">
            <p className="text-[12px] text-[#888] mb-4 leading-relaxed">
              These show in the "Product Details" tab. Add Material, Size, Care etc.
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={spec.label}
                    onChange={e => setSpecs(p => p.map((s,j) => j===i ? {...s, label: e.target.value} : s))}
                    placeholder="e.g. Material"
                    className="w-24 sm:w-32 min-w-0 border border-[#e8e8e8] rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] flex-shrink-0" />
                  <input value={spec.value}
                    onChange={e => setSpecs(p => p.map((s,j) => j===i ? {...s, value: e.target.value} : s))}
                    placeholder="e.g. Premium ceramic"
                    className="flex-1 min-w-0 border border-[#e8e8e8] rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#c0555a]" />
                  <button onClick={() => setSpecs(p => p.filter((_,j) => j!==i))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Material","Size","Weight","Color","Print type","Production","Care","Packaging","Warranty"].map(label => (
                !specs.find(s => s.label === label) && (
                  <button key={label} onClick={() => setSpecs(p => [...p, { label, value: "" }])}
                    className="text-[11px] px-2.5 py-1 border border-dashed border-[#e8e8e8] text-[#888] rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                    + {label}
                  </button>
                )
              ))}
            </div>
            <button onClick={() => setSpecs(p => [...p, { label: "", value: "" }])}
              className="flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold hover:underline w-fit">
              <Plus size={14} /> Add custom spec
            </button>
          </Section>

          {/* Personalisation */}
          <Section title="Personalisation fields" collapsible
            defaultOpen={customizable || fastDelivery || hasCharm || custFields.length > 0}
            badge={
              (customizable || fastDelivery || hasCharm) && (
                <span className="text-[10px] bg-[#c0555a]/10 text-[#c0555a] px-2 py-0.5 rounded-full font-semibold">
                  {[customizable && "Personalisable", fastDelivery && "3hr delivery", hasCharm && "Charms"].filter(Boolean).join(" · ")}
                </span>
              )
            }>
            <InfoBox title="How personalisation works">
              <p className="mb-1.5">Customers fill a form before adding to cart.</p>
              <ul className="space-y-1 ml-3">
                <li>• <span className="font-medium">Name on mug</span> — Text input "Enter name"</li>
                <li>• <span className="font-medium">Photo on cushion</span> — Photo upload</li>
                <li>• <span className="font-medium">Birthday message</span> — Long text "Add a message"</li>
              </ul>
            </InfoBox>

            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setCustomizable(!customizable)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${customizable ? "bg-[#c0555a]" : "bg-[#e8e8e8]"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${customizable ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">Customers can personalise this product</p>
                <p className="text-[12px] text-[#888]">Toggle ON to show personalisation form on product page</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5 p-4 bg-[#fff8e6] rounded-xl border border-[#f4d35e]/40">
              <button onClick={() => setFastDelivery(!fastDelivery)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${fastDelivery ? "bg-[#c4922a]" : "bg-[#e8e8e8]"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${fastDelivery ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                  <Zap size={14} className="text-[#c4922a]" /> Enable 3-hour delivery
                  {fastDelivery && <span className="text-[10px] bg-[#c4922a] text-white px-2 py-0.5 rounded-full font-medium">Active</span>}
                </p>
                <p className="text-[12px] text-[#888]">Product will appear on the 3-hour delivery page (Jaipur only)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5 p-4 bg-[#f0f8f0] rounded-xl border border-[#86efac]/40">
              <button onClick={() => setHasCharm(!hasCharm)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${hasCharm ? "bg-[#22c55e]" : "bg-[#e8e8e8]"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${hasCharm ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#22c55e]" /> Enable charm selection
                  {hasCharm && <span className="text-[10px] bg-[#22c55e] text-white px-2 py-0.5 rounded-full font-medium">Active</span>}
                </p>
                <p className="text-[12px] text-[#888]">Customer can pick a charm to be added to this product</p>
              </div>
            </div>

            {customizable && (
              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider">Your personalisation fields</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <p className="text-[12px] text-[#aaa] w-full">Quick add:</p>
                  {[
                    { label:"Name field",   field:{ type:"text"     as const, label:"Enter name",    required:true,  placeholder:"e.g. Rahul",             maxLength:20  } },
                    { label:"Photo upload", field:{ type:"image"    as const, label:"Upload photo",  required:true,  placeholder:""                                      } },
                    { label:"Message box",  field:{ type:"textarea" as const, label:"Add a message", required:false, placeholder:"Write your message here", maxLength:150 } },
                  ].map(({ label, field }) => (
                    <button key={label}
                      onClick={() => setCustFields(p => [...p, field])}
                      className="text-[12px] px-3 py-1.5 bg-[#c0555a]/10 text-[#c0555a] border border-[#c0555a]/20 rounded-full hover:bg-[#c0555a]/20 transition-all font-semibold">
                      + {label}
                    </button>
                  ))}
                </div>

                {custFields.map((field, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-w-0">
                      <div>
                        <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">Field type</p>
                        <AdminSelect value={field.type}
                          onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, type: e.target.value as any} : f))}
                          className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white">
                          <option value="text">Text (short)</option>
                          <option value="textarea">Long text (message)</option>
                          <option value="image">Photo upload</option>
                          <option value="select">Dropdown choices</option>
                        </AdminSelect>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">Label</p>
                        <input value={field.label}
                          onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, label: e.target.value} : f))}
                          placeholder="e.g. Enter name"
                          className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a]" />
                      </div>
                      {field.type !== "image" && (
                        <div>
                          <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">Placeholder hint</p>
                          <input value={field.placeholder || ""}
                            onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, placeholder: e.target.value} : f))}
                            placeholder="e.g. e.g. Rahul"
                            className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a]" />
                        </div>
                      )}
                      {(field.type === "text" || field.type === "textarea") && (
                        <div>
                          <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">Max characters</p>
                          <input type="number" value={field.maxLength || ""}
                            onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, maxLength: parseInt(e.target.value)} : f))}
                            placeholder="e.g. 20"
                            className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a]" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 text-[13px] text-[#555] cursor-pointer sm:col-span-2">
                        <input type="checkbox" checked={field.required}
                          onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, required: e.target.checked} : f))}
                          className="accent-[#c0555a]" />
                        <span>Required — customer must fill this</span>
                      </label>
                    </div>
                    <button onClick={() => setCustFields(p => p.filter((_,j) => j!==i))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-all mt-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                <button onClick={() => setCustFields(p => [...p, { type: "text", label: "", required: false }])}
                  className="flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold hover:underline w-fit">
                  <Plus size={14} /> Add another field
                </button>

                {custFields.some(f => f.type === "text" || f.type === "textarea") && (
                  <div className={`mt-2 pt-4 border-t border-[#f0f0f0] ${PERSONALISATION_FONT_PRELOAD_CLASS}`}>
                    <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-1">
                      Fonts customer can choose from
                    </p>
                    <p className="text-[12px] text-[#aaa] mb-3">
                      Tick the fonts you want to offer for this product's text personalisation. Leave all unticked
                      to just use the default look — no font picker will show to the customer.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FONT_OPTIONS.map(f => (
                        <label key={f.id}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                            availableFonts.includes(f.id)
                              ? "border-[#c0555a] bg-[#c0555a]/5"
                              : "border-[#e8e8e8] hover:border-[#c0555a]/30"
                          }`}>
                          <input type="checkbox" checked={availableFonts.includes(f.id)}
                            onChange={() => toggleFont(f.id)}
                            className="accent-[#c0555a] flex-shrink-0" />
                          <span className="text-[14px] truncate" style={{ fontFamily: f.family || "Georgia" }}>
                            {f.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>

          {customizable && (
            <Section title="Live preview setup">
              <ZoneSelector
                templateUrl={previewTemplate}
                zones={(() => { try { return previewZones ? JSON.parse(previewZones) : []; } catch { return []; } })()}
                onTemplateChange={url => setPreviewTemplate(url)}
                onZonesChange={zones => setPreviewZones(JSON.stringify(zones))}
              />
            </Section>
          )}

          <Section title="Product variants" collapsible
            defaultOpen={variants.length > 0}
            badge={
              variants.length > 0 && (
                <span className="text-[10px] bg-[#c0555a]/10 text-[#c0555a] px-2 py-0.5 rounded-full font-semibold">
                  {new Set(variants.map(v => v.groupName)).size} group{new Set(variants.map(v => v.groupName)).size !== 1 ? "s" : ""}
                </span>
              )
            }>
            <p className="text-[12px] text-[#888] mb-4 leading-relaxed">
              Add variants like <strong>Color</strong>, <strong>Size</strong>, or <strong>Material</strong>.
              Each option can have its own price, stock, and image. Leave price blank to use the base product price.
            </p>
            <VariantBuilder
              variants={variants}
              onChange={setVariants}
              basePrice={price}
            />
          </Section>

          <Section title="Tags">
            <div className="flex gap-2 flex-wrap mb-3">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1.5 bg-[#f3efe8] text-[#555] border border-[#e8e0d5] text-[12px] px-3 py-1 rounded-full">
                  {t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))}>
                    <X size={11} className="text-[#aaa] hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter"
                className={`${inputCls()} flex-1`} />
              <button onClick={addTag}
                className="px-4 py-2.5 border border-[#e8e8e8] text-[13px] font-semibold text-[#555] rounded-xl hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                Add
              </button>
            </div>
          </Section>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-5">

          {/* Status */}
          <Section title="Status">
            <div className="flex flex-col gap-2">
              {STATUS_OPT.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    status === s ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e8e8] hover:border-[#c0555a]/30"
                  }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    status === s ? "border-[#c0555a] bg-[#c0555a]" : "border-[#e8e8e8]"
                  }`}>
                    {status === s && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">{s}</p>
                    <p className="text-[11px] text-[#888]">
                      {s === "ACTIVE" ? "Visible on store" : "Hidden from store"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* ── MULTI-CATEGORY SELECTOR ── */}
          <Section title="Categories">
            {errors.category && (
              <p className="text-[11px] text-red-500 mb-3">{errors.category}</p>
            )}

            {/* Selected summary */}
            {categoryIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedCatNames.map((name) => (
                  <span key={name} className="flex items-center gap-1 bg-[#c0555a]/10 text-[#c0555a] border border-[#c0555a]/20 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {name}
                    <button
                      onClick={() => {
                        const cat = categories.flatMap(p => [p, ...(p.children || [])]).find(c => c.name === name);
                        if (cat) toggleCategory(cat.id);
                      }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <input
              value={catSearch}
              onChange={e => setCatSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full border border-[#e8e8e8] rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] mb-3"
            />

            {/* Tree with checkboxes */}
            <div className="flex flex-col gap-0.5 max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {filteredCats.map(parent => {
                const hasChildren  = !!parent.children && parent.children.length > 0;
                const open         = isParentOpen(parent);
                const selectedKids = parent.children?.filter(c => categoryIds.includes(c.id)).length || 0;

                return (
                  <div key={parent.id}>
                    {/* Parent category */}
                    <div className={`w-full flex items-center gap-1 rounded-xl transition-all ${
                      categoryIds.includes(parent.id) ? "bg-[#c0555a]/8" : "hover:bg-[#f5f5f5]"
                    }`}>
                      <button
                        onClick={() => toggleCategory(parent.id)}
                        className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 text-[13px] min-w-0 ${
                          categoryIds.includes(parent.id) ? "text-[#c0555a]" : "text-[#1a1a1a]"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          categoryIds.includes(parent.id)
                            ? "bg-[#c0555a] border-[#c0555a]"
                            : "border-[#ddd]"
                        }`}>
                          {categoryIds.includes(parent.id) && (
                            <Check size={10} className="text-white" strokeWidth={3} />
                          )}
                        </div>
                        <Package size={13} className={categoryIds.includes(parent.id) ? "text-[#c0555a]" : "text-[#aaa]"} />
                        <span className="font-medium truncate">{parent.name}</span>
                        {!open && selectedKids > 0 && (
                          <span className="text-[10px] bg-[#c0555a]/15 text-[#c0555a] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                            {selectedKids} selected
                          </span>
                        )}
                      </button>
                      {hasChildren && (
                        <button onClick={() => toggleParentOpen(parent)}
                          className="w-8 h-8 flex items-center justify-center flex-shrink-0 mr-1">
                          <ChevronDown size={14} className={`text-[#aaa] transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {/* Child categories */}
                    {hasChildren && open && parent.children!.map(child => (
                      <button
                        key={child.id}
                        onClick={() => toggleCategory(child.id)}
                        className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-2 rounded-xl text-[12px] transition-all mt-0.5 ${
                          categoryIds.includes(child.id)
                            ? "bg-[#c0555a]/8 text-[#c0555a]"
                            : "hover:bg-[#f5f5f5] text-[#555]"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          categoryIds.includes(child.id)
                            ? "bg-[#c0555a] border-[#c0555a]"
                            : "border-[#ddd]"
                        }`}>
                          {categoryIds.includes(child.id) && (
                            <Check size={9} className="text-white" strokeWidth={3} />
                          )}
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${categoryIds.includes(child.id) ? "bg-[#c0555a]" : "bg-[#ddd]"}`} />
                        {child.name}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-[#aaa] mt-3">
              Select multiple categories. The first selected is the primary category.
            </p>
          </Section>

          {/* Badge */}
          <Section title="Badge">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBadge("")}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                  !badge ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-[#e8e8e8] text-[#555] hover:border-[#c0555a]"
                }`}>None</button>
              {BADGES.map(b => (
                <button key={b} onClick={() => setBadge(b === badge ? "" : b)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                    badge === b ? "bg-[#c0555a] text-white border-[#c0555a]" : "border-[#e8e8e8] text-[#555] hover:border-[#c0555a] hover:text-[#c0555a]"
                  }`}>{b}</button>
              ))}
            </div>
          </Section>

          {/* Preview */}
          {images[0] && (
            <Section title="Product preview">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f8f5f0] border border-[#e8e8e8]">
                <Image src={images[0]} alt="" fill className="object-cover" sizes="300px" />
                {badge && (
                  <span className="absolute top-2 left-2 bg-[#c0555a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
                {comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
                  <span className="absolute top-2 right-2 bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100)}%
                  </span>
                )}
              </div>
              <div className="mt-3">
                <p className="text-[13px] font-semibold text-[#1a1a1a] capitalize">{name || "Product name"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] font-bold">{price ? `Rs. ${price}` : "Rs. 0"}</span>
                  {comparePrice && <span className="text-[12px] text-gray-400 line-through">Rs. {comparePrice}</span>}
                </div>
                {customizable && (
                  <span className="flex items-center gap-1 text-[11px] text-[#c0555a] font-semibold mt-1">
                    <Sparkles size={10} /> Personalizable
                  </span>
                )}
                {categoryIds.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {categoryIds.length} categor{categoryIds.length === 1 ? "y" : "ies"}
                  </p>
                )}
              </div>
            </Section>
          )}

        </div>
      </div>
    </div>
  );
}