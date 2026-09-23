import type { Metadata } from "next";
import Link from "next/link";
import BuildHamperClient from "./BuildHamperClient";
import { HAMPER_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  robots: HAMPER_ENABLED ? undefined : { index: false, follow: false },
  title:       "Build Your Hamper",
  description: "Create a personalised gift hamper with your choice of box, products, card and message. Same day delivery in Jaipur.",
  openGraph: {
    title:       "Build Your Own Hamper | Hashtag Gifting",
    description: "Curate your perfect gift hamper — your way.",
  },
};

export default function BuildHamperPage() {
  if (!HAMPER_ENABLED) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-[32px] md:text-[44px] text-[#1a1a1a] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Hamper builder — coming soon
        </h1>
        <p className="text-[#666] max-w-md mb-8">We're putting the finishing touches on custom hampers. Meanwhile, explore our ready-to-gift combos.</p>
        <Link href="/category/gift-combos" className="px-7 py-3 rounded-full bg-[#c0555a] text-white font-semibold hover:bg-[#a84449] transition-colors">
          Shop gift combos
        </Link>
      </main>
    );
  }
  return <BuildHamperClient />;
}