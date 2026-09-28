"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, Plus, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";
import { useCartStore } from "@/lib/store/cartStore";

interface Companion {
  id:           number;
  name:         string;
  slug:         string;
  price:        number;
  comparePrice: number | null;
  images:       string[];
  stock:        number;
}

interface Props {
  currentProduct: { id: number; name: string; price: number; images: string[] };
  categoryId:     number | null;
}

export default function FrequentlyBoughtTogether({ currentProduct, categoryId }: Props) {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [selected,   setSelected]   = useState<Set<number>>(new Set());
  const [loading,    setLoading]    = useState(true);
  const [adding,     setAdding]     = useState(false);
  const [added,      setAdded]      = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    // Same shape as SimilarProducts.tsx's own fetch effect elsewhere in this
    // codebase -- setState calls live inside this inner async function
    // rather than directly in the effect body.
    const fetchCompanions = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ productId: String(currentProduct.id) });
        if (categoryId) qs.set("categoryId", String(categoryId));

        const res  = await fetch(`/api/products/frequently-bought-together?${qs}`);
        const data = await res.json();
        const items: Companion[] = data.products || [];
        setCompanions(items);
        setSelected(new Set(items.filter((p) => p.stock > 0).map((p) => p.id)));
      } catch (err) {
        console.error("Frequently bought together error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanions();
  }, [currentProduct.id, categoryId]);

  if (loading || companions.length === 0) return null;

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedItems = companions.filter((c) => selected.has(c.id));
  const total = selectedItems.reduce((sum, c) => sum + c.price, 0);

  const handleAdd = async () => {
    if (selectedItems.length === 0) return;
    setAdding(true);
    try {
      // Non-customizable by construction (see the API route) -- straight
      // add, no variant/customization step needed.
      for (const item of selectedItems) {
        await addToCart(item.id, 1, null, null);
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="mb-16 bg-white rounded-2xl border border-[#e8e0d5] p-5 md:p-6">
      <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-5">Frequently bought together</h2>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Current product — always included, not a checkbox (it has its own Add to cart above) */}
        <div className="flex flex-col items-center gap-2 w-[92px] flex-shrink-0">
          <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 border-[#c0555a] bg-[#f3efe8]">
            <Image src={currentProduct.images[0]} alt={currentProduct.name} fill className="object-cover" sizes="72px" />
          </div>
          <p className="text-[10px] text-[#888] text-center">This item</p>
        </div>

        {companions.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <Plus size={16} className="text-[#ccc] flex-shrink-0" />
            {/* Button wraps only the image -- a Link (name) sits outside it
                as a sibling, never nested inside a button (invalid HTML,
                unreliable click behavior for the two overlapping actions). */}
            <div className="flex flex-col items-center gap-2 w-[92px] flex-shrink-0">
              <button
                onClick={() => c.stock > 0 && toggle(c.id)}
                disabled={c.stock === 0}
                aria-pressed={selected.has(c.id)}
                aria-label={selected.has(c.id) ? `Remove ${c.name} from bundle` : `Add ${c.name} to bundle`}
                className={`relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 bg-[#f3efe8] transition-colors disabled:opacity-40 ${
                  selected.has(c.id) ? "border-[#c0555a]" : "border-[#e8e0d5]"
                }`}
              >
                <Image src={c.images[0]} alt={c.name} fill className="object-cover" sizes="72px" />
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors ${
                  selected.has(c.id) ? "bg-[#c0555a] border-[#c0555a]" : "bg-white/90 border-[#ccc]"
                }`}>
                  {selected.has(c.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
              </button>
              <Link
                href={`/product/${c.slug}`}
                className="text-[10px] text-[#555] text-center leading-snug line-clamp-2 hover:text-[#c0555a] hover:underline"
              >
                {c.name}
              </Link>
              <p className="text-[11px] font-bold text-[#1a1a1a]">
                {c.stock === 0 ? "Out of stock" : formatPrice(c.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e8e0d5]">
        <p className="text-[13px] text-[#555]">
          {selectedItems.length > 0 ? (
            <>Selected item{selectedItems.length > 1 ? "s" : ""}: <span className="font-bold text-[#1a1a1a]">{formatPrice(total)}</span></>
          ) : (
            "Nothing selected"
          )}
        </p>
        <button
          onClick={handleAdd}
          disabled={selectedItems.length === 0 || adding}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-50"
        >
          {adding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : added ? (
            <Check size={14} />
          ) : (
            <ShoppingBag size={14} />
          )}
          {added ? "Added!" : `Add ${selectedItems.length || ""} to cart`}
        </button>
      </div>
    </section>
  );
}
