"use client";

import Image from "next/image";
import { ShoppingBag, X, Package } from "lucide-react";
import { useHamperStore } from "@/lib/store/hamperStore";

export default function HamperSidebar({ step }: { step: number }) {
  const { selectedBox, selectedProducts, selectedCard, toggleProduct, totalPrice } =
    useHamperStore();

  const total    = totalPrice();
  const hasItems = selectedBox || selectedProducts.length > 0 || selectedCard;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm sticky top-24">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3
          className="text-[15px] font-semibold text-[#1a1a1a]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Your Hamper
        </h3>
        {total > 0 && (
          <p className="text-[13px] text-gray-500 mt-0.5">
            Rs. {(total / 100).toLocaleString("en-IN")} total
          </p>
        )}
      </div>

      {/* Items */}
      <div className="px-5 py-4 min-h-[180px]">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingBag size={26} className="text-gray-200 mb-2" />
            <p className="text-[12px] text-gray-400">Start building your hamper</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedBox && (
              <SidebarRow image={selectedBox.image} name={selectedBox.name} price={selectedBox.price} badge="Box" />
            )}
            {selectedProducts.map((p) => (
              <SidebarRow
                key={p.productId}
                image={p.image}
                name={p.name}
                price={p.price}
                onRemove={step === 2 ? () => toggleProduct(p) : undefined}
              />
            ))}
            {selectedCard && (
              <SidebarRow
                image={selectedCard.image}
                name={selectedCard.name}
                price={selectedCard.price}
                badge="Card"
                isFree={selectedCard.price === 0}
              />
            )}
          </div>
        )}
      </div>

      {/* Total */}
      {total > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[12px] text-gray-500">Total</span>
          <span className="text-[15px] font-semibold text-[#1a1a1a]">
            Rs. {(total / 100).toLocaleString("en-IN")}
          </span>
        </div>
      )}

    </div>
  );
}

function SidebarRow({
  image, name, price, badge, isFree, onRemove,
}: {
  image:     string;
  name:      string;
  price:     number;
  badge?:    string;
  isFree?:   boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#f3efe8]">
        {image
          ? <Image src={image} alt={name} fill className="object-cover" sizes="44px" />
          : <Package size={18} className="text-gray-300 absolute inset-0 m-auto" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{name}</p>
        <p className="text-[11px] text-[#c0555a]">
          {isFree ? "Free" : `Rs. ${(price / 100).toLocaleString("en-IN")}`}
        </p>
      </div>
      {badge && (
        <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0">
          {badge}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
         aria-label="Close">
          <X size={11} className="text-gray-400 hover:text-red-400" />
        </button>
      )}
    </div>
  );
}