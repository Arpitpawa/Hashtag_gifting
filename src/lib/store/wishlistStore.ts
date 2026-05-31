import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
  id:        number;
  productId: number;
  product: {
    id:           number;
    name:         string;
    slug:         string;
    price:        number;
    comparePrice: number | null;
    images:       string[];
    badge:        string | null;
  };
}

interface WishlistState {
  items:       WishlistItem[];
  isLoading:   boolean;
  isLoggedIn:  boolean;

  // Local toggle (works without login)
  localIds:    number[]; // productIds for guests

  fetch:       ()                   => Promise<void>;
  toggle:      (productId: number)  => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  sync:        ()                   => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items:      [],
      isLoading:  false,
      isLoggedIn: false,
      localIds:   [],

      // ── FETCH FROM DB ──
      fetch: async () => {
        set({ isLoading: true });
        try {
          const res  = await fetch("/api/wishlist");
          const data = await res.json();

          if (Array.isArray(data)) {
            set({
              items:      data,
              isLoggedIn: true,
              localIds:   data.map((i: WishlistItem) => i.productId),
            });
          }
        } catch (err) {
          console.error("Wishlist fetch error:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      // ── TOGGLE (add/remove) ──
      toggle: async (productId) => {
        const isWishlisted = get().isWishlisted(productId);
        const isLoggedIn   = get().isLoggedIn;

        if (!isLoggedIn) {
          // Guest — just toggle local
          const localIds = get().localIds;
          set({
            localIds: isWishlisted
              ? localIds.filter((id) => id !== productId)
              : [...localIds, productId],
          });
          return;
        }

        // Logged in — sync with DB
        try {
          if (isWishlisted) {
            await fetch("/api/wishlist/remove", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ productId }),
            });
            set({
              items:    get().items.filter((i) => i.productId !== productId),
              localIds: get().localIds.filter((id) => id !== productId),
            });
          } else {
            await fetch("/api/wishlist/add", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ productId }),
            });
            await get().fetch();
          }
        } catch (err) {
          console.error("Wishlist toggle error:", err);
        }
      },

      // ── IS WISHLISTED ──
      isWishlisted: (productId) => {
        return get().localIds.includes(productId);
      },

      // ── SYNC GUEST WISHLIST ON LOGIN ──
      sync: async () => {
        const localIds = get().localIds;
        if (localIds.length === 0) return;

        try {
          await fetch("/api/wishlist/sync", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ items: localIds }),
          });
          await get().fetch();
        } catch (err) {
          console.error("Wishlist sync error:", err);
        }
      },
    }),
    {
      name:       "hashtag-wishlist",
      partialize: (state) => ({ localIds: state.localIds }),
    }
  )
);