"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Headphones, Zap, Pencil, RotateCcw, FolderTree } from "lucide-react";

interface Category {
  id:     number;
  name:   string;
  slug:   string;
  image:  string | null;
  _count?: { products: number };
}

const trustSignals = [
  { icon: Headphones, label: "Dedicated customer care", sub: "We're here to help" },
  { icon: Zap, label: "3-hour delivery", sub: "Within Jaipur" },
  { icon: Pencil, label: "100% customized", sub: "Made with love" },
  { icon: RotateCcw, label: "Easy returns", sub: "Except personalised items" },
];

// Pastel red — warm dusty rose instead of harsh #c0392b
const PASTEL_RED = "#6B4F3F";

const SKELETON_COUNT = 10;

export default function ShopByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);

  // Real categories from the admin panel — same endpoint the navbar and shop
  // page use. Previously this section had 10 hardcoded categories with
  // images hotlinked from a competitor's site and guessed slugs that didn't
  // match this store's actual catalog.
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        if (Array.isArray(data)) setCategories(data.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="pt-0 pb-0 relative overflow-hidden">

      {/* ── PASTEL RED TOP SECTION ── */}
      <div
        className="pt-14 md:pt-16 pb-16 md:pb-20 px-4 md:px-6 lg:px-10"
        style={{ backgroundColor: PASTEL_RED }}
      >
        {/* HEADING */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-white/50 text-[11px] font-medium uppercase tracking-[4px] mb-3">
            Something for everyone
          </p>
          <h2
            className="text-white text-[42px] md:text-[66px] font-normal"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Shop by category
          </h2>
        </div>

        {/* ── GRID ── */}
        <div className="max-w-[1450px] mx-auto">
          {/* Added an xl:grid-cols-5 step (was a straight 4→5 jump at lg,
              1024px — tight on an iPad Pro / small laptop). Image boxes now
              use aspect-square instead of a fixed height, so they scale
              with the column width at every breakpoint instead of getting
              squeezed at in-between widths. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {loading ? (
              Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="bg-white/20 rounded-md overflow-hidden animate-pulse">
                  <div className="aspect-square bg-white/10" />
                  <div className="px-3 py-3">
                    <div className="h-3.5 bg-white/20 rounded-full mb-2" />
                    <div className="h-3 bg-white/10 rounded-full w-2/3" />
                  </div>
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <Link
                  href={`/category/${cat.slug}`}
                  key={cat.id}
                  className="group block bg-white overflow-hidden rounded-md hover:shadow-xl transition-all duration-300"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-square overflow-hidden bg-[#f3efe8]">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderTree size={28} className="text-[#ccc]" />
                      </div>
                    )}
                  </div>

                  {/* NAME */}
                  <div className="px-3 py-3">
                    <h3 className="text-[13px] md:text-[14px] font-semibold text-[#1a1a1a] leading-snug transition-colors duration-200 group-hover:text-[#6B4F3F]">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {cat._count?.products ?? 0} {cat._count?.products === 1 ? "product" : "products"}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* VIEW ALL */}
          <div className="text-center mt-10">
            <Link
              href="/categories"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white font-semibold text-[13px] tracking-wider hover:bg-white/90 transition-all duration-300 rounded-full"
              style={{ color: PASTEL_RED }}
            >
              View all categories
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── TRUST SIGNALS ── */}
      <div className="px-4 md:px-6 lg:px-10 py-10 md:py-12">
        <div className="max-w-[1450px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustSignals.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border border-[#e8e0d5]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#c0555a]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} strokeWidth={1.8} className="text-[#c0555a]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-[#888]">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
