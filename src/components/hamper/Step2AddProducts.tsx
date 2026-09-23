"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Check, Loader2 } from "lucide-react";
import type { SelectedHamperItem } from "@/types/hamper";
import { useHamperStore } from "@/lib/store/hamperStore";

const CATS = [
  { label: "All",        slug: "" },
  { label: "Chocolates", slug: "chocolates" },
  { label: "Candles",    slug: "candles" },
  { label: "Skincare",   slug: "skincare" },
  { label: "Dry Fruits", slug: "dry-fruits" },
  { label: "Stationery", slug: "stationery-gifts" },
  { label: "Mugs",       slug: "personalised-mugs" },
];

export default function Step2AddProducts() {
  const { selectedProducts, toggleProduct } = useHamperStore();
  const [activeCat, setActiveCat]           = useState("");
  const [products, setProducts]             = useState<SelectedHamperItem[]>([]);
  const [loading, setLoading]               = useState(true);

  const fetchProducts = useCallback((catSlug: string) => {
    setLoading(true);
    const url = catSlug
      ? `/api/products?category=${catSlug}&limit=24`
      : `/api/products?limit=24`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProducts(
          (data.products ?? []).map((p: any) => ({
            productId: p.id,
            name:      p.name,
            slug:      p.slug,
            price:     p.price,
            image:     p.images?.[0] ?? "",
          }))
        );
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(activeCat); }, [activeCat, fetchProducts]);

  const isSelected = (id: number) => selectedProducts.some((p) => p.productId === id);

  return (
    <div>
      <div className="mb-5">
        <h2
          className="text-[28px] text-[#1a1a1a] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Add Products
        </h2>
        <p className="text-[14px] text-gray-500">
          Pick items to fill your hamper
          {selectedProducts.length > 0 && (
            <span className="text-[#c0555a] font-medium">
              {" "}· {selectedProducts.length} selected
            </span>
          )}
        </p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATS.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCat(cat.slug)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
              activeCat === cat.slug
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]">Loading products…</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-[14px] text-gray-400">
          No products in this category yet
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product) => {
            const sel = isSelected(product.productId);
            return (
              <button
                key={product.productId}
                onClick={() => toggleProduct(product)}
                className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 group ${
                  sel
                    ? "border-[#c0555a] shadow-md shadow-[#c0555a]/10"
                    : "border-transparent hover:border-gray-200"
                }`}
              >
                <div className="relative aspect-square bg-[#f3efe8]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {sel && <div className="absolute inset-0 bg-[#c0555a]/10" />}
                  <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    sel ? "bg-[#c0555a]" : "bg-white/80 group-hover:bg-white shadow-sm"
                  }`}>
                    {sel
                      ? <Check size={13} className="text-white" strokeWidth={2.5} />
                      : <Plus  size={13} className="text-[#1a1a1a]" />
                    }
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{product.name}</p>
                  <p className="text-[13px] font-semibold text-[#c0555a] mt-0.5">
                    Rs. {(product.price / 100).toLocaleString("en-IN")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}