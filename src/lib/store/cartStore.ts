import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomizationData {
  name?:     string;
  message?:  string;
  photoUrl?: string;
  variantSelections?: { groupName: string; optionName: string; variantId: number; price: number | null }[];
  [key: string]: any;
}

interface CartItem {
  id:            number;
  productId:     number;
  variantId:     number | null;
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
  // Present only when this item was added with a specific variant selected —
  // its price/stock, not the base product's, are what actually govern this
  // item once set.
  variant: {
    id:           number;
    optionName:   string;
    groupName:    string;
    price:        number | null;
    comparePrice: number | null;
    stock:        number;
  } | null;
  subtotal: number; // paise — already variant-price-aware from the API
}

interface AppliedCoupon {
  code:     string;
  discount: number; // paise
  id:       number;
}

interface CartState {
  cartId:    number | null;
  items:     CartItem[];
  itemCount: number;
  subtotal:  number; // paise
  isLoading: boolean;
  appliedCoupon: AppliedCoupon | null;

  // Actions
  fetchCart:    ()                                                    => Promise<void>;
  addToCart:    (productId: number, quantity?: number, customization?: CustomizationData | null, variantId?: number | null) => Promise<void>;
  updateItem:   (itemId: number, quantity: number)                   => Promise<void>;
  removeItem:   (itemId: number)                                     => Promise<void>;
  clearCart:    ()                                                    => Promise<void>;
  mergeGuestCart: ()                                                  => Promise<void>;
  setCartId:    (id: number)                                         => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null)                   => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId:    null,
      items:     [],
      itemCount: 0,
      subtotal:  0,
      isLoading: false,
      appliedCoupon: null,

      setCartId: (id) => set({ cartId: id }),
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),

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

            // Re-validate any applied coupon against the fresh subtotal.
            // Cart contents may have changed since the coupon was applied
            // (items added/removed, quantities changed) — without this, the
            // cached discount goes stale and causes a checkout total mismatch.
            const coupon = get().appliedCoupon;
            if (coupon) {
              try {
                const vRes = await fetch("/api/coupons/validate", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code: coupon.code, subtotal: data.cart.subtotal }),
                });
                const vData = await vRes.json();
                if (vData.valid) {
                  set({ appliedCoupon: { code: coupon.code, discount: vData.discount, id: vData.couponId } });
                } else {
                  // No longer eligible for this cart (e.g. min order no longer met) — drop it
                  set({ appliedCoupon: null });
                }
              } catch {
                // Network hiccup — leave it as-is rather than dropping it over a blip
              }
            }
          }
        } catch (err) {
          console.error("Fetch cart error:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      // ── ADD TO CART ──
      addToCart: async (productId, quantity = 1, customization, variantId = null) => {
        set({ isLoading: true });
        try {
          const cartId = get().cartId;
          const res = await fetch("/api/cart/add", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ productId, quantity, customization, cartId, variantId }),
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

        set({ items: [], itemCount: 0, subtotal: 0, appliedCoupon: null });
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
      // Persist cartId + applied coupon — items are always refetched fresh from DB
      partialize: (state) => ({ cartId: state.cartId, appliedCoupon: state.appliedCoupon }),
    }
  )
);

// ── HELPER: format price paise → rupees ──
export const formatPrice = (paise: number): string => {
  return `Rs. ${Math.round(paise / 100).toLocaleString("en-IN")}`;
};