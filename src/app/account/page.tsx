import { Metadata } from "next";
import AccountClient from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "My Account — Hashtag Gifting",
};

export default function AccountPage() {
  return <AccountClient />;
}