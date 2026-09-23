"use client";

import { MessageSquare, User, Package, Gift, CreditCard } from "lucide-react";
import { useHamperStore } from "@/lib/store/hamperStore";

export default function Step4Personalize() {
  const {
    personalizationMsg, recipientName,
    setPersonalizationMsg, setRecipientName,
    selectedBox, selectedProducts, selectedCard,
    totalPrice,
  } = useHamperStore();

  const total = totalPrice();

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-[28px] text-[#1a1a1a] mb-1"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Personalize It
        </h2>
        <p className="text-[14px] text-gray-500">
          Your message will be printed on the card inside the hamper
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Form ── */}
        <div className="space-y-5">

          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#1a1a1a] mb-2">
              <User size={14} className="text-gray-400" />
              Recipient&apos;s Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Priya"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-[#c0555a] transition-colors bg-white"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#1a1a1a] mb-2">
              <MessageSquare size={14} className="text-gray-400" />
              Gift Message
              <span className="text-gray-400 font-normal ml-auto">
                {personalizationMsg.length}/150
              </span>
            </label>
            <textarea
              value={personalizationMsg}
              onChange={(e) => setPersonalizationMsg(e.target.value)}
              placeholder="Write a heartfelt message for the recipient..."
              maxLength={150}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:border-[#c0555a] transition-colors bg-white resize-none"
            />
          </div>

          {/* Live preview */}
          {(recipientName || personalizationMsg) && (
            <div className="bg-[#f3efe8] rounded-xl p-4 border border-[#e8e0d5]">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-medium">
                Card Preview
              </p>
              {recipientName && (
                <p className="text-[13px] text-[#6B4F3F] font-semibold mb-1">
                  Dear {recipientName},
                </p>
              )}
              <p className="text-[13px] text-[#1a1a1a] leading-relaxed italic">
                {personalizationMsg || "Your message will appear here…"}
              </p>
              <p className="text-[11px] text-gray-400 mt-2">
                — With love, Hashtag Gifting 🎁
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Summary ── */}
        <div className="bg-[#f3efe8] rounded-2xl p-5 h-fit border border-[#e8e0d5]">
          <p
            className="text-[16px] font-semibold text-[#1a1a1a] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Hamper Summary
          </p>

          <div className="space-y-3">

            {selectedBox && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Package size={13} className="text-[#c0555a] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500">Box</p>
                    <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{selectedBox.name}</p>
                  </div>
                </div>
                <p className="text-[12px] font-medium text-[#1a1a1a] flex-shrink-0 ml-2">
                  Rs. {(selectedBox.price / 100).toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {selectedProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift size={13} className="text-[#c0555a] flex-shrink-0" />
                  <p className="text-[10px] text-gray-500">Products ({selectedProducts.length})</p>
                </div>
                <div className="pl-5 space-y-1">
                  {selectedProducts.map((p) => (
                    <div key={p.productId} className="flex justify-between items-center">
                      <p className="text-[12px] text-[#1a1a1a] truncate mr-2">{p.name}</p>
                      <p className="text-[11px] text-gray-600 flex-shrink-0">
                        Rs. {(p.price / 100).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCard && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard size={13} className="text-[#c0555a] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500">Card</p>
                    <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{selectedCard.name}</p>
                  </div>
                </div>
                <p className="text-[12px] font-medium text-[#1a1a1a] flex-shrink-0 ml-2">
                  {selectedCard.price === 0
                    ? "Free"
                    : `Rs. ${(selectedCard.price / 100).toLocaleString("en-IN")}`}
                </p>
              </div>
            )}

            <div className="border-t border-[#e8e0d5] pt-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#1a1a1a]">Total</p>
              <p
                className="text-[20px] font-semibold text-[#c0555a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Rs. {(total / 100).toLocaleString("en-IN")}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}