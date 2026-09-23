import { Metadata } from "next";
import { Suspense } from "react";
import AccountClient from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "My Account",
};

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountClient />
    </Suspense>
  );
}