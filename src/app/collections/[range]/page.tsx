import { permanentRedirect, notFound } from "next/navigation";

// "Shop by budget" on the homepage (ShopByBudget.tsx) links to
// /collections/under-500, /500-1500, /1500-3000, /above-3000 — there's no
// standalone collections UI, so this just maps each budget slug onto the
// same minPrice/maxPrice filter /shop already supports (see PRICE_RANGES in
// ShopClient.tsx) and redirects there. Keeps one filtering implementation
// instead of building a second product grid just for this.
const RANGES: Record<string, { minPrice?: string; maxPrice?: string }> = {
  "under-500":  { maxPrice: "500" },
  "500-1500":   { minPrice: "500", maxPrice: "1500" },
  "1500-3000":  { minPrice: "1500", maxPrice: "3000" },
  "above-3000": { minPrice: "3000" },
};

export default async function CollectionRedirect(
  { params }: { params: Promise<{ range: string }> }
) {
  const { range } = await params;
  const filter = RANGES[range];
  if (!filter) notFound();

  const qs = new URLSearchParams(filter as Record<string, string>).toString();
  permanentRedirect(`/shop?${qs}`);
}
