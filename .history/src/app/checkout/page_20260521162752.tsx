import { Metadata } from "next";
import { Suspense }  from "react";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Hashtag Gifting",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c0555a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutClient />
    </Suspense>
  );
}