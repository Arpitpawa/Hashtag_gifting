import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search gifts",
  description: "Search personalised gifts at Hashtag Gifting.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
