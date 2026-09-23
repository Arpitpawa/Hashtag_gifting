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
  localIds:    number[];
  isLoading:   boolean;

  fetch:               ()                  => Promise<void>;
  toggle:              (productId: number) => Promise<void>;
  isWishlisted:        (productId: number) => boolean;
  mergeGuestWishlist:  ()                  => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items:     [],
      localIds:  [],
      isLoading: false,

      fetch: async () => {
        set({ isLoading: true });
        try {
          const res  = await fetch("/api/wishlist");
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            set({
              items:    data,
              localIds: data.map((i: WishlistItem) => i.productId),
            });
          }
        } catch {}
        finally { set({ isLoading: false }); }
      },

      toggle: async (productId) => {
        const wishlisted = get().isWishlisted(productId);

        // Optimistic update locally first
        if (wishlisted) {
          set({
            localIds: get().localIds.filter(id => id !== productId),
            items:    get().items.filter(i => i.productId !== productId),
          });
        } else {
          set({ localIds: [...get().localIds, productId] });
        }

        // Try to sync with DB (works if logged in, silently fails if not)
        try {
          if (wishlisted) {
            await fetch("/api/wishlist/remove", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ productId }),
            });
          } else {
            const res = await fetch("/api/wishlist/add", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ productId }),
            });
            if (res.ok) {
              // Refresh to get full product data
              await get().fetch();
            }
          }
        } catch {}
      },

      isWishlisted: (productId) => get().localIds.includes(productId),

      // Called once, right after a login/signup is detected (see
      // WishlistSync.tsx) — pushes whatever was wishlisted while browsing
      // as a guest up to the account's real DB wishlist, instead of that
      // selection either vanishing or staying stuck as local-only forever.
      // /api/wishlist/add is an upsert (safe to call for ids already
      // synced), so this is safe to run more than once.
      mergeGuestWishlist: async () => {
        const idsToMerge = get().localIds;
        if (idsToMerge.length === 0) return;

        try {
          await Promise.all(
            idsToMerge.map((productId) =>
              fetch("/api/wishlist/add", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ productId }),
              }).catch(() => {})
            )
          );
        } finally {
          // Re-pull from the DB now that it's the merged, authoritative
          // list — replaces the local-only ids with the real synced ones.
          await get().fetch();
        }
      },
    }),
    {
      name:       "hashtag-wishlist",
      partialize: (state) => ({ localIds: state.localIds }),
    }
  )
);