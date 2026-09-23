"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gift } from "lucide-react";

// Same 4 tiers as /collections/[range]/page.tsx and ShopClient's PRICE_RANGES —
// keep these in sync if the pricing bands ever change.
const budgets = [
  { label: "Under Rs. 500",       tag: "Thoughtful picks", link: "/collections/under-500",  minPrice: "",     maxPrice: "500"  },
  { label: "Rs. 500 – Rs. 1500",  tag: "Most popular",     link: "/collections/500-1500",   minPrice: "500",  maxPrice: "1500" },
  { label: "Rs. 1500 – Rs. 3000", tag: "Premium gifts",    link: "/collections/1500-3000",  minPrice: "1500", maxPrice: "3000" },
  { label: "Above Rs. 3000",      tag: "Luxury hampers",   link: "/collections/above-3000", minPrice: "3000", maxPrice: ""     },
];

export default function ShopByBudget() {
  const [images, setImages] = useState<Record<number, string>>({});

  // Each tile previously used the same 4 hotlinked competitor photos
  // regardless of price band. Now each tile shows an actual product that
  // falls in that price range, pulled straight from the catalog.
  useEffect(() => {
    Promise.all(
      budgets.map((b, i) => {
        const params = new URLSearchParams({ sort: "popular", limit: "1" });
        if (b.minPrice) params.set("minPrice", b.minPrice);
        if (b.maxPrice) params.set("maxPrice", b.maxPrice);
        return fetch(`/api/products?${params}`)
          .then((r) => r.json())
          .then(async (data) => {
            let image = data.products?.[0]?.images?.[0];
            // Nothing in this band yet (e.g. no product above Rs. 3000):
            // fall back to the highest-priced (or, for the lowest band, cheapest) product so the tile is never empty.
            if (!image) {
              const fb = await fetch(`/api/products?sort=${b.minPrice ? "price_desc" : "price_asc"}&limit=1`).then((r) => r.json());
              image = fb.products?.[0]?.images?.[0];
            }
            return { i, image };
          })
          .catch(() => ({ i, image: undefined }));
      })
    ).then((results) => {
      const map: Record<number, string> = {};
      for (const r of results) if (r.image) map[r.i] = r.image;
      setImages(map);
    });
  }, []);

  return (
    <section className="pt-0 pb-16 md:pb-20 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-10 md:mb-12">
          <span
            className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Something for every budget
          </span>
          <h2
            className="text-[42px] md:text-[66px] font-normal text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Shop by budget
          </h2>
          <p className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto">
            Great gifts don't have to break the bank — find yours
          </p>
        </div>

        {/* ── 4 COL GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {budgets.map((item, index) => (
            <Link key={index} href={item.link}
              className="group relative rounded-2xl overflow-hidden block">
              {/* Was a fixed h-[300px] md:h-[420px] against a 2-col grid on
                  mobile — at the md jump to 4 columns (including iPad Pro
                  portrait, 1024px), the column narrows a lot while the
                  height stayed put, squashing product photos into a tall
                  narrow sliver under object-cover. aspect-square scales
                  with the actual column width instead. */}
              {/* Image + tag live together in one relative box. The price
                  label used to be `absolute bottom-0`, which — since it has
                  no in-flow height of its own — overlapped and covered the
                  bottom slice of the square photo instead of sitting as a
                  clean separate strip below it, and its width came from
                  `left-0 right-0` on the whole card rather than naturally
                  matching the image's own box. Making it a normal block
                  below the image (not absolutely positioned) fixes both:
                  full photo stays visible, and the label is guaranteed the
                  exact same width since it's just another 100%-width child. */}
              <div className="relative aspect-square overflow-hidden bg-[#f3efe8]">
                {images[index] ? (
                  <Image src={images[index]} alt={item.label} fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift size={36} className="text-[#ccc]" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="inline-block bg-[#f3efe8] text-[#1a1a1a] text-[11px] md:text-[12px] font-medium px-3 py-1.5 rounded-sm">
                    {item.tag}
                  </span>
                </div>
              </div>
              <div className="bg-white border-t-2 border-[#c0555a] group-hover:bg-[#c0555a] transition-colors duration-300 px-4 py-4 text-center">
                <p className="text-[#c0555a] group-hover:text-white transition-colors duration-300 text-[14px] md:text-[15px] font-semibold tracking-wide">
                  {item.label}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
