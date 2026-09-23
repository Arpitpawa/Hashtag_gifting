"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/lib/store/wishlistStore";

// Mounted once at the root (see Providers.tsx) — watches for a session
// appearing (fresh login/signup via email, Google, or phone OTP; doesn't
// matter which, this only cares about the resulting session) and merges
// whatever was wishlisted as a guest into the now-logged-in account.
// Without this, a guest's wishlist selections either got silently lost or
// stayed stuck as local-only forever once they logged in.
export default function WishlistSync() {
  const { status } = useSession();
  const mergeGuestWishlist = useWishlistStore((s) => s.mergeGuestWishlist);
  const mergedRef = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && !mergedRef.current) {
      mergedRef.current = true;
      mergeGuestWishlist();
    }
    if (status === "unauthenticated") {
      // Allow a merge again if they log out and into a different account
      // later in the same browser tab.
      mergedRef.current = false;
    }
  }, [status, mergeGuestWishlist]);

  return null;
}
