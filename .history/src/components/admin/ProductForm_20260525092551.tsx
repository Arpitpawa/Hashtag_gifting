"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Plus, X, Loader2, CheckCircle,
  Upload, Sparkles, Tag, Package, ImagePlus,
  ChevronDown, Trash2, GripVertical,
} from "lucide-react";

interface Category { id: number; name: string; slug: string; parentId: number | null; }

interface CustomField {
  type:        "text" | "textarea" | "image" | "select";
  label:       string;
  required:    boolean;
  placeholder?: string;
  maxLength?:  number;
  options?:    string[];
}

interface Props {
  mode:       "create" | "edit";
  productId?: number;
}

const BADGES     = ["Best seller", "New", "Trending", "Premium", "Limited", "Sale"];
const STATUS_OPT = ["ACTIVE", "DRAFT"];

// ── These MUST be outside ProductForm to avoid remount on every keystroke ────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6">
      <h3 className="text-[14px] font-bold text-[#1a1a1a] mb-5 pb-3 border-b border-[#f0f0f0]">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
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

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name,         setName]         = useState("");
  const [description,  setDescription]  = useState("");
  const [price,        setPrice]        = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock,        setStock]        = useState("");
  const [badge,        setBadge]        = useState("");
  const [tags,         setTags]         = useState<string[]>([]);
  const [tagInput,     setTagInput]     = useState("");
  const [categoryId,   setCategoryId]   = useState<number | null>(null);
  const [status,       setStatus]       = useState("ACTIVE");
  const [customizable, setCustomizable] = useState(false);
  const [images,       setImages]       = useState<string[]>([]);
  const [custFields,   setCustFields]   = useState<CustomField[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [saving,       setSaving]       = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [uploading,    setUploading]    = useState(false);
  const [imageUrl,     setImageUrl]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(data => {
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  // Load product for edit mode
  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    fetch(`/api/admin/products/${productId}`).then(r => r.json()).then(p => {
      setName(p.name || "");
      setDescription(p.description || "");
      setPrice(p.price ? (p.price / 100).toString() : "");
      setComparePrice(p.comparePrice ? (p.comparePrice / 100).toString() : "");
      setStock(p.stock?.toString() || "");
      setBadge(p.badge || "");
      setTags(p.tags || []);
      setCategoryId(p.categoryId || null);
      setStatus(p.status || "ACTIVE");
      setCustomizable(p.customizable || false);
      setImages(p.images || []);
      setCustFields(p.customizationFields || []);
    });
  }, [mode, productId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput("");
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImages(p => [...p, data.url]);
      else alert("Upload failed — check Cloudinary keys");
    } catch { alert("Upload failed"); }
    finally { setUploading(false); }
  };

  const addImageUrl = () => {
    if (!imageUrl.trim()) return;
    setImages(p => [...p, imageUrl.trim()]);
    setImageUrl("");
  };

  const addCustField = () => {
    setCustFields(p => [...p, { type: "text", label: "", required: false }]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())   e.name  = "Product name is required";
    if (!price)         e.price = "Price is required";
    if (parseFloat(price) <= 0) e.price = "Price must be greater than 0";
    if (!categoryId)    e.category = "Please select a category";
    if (!stock)         e.stock = "Stock is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name, description, price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock), badge: badge || null, tags,
        categoryId, status, customizable,
        images, customizationFields: customizable ? custFields : [],
      };

      const url    = mode === "edit" ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/admin/products");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally { setSaving(false); }
  };

  // ── Category tree ─────────────────────────────────────────────────────────────
  const parents  = categories.filter(c => !c.parentId);
  const children = (parentId: number) => categories.filter(c => c.parentId === parentId);

  const inputCls = (err?: string) =>
    `w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-colors bg-white ${
      err ? "border-red-400 focus:border-red-400" : "border-[#e8e8e8] focus:border-[#c0555a]"
    }`;

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">

      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-center hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1a1a]">
            {mode === "edit" ? "Edit product" : "Add new product"}
          </h1>
          <p className="text-[13px] text-[#888] mt-0.5">
            {mode === "edit" ? "Update product details" : "Fill in the details to create a new product"}
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <button onClick={() => router.back()}
            className="px-5 py-2.5 border border-[#e8e8e8] text-[13px] font-semibold text-[#555] rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-60">
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : <><CheckCircle size={15} /> {mode === "edit" ? "Save changes" : "Publish product"}</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-5">

          {/* Basic info */}
          <Section title="Basic information">
            <div className="flex flex-col gap-4">
              <Field label="Product name" error={errors.name} required>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Personalised birthday mug for her"
                  className={inputCls(errors.name)} />
              </Field>

              <Field label="Description">
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={4} placeholder="Describe the product, what makes it special..."
                  className={`${inputCls()} resize-none`} />
              </Field>
            </div>
          </Section>

          {/* Pricing & Stock */}
          <Section title="Pricing & stock">
            <div className="grid grid-cols-3 gap-4">
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
              {/* Image grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#e8e8e8] group">
                      <Image src={img} alt="" fill className="object-cover" sizes="120px" />
                      {i === 0 && (
                        <div className="absolute top-1 left-1 bg-[#c0555a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          Main
                        </div>
                      )}
                      <button onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload */}
              <div className="flex gap-3">
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-[#e8e8e8] rounded-xl text-[13px] text-[#888] hover:border-[#c0555a] hover:text-[#c0555a] transition-all disabled:opacity-50">
                  {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                    : <><Upload size={16} /> Upload from device</>}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
              </div>

              {/* Or paste URL */}
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

          {/* Customization */}
          <Section title="Personalisation">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setCustomizable(!customizable)}
                className={`relative w-10 h-6 rounded-full transition-colors ${customizable ? "bg-[#c0555a]" : "bg-[#e8e8e8]"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${customizable ? "translate-x-5" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">This product can be personalised</p>
                <p className="text-[12px] text-[#888]">Customers can add names, photos, messages etc.</p>
              </div>
            </div>

            {customizable && (
              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider">Customization fields</p>
                {custFields.map((field, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
                    <GripVertical size={16} className="text-[#ccc] mt-2 flex-shrink-0 cursor-grab" />
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <select value={field.type}
                        onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, type: e.target.value as any} : f))}
                        className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white">
                        <option value="text">Text input</option>
                        <option value="textarea">Long text</option>
                        <option value="image">Photo upload</option>
                        <option value="select">Dropdown</option>
                      </select>
                      <input value={field.label}
                        onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, label: e.target.value} : f))}
                        placeholder="Field label (e.g. Enter name)"
                        className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a]" />
                      {field.type !== "image" && (
                        <input value={field.placeholder || ""}
                          onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, placeholder: e.target.value} : f))}
                          placeholder="Placeholder text"
                          className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a]" />
                      )}
                      {(field.type === "text" || field.type === "textarea") && (
                        <input type="number" value={field.maxLength || ""}
                          onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, maxLength: parseInt(e.target.value)} : f))}
                          placeholder="Max characters"
                          className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a]" />
                      )}
                      <label className="flex items-center gap-2 text-[13px] text-[#555] cursor-pointer">
                        <input type="checkbox" checked={field.required}
                          onChange={e => setCustFields(p => p.map((f,j) => j===i ? {...f, required: e.target.checked} : f))}
                          className="accent-[#c0555a]" />
                        Required field
                      </label>
                    </div>
                    <button onClick={() => setCustFields(p => p.filter((_,j) => j!==i))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-all mt-1.5">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button onClick={addCustField}
                  className="flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold hover:underline w-fit">
                  <Plus size={14} /> Add field
                </button>
              </div>
            )}
          </Section>

          {/* Tags */}
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
                placeholder="Type a tag and press Enter (e.g. birthday, mug, personalised)"
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

          {/* Category */}
          <Section title="Category">
            <div className="flex flex-col gap-2">
              {errors.category && <p className="text-[11px] text-red-500">{errors.category}</p>}
              {parents.map(parent => (
                <div key={parent.id}>
                  {/* Parent */}
                  <button onClick={() => setCategoryId(parent.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] transition-all ${
                      categoryId === parent.id ? "bg-[#c0555a] text-white font-semibold" : "hover:bg-[#f5f5f5] text-[#1a1a1a] font-medium"
                    }`}>
                    <Package size={14} className={categoryId === parent.id ? "text-white" : "text-[#aaa]"} />
                    {parent.name}
                  </button>
                  {/* Children */}
                  {children(parent.id).map(child => (
                    <button key={child.id} onClick={() => setCategoryId(child.id)}
                      className={`w-full flex items-center gap-2 pl-8 pr-3 py-2 rounded-xl text-[12px] transition-all mt-0.5 ${
                        categoryId === child.id ? "bg-[#c0555a]/10 text-[#c0555a] font-semibold" : "hover:bg-[#f5f5f5] text-[#555]"
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${categoryId === child.id ? "bg-[#c0555a]" : "bg-[#ddd]"}`} />
                      {child.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
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
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}