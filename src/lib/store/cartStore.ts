import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomizationData {
  name?:     string;
  message?:  string;
  photoUrl?: string;
}

interface CartItem {
  id:            number;
  productId:     number;
  quantity:      number;
  customization: CustomizationData | null;
  product: {
    id:           number;
    name:         string;
    slug:         string;
    price:        number; // paise
    comparePrice: number | null;
    images:       string[];
    stock:        number;
    customizable: boolean;
  };
  subtotal: number; // paise
}

interface CartState {
  cartId:    number | null;
  items:     CartItem[];
  itemCount: number;
  subtotal:  number; // paise
  isLoading: boolean;

  // Actions
  fetchCart:    ()                                                    => Promise<void>;
  addToCart:    (productId: number, quantity?: number, customization?: CustomizationData) => Promise<void>;
  updateItem:   (itemId: number, quantity: number)                   => Promise<void>;
  removeItem:   (itemId: number)                                     => Promise<void>;
  clearCart:    ()                                                    => Promise<void>;
  mergeGuestCart: ()                                                  => Promise<void>;
  setCartId:    (id: number)                                         => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId:    null,
      items:     [],
      itemCount: 0,
      subtotal:  0,
      isLoading: false,

      setCartId: (id) => set({ cartId: id }),

      // ── FETCH CART ──
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          const url = cartId ? `/api/cart?cartId=${cartId}` : "/api/cart";
          const res = await fetch(url);
          const data = await res.json();

          if (data.success) {
            set({
              cartId:    data.cartId,
              items:     data.cart.items,
              itemCount: data.cart.itemCount,
              subtotal:  data.cart.subtotal,
            });
          }
        } catch (err) {
          console.error("Fetch cart error:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      // ── ADD TO CART ──
      addToCart: async (productId, quantity = 1, customization) => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          const res = await fetch("/api/cart/add", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ productId, quantity, customization, cartId }),
          });

          const data = await res.json();

          if (data.success) {
            set({ cartId: data.cartId, itemCount: data.itemCount });
            // Re-fetch full cart to get updated items
            await get().fetchCart();
          } else {
            throw new Error(data.error || "Failed to add to cart");
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // ── UPDATE QUANTITY ──
      updateItem: async (itemId, quantity) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/cart/update", {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ itemId, quantity }),
          });

          if (res.ok) {
            await get().fetchCart();
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // ── REMOVE ITEM ──
      removeItem: async (itemId) => {
        set({ isLoading: true });
        try {
          await fetch("/api/cart/remove", {
            method:  "DELETE",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ itemId }),
          });

          await get().fetchCart();
        } finally {
          set({ isLoading: false });
        }
      },

      // ── CLEAR CART ──
      clearCart: async () => {
        const cartId = get().cartId;
        if (!cartId) return;

        await fetch("/api/cart/clear", {
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ cartId }),
        });

        set({ items: [], itemCount: 0, subtotal: 0 });
      },

      // ── MERGE GUEST CART ON LOGIN ──
      mergeGuestCart: async () => {
        const guestCartId = get().cartId;
        if (!guestCartId) return;

        try {
          const res = await fetch("/api/cart/merge", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ guestCartId }),
          });

          const data = await res.json();
          if (data.success && data.cartId) {
            set({ cartId: data.cartId });
            await get().fetchCart();
          }
        } catch (err) {
          console.error("Merge cart error:", err);
        }
      },
    }),
    {
      name:    "hashtag-cart",
      // Only persist cartId — items are fetched fresh from DB
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
);

// ── HELPER: format price paise → rupees ──
export const formatPrice = (paise: number): string => {
  return `Rs. ${(paise / 100).toLocaleString("en-IN")}`;
};