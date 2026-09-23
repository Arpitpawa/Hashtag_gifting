// ─────────────────────────────────────────────────────────────────────────────
// Personalisation fonts — the fixed list of font styles the client asked for.
//
// "Monotype Corsiva", "Adila" and "Tumbler" are not real system/Google fonts —
// there is no free, licensable webfont with those exact names. We render them
// using the closest free lookalike (self-hosted via next/font/google so they
// paint correctly on the Konva <canvas> preview, not just in the DOM), while
// keeping the exact label the client asked for. "Ariel" is kept as typed
// (client's name for it) but mapped to the real "Arial" system font since
// that's clearly what's meant. If the client later supplies actual licensed
// font files for Corsiva/Adila/Tumbler, swap the `family` values below for a
// local @font-face and nothing else in the app needs to change.
// ─────────────────────────────────────────────────────────────────────────────
import { Alex_Brush, Petit_Formal_Script, Sacramento, Pacifico } from "next/font/google";

const alexBrush = Alex_Brush({ subsets: ["latin"], weight: "400", display: "swap" });
// Lookalike for "Monotype Corsiva" — formal connected calligraphy script.
const corsivaLookalike = Petit_Formal_Script({ subsets: ["latin"], weight: "400", display: "swap" });
// Lookalike for "Adila" — modern flowing script.
const adilaLookalike = Sacramento({ subsets: ["latin"], weight: "400", display: "swap" });
// Lookalike for "Tumbler" — rounded casual script.
const tumblerLookalike = Pacifico({ subsets: ["latin"], weight: "400", display: "swap" });

// Import this once anywhere (layout, admin form, preview modal) and the
// @font-face rules for all four lookalikes are bundled + preloaded.
export const PERSONALISATION_FONT_PRELOAD_CLASS =
  `${alexBrush.className} ${corsivaLookalike.className} ${adilaLookalike.className} ${tumblerLookalike.className}`;

export interface FontOption {
  id:     string;   // stored in Product.availableFonts
  label:  string;   // shown to admin + customer — exact names the client asked for
  family: string;   // "" means "use the zone's own default font" (current Georgia behaviour)
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "default",         label: "Default",           family: "" },
  { id: "monotype_corsiva", label: "Monotype Corsiva",  family: corsivaLookalike.style.fontFamily },
  { id: "alex_brush",      label: "Alex Brush",         family: alexBrush.style.fontFamily },
  { id: "adila",           label: "Adila",              family: adilaLookalike.style.fontFamily },
  { id: "ariel",           label: "Ariel",              family: "Arial, Helvetica, sans-serif" },
  { id: "times_new_roman", label: "Times New Roman",    family: "'Times New Roman', Times, serif" },
  { id: "tumbler",         label: "Tumbler",            family: tumblerLookalike.style.fontFamily },
];

export function getFontOption(id?: string | null): FontOption | undefined {
  return FONT_OPTIONS.find(f => f.id === id);
}

// Resolves a font id to the CSS family string to actually render with.
// Returns undefined for "default"/unknown ids so callers fall back to
// whatever the zone itself already specifies (e.g. "Georgia").
export function resolveFontFamily(id?: string | null): string | undefined {
  if (!id || id === "default") return undefined;
  return getFontOption(id)?.family || undefined;
}

// Given a product's saved availableFonts (possibly empty/undefined), return
// the actual list of selectable options — always at least ["Default"] so a
// product configured before this feature existed keeps working unchanged.
export function getEnabledFontOptions(availableFonts?: string[] | null): FontOption[] {
  if (!availableFonts || availableFonts.length === 0) {
    return FONT_OPTIONS.filter(f => f.id === "default");
  }
  const opts = FONT_OPTIONS.filter(f => availableFonts.includes(f.id));
  return opts.length > 0 ? opts : FONT_OPTIONS.filter(f => f.id === "default");
}
