// ─────────────────────────────────────────────────────────────────────────────
// Shared color-name → hex map, used to render color swatches wherever a
// "Color" variant group needs a dot/circle instead of a plain text pill —
// on the product page's variant selector and on shop/category product cards.
// ─────────────────────────────────────────────────────────────────────────────
export const COLOR_MAP: Record<string, string> = {
  red:        "#ef4444", pink:      "#ec4899", rose:     "#f43f5e",
  orange:     "#f97316", yellow:    "#eab308", gold:     "#c4922a",
  green:      "#22c55e", teal:      "#14b8a6", mint:     "#6ee7b7",
  blue:       "#3b82f6", navy:      "#1e3a5f", sky:      "#38bdf8",
  purple:     "#a855f7", violet:    "#7c3aed", lavender: "#c4b5fd",
  brown:      "#92400e", tan:       "#d4a96a", beige:    "#f5e6d3",
  black:      "#1a1a1a", white:     "#ffffff", grey:     "#9ca3af",
  gray:       "#9ca3af", silver:    "#cbd5e1", cream:    "#fef9ef",
  maroon:     "#7f1d1d", coral:     "#f87171", peach:    "#fca5a5",
  turquoise:  "#2dd4bf", indigo:    "#6366f1", magenta:  "#d946ef",
};

export function getColorHex(name: string): string | null {
  return COLOR_MAP[name.toLowerCase().trim()] ?? null;
}
