# TypeScript Build Fixes — How to Apply

## 1. Extract this zip into your project root, allowing overwrite
All 29 files inside keep their exact `src/...` / `prisma/...` paths, so extracting
straight into your project root will overwrite the right files in place.

## 2. Delete these 2 files manually (not included in the zip, since deleting = no file to ship)
- `src/app/api/customization/route.ts`
  → Dead, unused, less-secure duplicate of `src/app/api/customization/upload/route.ts`.
    Nothing in the frontend called it, and it was passing a raw `File` where a `Buffer`
    was required (a real bug that would never have surfaced since it was never called).

- `src/components/category/[slug]/page.tsx`
  → Dead duplicate of the real page at `src/app/category/[slug]/page.tsx`. Nothing
    imports it, and `src/components/` isn't a routable directory anyway — it was just
    stale clutter left over from before the Next.js 16 `params`-as-Promise fix (it still
    had the old, broken `params: { slug: string }` pattern instead of `Promise<...>`).

## 3. Run `npm run build` (or `npx tsc --noEmit` for a quick check without a full build)
Should compile clean — verified locally with a full `npx tsc --noEmit` pass (0 errors,
down from 93) and a full `next build` (only remaining failure was Google Fonts being
unreachable from my sandbox's network — not a real issue, your server will fetch those fine).

---

## What changed, grouped by why

**Real bugs (would have broken things at runtime, not just failed the type-check):**
- `src/app/corporate/page.tsx` — removed import of a component file that doesn't exist
  anywhere in the project (never rendered, so this was 100% dead weight breaking the build
  for no functional reason)
- `src/components/account/AccountClient.tsx` — `<Truck />` icon was used but never imported
- `src/components/product/LivePreviewModal.tsx` — removed a leftover type import
  (`PersonalizationEngineRef`) from before the engine was refactored to the `onReady`
  callback pattern; unused anywhere else in the file
- `src/components/layout/Navbar.tsx` + `src/app/fast-delivery/FastDeliveryClient.tsx` —
  `useRef<NodeJS.Timeout>()` needs an initial value with current React types; changed to
  `useRef<NodeJS.Timeout | undefined>(undefined)`

**Type definitions that had drifted from reality (data was always fine at runtime, the
TypeScript type just hadn't caught up — fixing these means future changes won't silently
break without warning):**
- `src/types/product.ts` — added `hasCharm: boolean` (real Prisma field, was missing from
  the manually-maintained type)
- `src/lib/store/cartStore.ts` — `CustomizationData` type widened to match how it's
  actually used: dynamic zone-keyed personalization data (e.g. `photo_upload`) AND
  structured variant-selection payloads both flow through this same field
- `src/components/home/BestSellers.tsx` — gave the static homepage product array an
  explicit type so the existing `product.id || index` fallback type-checks

**Mechanical fixes (added explicit types to `.map()`/`.filter()`/`.reduce()`/`$transaction`
callback params that TypeScript couldn't infer on its own — no logic changes):**
Every other file in this package. All `: any` annotations on callback parameters,
consistent with the pattern already used elsewhere in the codebase (e.g. `items.map((i: any) => ...)`
in `orders/create`).

**One Map-typing fix with real downstream effect:**
- `src/app/api/orders/create/route.ts` — `new Map(products.map(p => [p.id, p]))` wasn't
  inferring its value type correctly, which cascaded into ~13 "property does not exist"
  errors on `product.name`/`product.stock`/etc. Fixed by explicitly typing the Map's
  generics: `new Map<number, (typeof products)[number]>(...)`.
