"use client";

import { useState } from "react";
import { ShoppingBag, X, Loader2, Check } from "lucide-react";
import CustomizationForm from "./CustomizationForm";
import { useCartStore } from "@/lib/store/cartStore";

interface CustomizationField {
  type:       "text" | "textarea" | "image";
  label:      string;
  maxLength?: number;
  required:   boolean;
  placeholder?: string;
}

interface Props {
  productId:           number;
  productName:         string;
  customizable:        boolean;
  customizationFields: CustomizationField[];
  stock:               number;
}

export default function AddToCartButton({
  productId,
  productName,
  customizable,
  customizationFields,
  stock,
}: Props) {
  const { addToCart, isLoading } = useCartStore();

  const [showModal,     setShowModal]     = useState(false);
  const [customization, setCustomization] = useState<Record<string, string | undefined>>({});
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [adding,        setAdding]        = useState(false);
  const [added,         setAdded]         = useState(false);

  const isOutOfStock = stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    // If product is customizable → show modal first
    if (customizable && customizationFields.length > 0) {
      setShowModal(true);
      return;
    }

    // Non-customizable — add directly
    await addDirectly(null);
  };

  const handleModalSubmit = async () => {
    // Validate customization
    const res  = await fetch("/api/customization/validation", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ productId, customization }),
    });
    const data = await res.json();

    if (!data.valid) {
      setErrors(data.errors || {});
      return;
    }

    setErrors({});
    await addDirectly(customization);
    setShowModal(false);
  };

  const addDirectly = async (customizationData: any) => {
    setAdding(true);
    try {
      await addToCart(productId, 1, customizationData);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* ── ADD TO CART BUTTON ── */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || adding || isLoading}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-[14px] font-semibold transition-all duration-300 ${
          isOutOfStock
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : added
            ? "bg-green-500 text-white"
            : "bg-[#c0555a] text-white hover:bg-[#a84449]"
        }`}
      >
        {adding ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Adding...
          </>
        ) : added ? (
          <><Check size={16} /> Added to cart</>
        ) : isOutOfStock ? (
          "Out of stock"
        ) : (
          <>
            <ShoppingBag size={16} strokeWidth={2} />
            {customizable ? "Customize & add to cart" : "Add to cart"}
          </>
        )}
      </button>

      {/* ── CUSTOMIZATION MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* MODAL */}
          <div className="relative z-10 bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}
            <div className="sticky top-0 bg-white border-b border-[#e8e0d5] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#1a1a1a]">
                  Personalize your gift
                </h3>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">
                  {productName}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#f3efe8] flex items-center justify-center hover:bg-[#e8e0d5] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* FORM */}
            <div className="px-6 py-5">
              <CustomizationForm
                fields={customizationFields}
                value={customization}
                onChange={setCustomization}
                errors={errors}
              />
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 bg-white border-t border-[#e8e0d5] px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border-2 border-[#c0555a] text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={adding}
                className="flex-1 py-3 bg-[#c0555a] text-white text-[13px] font-semibold rounded-full hover:bg-[#a84449] transition-all duration-300 flex items-center justify-center gap-2"
               aria-label="Open cart">
                {adding ? (
                  <><Loader2 size={14} className="animate-spin" /> Adding...</>
                ) : (
                  <><ShoppingBag size={14} /> Add to cart</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}