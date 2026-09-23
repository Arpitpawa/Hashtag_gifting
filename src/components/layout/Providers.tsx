"use client";

import { SessionProvider } from "next-auth/react";
import WishlistSync from "@/components/layout/WishlistSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WishlistSync />
      {children}
    </SessionProvider>
  );
}