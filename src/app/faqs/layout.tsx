import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about ordering, personalisation, delivery and returns at Hashtag Gifting.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
