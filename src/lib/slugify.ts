// Turns a section title ("Orders & Pricing") into a URL-hash-safe anchor id
// ("orders-and-pricing") for the policy pages' jump-to-section nav.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
