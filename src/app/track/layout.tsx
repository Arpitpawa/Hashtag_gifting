import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Track your Hashtag Gifting order status.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
