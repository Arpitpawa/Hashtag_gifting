import { Metadata } from "next";
import { Suspense }  from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  // Guest checkout removed, per Arpit: every order now needs a real
  // account — fixes the gap where guest orders never had an email on file
  // to send confirmations to, and gives every customer proper order
  // history + the ability to leave reviews later. Anyone not logged in
  // gets sent to /login (Google, email/password, or phone OTP — with a
  // link to /register for brand-new customers) and lands right back here
  // after signing in.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

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