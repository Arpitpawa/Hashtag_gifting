import { create } from "zustand";
import type { HamperStep, HamperState, SelectedHamperItem, GiftCard } from "@/types/hamper";

interface HamperStore extends HamperState {
  totalPrice:            () => number;
  setStep:               (step: HamperStep) => void;
  selectBox:             (box: SelectedHamperItem) => void;
  toggleProduct:         (product: SelectedHamperItem) => void;
  selectCard:            (card: GiftCard | null) => void;
  setPersonalizationMsg: (msg: string) => void;
  setRecipientName:      (name: string) => void;
  reset:                 () => void;
}

const initial: HamperState = {
  step:               1,
  selectedBox:        null,
  selectedProducts:   [],
  selectedCard:       null,
  personalizationMsg: "",
  recipientName:      "",
};

export const useHamperStore = create<HamperStore>((set, get) => ({
  ...initial,

  totalPrice: () => {
    const { selectedBox, selectedProducts, selectedCard } = get();
    return (
      (selectedBox?.price  ?? 0) +
      selectedProducts.reduce((s, p) => s + p.price, 0) +
      (selectedCard?.price ?? 0)
    );
  },

  setStep:    (step)    => set({ step }),
  selectBox:  (box)     => set({ selectedBox: box }),
  selectCard: (card)    => set({ selectedCard: card }),

  toggleProduct: (product) => {
    const { selectedProducts } = get();
    const exists = selectedProducts.some((p) => p.productId === product.productId);
    set({
      selectedProducts: exists
        ? selectedProducts.filter((p) => p.productId !== product.productId)
        : [...selectedProducts, product],
    });
  },

  setPersonalizationMsg: (personalizationMsg) => set({ personalizationMsg }),
  setRecipientName:      (recipientName)      => set({ recipientName }),
  reset:                 ()                   => set(initial),
}));