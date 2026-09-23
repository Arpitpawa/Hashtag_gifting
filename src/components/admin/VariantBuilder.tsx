"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  GripVertical, Star, Upload, Loader2, X,
} from "lucide-react";

export interface VariantRow {
  groupName:    string;
  optionName:   string;
  price:        string; // rupees as string, "" = use base price
  comparePrice: string;
  stock:        string;
  images:       string[];
  sku:          string;
  isDefault:    boolean;
}

interface Props {
  variants:   VariantRow[];
  onChange:   (variants: VariantRow[]) => void;
  basePrice:  string; // for display hint
}

const PRESET_GROUPS = ["Color", "Size", "Material", "Style", "Finish", "Flavour"];

// All unique group names currently in use
function getGroups(variants: VariantRow[]): string[] {
  return [...new Set(variants.map((v) => v.groupName).filter(Boolean))];
}

const emptyVariant = (groupName = ""): VariantRow => ({
  groupName, optionName: "", price: "", comparePrice: "",
  stock: "10", images: [], sku: "", isDefault: false,
});

export default function VariantBuilder({ variants, onChange, basePrice }: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [newGroupName, setNewGroupName] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [urlInputIdx,  setUrlInputIdx]  = useState<number | null>(null);
  const [urlDraft,     setUrlDraft]     = useState("");

  const groups = getGroups(variants);

  const toggleGroup = (g: string) =>
    setOpenGroups((p) => ({ ...p, [g]: !p[g] }));

  const addGroup = (name: string) => {
    if (!name.trim() || groups.includes(name.trim())) return;
    onChange([...variants, emptyVariant(name.trim())]);
    setOpenGroups((p) => ({ ...p, [name.trim()]: true }));
    setNewGroupName("");
  };

  const addOption = (groupName: string) => {
    onChange([...variants, emptyVariant(groupName)]);
  };

  const removeOption = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  const removeGroup = (groupName: string) => {
    onChange(variants.filter((v) => v.groupName !== groupName));
  };

  const updateOption = (idx: number, key: keyof VariantRow, value: string | boolean) => {
    onChange(variants.map((v, i) => i === idx ? { ...v, [key]: value } : v));
  };

  const updateImages = (idx: number, images: string[]) => {
    onChange(variants.map((v, i) => i === idx ? { ...v, images } : v));
  };

  // Uploads every selected file (in order) and appends them all to that
  // variant's image list — one round trip per file, sequential so the
  // upload rate-limit and result ordering both stay predictable.
  const uploadVariantImages = async (idx: number, files: FileList) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    setUploadingIdx(idx);
    try {
      const uploaded: string[] = [];
      for (const file of fileArr) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "products");
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
        else alert(data.error || `Upload failed for "${file.name}"`);
      }
      if (uploaded.length > 0) {
        updateImages(idx, [...(variants[idx].images || []), ...uploaded]);
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  const removeImage = (idx: number, imgIdx: number) => {
    updateImages(idx, (variants[idx].images || []).filter((_, i) => i !== imgIdx));
  };

  const moveImage = (idx: number, imgIdx: number, dir: -1 | 1) => {
    const imgs   = [...(variants[idx].images || [])];
    const target = imgIdx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[imgIdx], imgs[target]] = [imgs[target], imgs[imgIdx]];
    updateImages(idx, imgs);
  };

  const setDefault = (idx: number) => {
    // Only one default per group
    const groupName = variants[idx].groupName;
    onChange(
      variants.map((v, i) => ({
        ...v,
        isDefault: v.groupName === groupName ? i === idx : v.isDefault,
      }))
    );
  };

  if (variants.length === 0 && groups.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[#f3efe8] rounded-xl p-4 text-[13px] text-[#555] leading-relaxed">
          <p className="font-bold text-[#1a1a1a] mb-1">How variants work:</p>
          <p>Add variant groups like <strong>Color</strong> or <strong>Size</strong>, then add options under each group. Each option can have its own price, stock, and image.</p>
        </div>

        {/* Quick-add preset groups */}
        <div>
          <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-2">Quick add a group</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_GROUPS.map((g) => (
              <button key={g} onClick={() => addGroup(g)}
                className="px-4 py-2 border-2 border-dashed border-[#e8e8e8] text-[13px] text-[#888] rounded-xl hover:border-[#c0555a] hover:text-[#c0555a] transition-all font-medium">
                + {g}
              </button>
            ))}
          </div>
        </div>

        {/* Custom group */}
        <div className="flex gap-2">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGroup(newGroupName)}
            placeholder="Custom group name (e.g. Flavour)"
            className="flex-1 border border-[#e8e8e8] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a]"
          />
          <button onClick={() => addGroup(newGroupName)}
            className="px-4 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Existing groups */}
      {groups.map((groupName) => {
        const groupVariants = variants
          .map((v, i) => ({ ...v, _idx: i }))
          .filter((v) => v.groupName === groupName);
        const isOpen = openGroups[groupName] !== false; // default open

        return (
          <div key={groupName} className="border border-[#e8e8e8] rounded-2xl overflow-hidden">
            {/* Group header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
              <button onClick={() => toggleGroup(groupName)}
                className="flex items-center gap-2 flex-1 text-left">
                {isOpen ? <ChevronUp size={15} className="text-[#aaa]" /> : <ChevronDown size={15} className="text-[#aaa]" />}
                <span className="text-[14px] font-bold text-[#1a1a1a]">{groupName}</span>
                <span className="text-[12px] text-[#aaa] font-normal">
                  {groupVariants.length} option{groupVariants.length !== 1 ? "s" : ""}
                </span>
              </button>
              <button onClick={() => removeGroup(groupName)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-all">
                <Trash2 size={13} />
              </button>
            </div>

            {isOpen && (
              <div className="p-4 flex flex-col gap-3">
                {groupVariants.map((v) => (
                  <div key={v._idx} className="flex flex-col gap-2 p-3 bg-[#f9f9f9] rounded-xl border border-[#f0f0f0]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Option name */}
                      <div>
                        <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">Option name *</p>
                        <input
                          value={v.optionName}
                          onChange={(e) => updateOption(v._idx, "optionName", e.target.value)}
                          placeholder={groupName === "Color" ? "e.g. Red" : groupName === "Size" ? "e.g. Large" : "Option"}
                          className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">
                          Price (Rs.) <span className="normal-case font-normal">leave blank = Rs.{basePrice}</span>
                        </p>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateOption(v._idx, "price", e.target.value)}
                          placeholder={basePrice || "Same as base"}
                          className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">Stock</p>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateOption(v._idx, "stock", e.target.value)}
                          placeholder="10"
                          className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white"
                        />
                      </div>

                      {/* SKU */}
                      <div>
                        <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">SKU (optional)</p>
                        <input
                          value={v.sku}
                          onChange={(e) => updateOption(v._idx, "sku", e.target.value)}
                          placeholder="MUG-RED-001"
                          className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#c0555a] bg-white"
                        />
                      </div>
                    </div>

                    {/* Variant images */}
                    <div>
                      <p className="text-[10px] font-bold text-[#aaa] uppercase mb-1">
                        Variant images (optional) {v.images?.length > 0 && <span className="normal-case font-normal text-[#bbb]">— {v.images.length} photo{v.images.length !== 1 ? "s" : ""}</span>}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {(v.images || []).map((img, imgIdx) => (
                          <div key={imgIdx} className="group/img relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#e8e8e8] flex-shrink-0">
                            <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                            {imgIdx === 0 && (
                              <span className="absolute top-0.5 left-0.5 bg-[#c0555a] text-white text-[8px] font-bold px-1 py-0.5 rounded">Main</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover/img:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                              <button type="button" onClick={() => moveImage(v._idx, imgIdx, -1)} disabled={imgIdx === 0}
                                title="Move left"
                                className="w-5 h-5 flex items-center justify-center rounded bg-white/90 text-[#555] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors">
                                <ChevronLeft size={11} />
                              </button>
                              <button type="button" onClick={() => removeImage(v._idx, imgIdx)}
                                title="Remove"
                                className="w-5 h-5 flex items-center justify-center rounded bg-white/90 text-red-500 hover:bg-white transition-colors">
                                <X size={11} />
                              </button>
                              <button type="button" onClick={() => moveImage(v._idx, imgIdx, 1)} disabled={imgIdx === v.images.length - 1}
                                title="Move right"
                                className="w-5 h-5 flex items-center justify-center rounded bg-white/90 text-[#555] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors">
                                <ChevronRight size={11} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add more tile — supports selecting multiple files at once */}
                        <label className={`relative w-16 h-16 rounded-xl border-2 border-dashed flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                          uploadingIdx === v._idx ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e8e8] hover:border-[#c0555a] hover:bg-[#c0555a]/5"
                        }`}>
                          {uploadingIdx === v._idx ? (
                            <Loader2 size={16} className="animate-spin text-[#c0555a]" />
                          ) : (
                            <Upload size={16} className="text-[#c0555a]" />
                          )}
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden"
                            onChange={(e) => { if (e.target.files?.length) uploadVariantImages(v._idx, e.target.files); e.target.value = ""; }} />
                        </label>
                      </div>

                      <button type="button" onClick={() => { setUrlInputIdx((p) => (p === v._idx ? null : v._idx)); setUrlDraft(""); }}
                        className="text-[11px] text-[#888] hover:text-[#c0555a] font-medium w-fit mt-1.5">
                        {urlInputIdx === v._idx ? "Hide URL field" : "+ paste an image URL instead"}
                      </button>
                      {urlInputIdx === v._idx && (
                        <div className="flex gap-2 mt-1.5">
                          <input
                            value={urlDraft}
                            onChange={(e) => setUrlDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter" || !urlDraft.trim()) return;
                              updateImages(v._idx, [...(v.images || []), urlDraft.trim()]);
                              setUrlDraft("");
                            }}
                            placeholder="https://..."
                            className="flex-1 border border-[#e8e8e8] rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#c0555a] bg-white"
                          />
                          <button type="button"
                            onClick={() => {
                              if (!urlDraft.trim()) return;
                              updateImages(v._idx, [...(v.images || []), urlDraft.trim()]);
                              setUrlDraft("");
                            }}
                            className="px-3 py-2 bg-[#1a1a1a] text-white text-[12px] font-semibold rounded-lg hover:bg-[#333] transition-colors">
                            Add
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-[#bbb] mt-1.5">
                        First photo is the main/swatch image — use the arrows on a photo to reorder. Leave empty to use the product's main images.
                      </p>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setDefault(v._idx)}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          v.isDefault
                            ? "bg-[#c4922a] border-[#c4922a] text-white"
                            : "border-[#e8e8e8] text-[#888] hover:border-[#c4922a] hover:text-[#c4922a]"
                        }`}
                      >
                        <Star size={10} fill={v.isDefault ? "white" : "none"} />
                        {v.isDefault ? "Default" : "Set as default"}
                      </button>
                      <button onClick={() => removeOption(v._idx)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add option button */}
                <button
                  onClick={() => addOption(groupName)}
                  className="flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold hover:underline w-fit"
                >
                  <Plus size={14} /> Add {groupName} option
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add another group */}
      <div className="flex flex-col gap-3 pt-1">
        <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider">Add another group</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_GROUPS.filter((g) => !groups.includes(g)).map((g) => (
            <button key={g} onClick={() => addGroup(g)}
              className="px-3 py-1.5 border-2 border-dashed border-[#e8e8e8] text-[12px] text-[#888] rounded-xl hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
              + {g}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGroup(newGroupName)}
            placeholder="Custom group name"
            className="flex-1 border border-[#e8e8e8] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a]"
          />
          <button onClick={() => addGroup(newGroupName)}
            className="px-4 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}