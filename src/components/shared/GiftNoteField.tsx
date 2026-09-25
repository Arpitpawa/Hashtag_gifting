"use client";

import { Gift } from "lucide-react";
import { useCartStore, GIFT_NOTE_MAX_LEN } from "@/lib/store/cartStore";

// Shared everywhere the gift note can be set or edited (product page, cart
// page, checkout) so there's exactly one place that knows the field's shape
// and max length — reads/writes the same cart-store value directly, so
// whatever's typed on the product page is already there when the customer
// reaches checkout, and editing it on any of the three pages updates the rest.
export default function GiftNoteField({
  bordered = true,
  className = "",
}: {
  // false: renders unwrapped, for a spot that already sits inside its own
  // card (e.g. checkout's address step) — true wraps it in its own white card.
  bordered?: boolean;
  className?: string;
}) {
  const { giftNote, setGiftNote } = useCartStore();

  const field = (
    <>
      <label className="text-[14px] font-bold text-[#1a1a1a] mb-1 flex items-center gap-2">
        <Gift size={16} className="text-[#c0555a]" /> Add a gift note
        <span className="text-[12px] font-normal text-[#aaa]">(optional)</span>
      </label>
      <p className="text-[11px] text-[#aaa] mb-2">
        One note for the whole order — write it here or later, it carries through to checkout.
      </p>
      <textarea
        value={giftNote}
        onChange={(e) => setGiftNote(e.target.value)}
        placeholder="Write a little something for the person receiving this gift..."
        rows={3}
        maxLength={GIFT_NOTE_MAX_LEN}
        className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0555a] resize-none placeholder:text-[#bbb] bg-white"
      />
      <p className="text-[11px] text-[#aaa] text-right mt-1">{giftNote.length}/{GIFT_NOTE_MAX_LEN}</p>
    </>
  );

  if (!bordered) return <div className={className}>{field}</div>;

  return (
    <div className={`bg-white rounded-2xl border border-[#e8e0d5] p-5 ${className}`}>
      {field}
    </div>
  );
}
