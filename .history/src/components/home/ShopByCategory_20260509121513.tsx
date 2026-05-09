"use client";

import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "Birthday Gifts",
    count: "120+ Gifts",
    tag: "Most Loved",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    link: "/category/birthday",
    accent: "#f4a7b9",
    size: "large",
  },
  {
    name: "Anniversary",
    count: "85+ Gifts",
    tag: "Romantic",
    image:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    link: "/category/anniversary",
    accent: "#e07b7b",
    size: "tall",
  },
  {
    name: "Personalized Mugs",
    count: "80+ Designs",
    tag: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop",
    link: "/category/mugs",
    accent: "#f4b56a",
    size: "normal",
  },
  {
    name: "Photo Frames",
    count: "65+ Frames",
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?q=80&w=800&auto=format&fit=crop",
    link: "/category/photo-frames",
    accent: "#a8c5a0",
    size: "normal",
  },
  {
    name: "LED Name Lamps",
    count: "50+ Styles",
    tag: "Glowing ✨",
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=800&auto=format&fit=crop",
    link: "/category/led-lamps",
    accent: "#f4d35e",
    size: "wide",
  },
  {
    name: "Cushion Covers",
    count: "70+ Prints",
    tag: "Cozy",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
    link: "/category/cushions",
    accent: "#b8a9d4",
    size: "normal",
  },
  {
    name: "Gift Hampers",
    count: "45+ Hampers",
    tag: "Premium",
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800&auto=format&fit=crop",
    link: "/category/hampers",
    accent: "#8fb8d4",
    size: "normal",
  },
];

const promptFont = { fontFamily: "var(--font-prompt)" };
const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function ShopByCategory() {
  return (
    <section className="py-20 md:py-28 bg-[#f3efe8] relative overflow-hidden">

      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "#2f3e7a", filter: "blur(80px)", transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "#c4922a", filter: "blur(80px)", transform: "translate(-30%, 30%)" }}
      />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div>
            <span
              className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-2 font-light"
              style={caveatFont}
            >
              something for everyone
            </span>
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a1a] leading-[0.95]"
              style={caveatFont}
            >
              Shop by
              <br />
              <span className="text-[#2f3e7a]">Category</span>
            </h2>
          </div>
          <div className="md:text-right">
            <p className="text-[#6b6b6b] text-base md:text-lg max-w-sm md:ml-auto" style={promptFont}>
              Handpicked categories for every occasion,
              <br className="hidden md:block" /> every person, every emotion.
            </p>
            <Link
              href="/categories"
              style={promptFont}
              className="inline-flex items-center gap-2 mt-4 text-[13px] font-semibold text-[#2f3e7a] uppercase tracking-[2px] border-b border-[#2f3e7a] pb-0.5 hover:opacity-70 transition-opacity"
            >
              View All Categories
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[220px]">

          {/* 1. BIRTHDAY — large: col-span-2 row-span-2 */}
          <CategoryCard cat={categories[0]} className="col-span-2 row-span-2" textSize="large" />

          {/* 2. ANNIVERSARY — tall: row-span-2 */}
          <CategoryCard cat={categories[1]} className="col-span-1 row-span-2" textSize="medium" />

          {/* 3. MUGS — normal */}
          <CategoryCard cat={categories[2]} className="col-span-1 row-span-1" textSize="small" />

          {/* 4. PHOTO FRAMES — normal */}
          <CategoryCard cat={categories[3]} className="col-span-1 row-span-1" textSize="small" />

          {/* 5. LED LAMPS — wide: col-span-2 */}
          <CategoryCard cat={categories[4]} className="col-span-2 row-span-1" textSize="medium" />

          {/* 6. CUSHIONS — normal */}
          <CategoryCard cat={categories[5]} className="col-span-1 row-span-1" textSize="small" />

          {/* 7. HAMPERS — normal */}
          <CategoryCard cat={categories[6]} className="col-span-1 row-span-1" textSize="small" />
        </div>

        {/* TRUST SIGNALS STRIP */}
        <div className="mt-14 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🎁", label: "Free Gift Wrapping", sub: "On every order" },
            { icon: "⚡", label: "3-Hour Delivery", sub: "Within Jaipur" },
            { icon: "✏️", label: "100% Customized", sub: "Made with love" },
            { icon: "↩️", label: "Easy Returns", sub: "Hassle-free refunds" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border border-[#e8e0d5]"
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a1a]" style={promptFont}>{item.label}</p>
                <p className="text-[11px] text-[#888]" style={promptFont}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CARD COMPONENT ── */
function CategoryCard({
  cat,
  className = "",
  textSize = "small",
}: {
  cat: (typeof categories)[0];
  className?: string;
  textSize: "large" | "medium" | "small";
}) {
  return (
    <Link
      href={cat.link}
      className={`relative rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer block ${className}`}
    >
      {/* IMAGE */}
      <Image
        src={cat.image}
        alt={cat.name}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* BASE GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* ACCENT TINT on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{ backgroundColor: cat.accent }}
      />

      {/* TAG PILL — top left */}
      {cat.tag && (
        <div className="absolute top-3 left-3 md:top-4 md:left-4">
          <span
            className="inline-block px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-semibold tracking-wide text-white"
            style={{
              backgroundColor: cat.accent + "cc",
              backdropFilter: "blur(8px)",
              fontFamily: "var(--font-prompt)",
            }}
          >
            {cat.tag}
          </span>
        </div>
      )}

      {/* CONTENT — bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <h3
          className={`font-bold text-white leading-tight mb-1 ${
            textSize === "large"
              ? "text-3xl md:text-4xl lg:text-5xl"
              : textSize === "medium"
              ? "text-2xl md:text-3xl"
              : "text-lg md:text-xl"
          }`}
          style={caveatFont}
        >
          {cat.name}
        </h3>
        <p className="text-white/70 text-xs md:text-sm" style={promptFont}>
          {cat.count}
        </p>

        {/* EXPLORE ARROW — hover reveal */}
        <div
          className="flex items-center gap-1.5 mt-2 text-white text-xs font-semibold uppercase tracking-widest opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          style={promptFont}
        >
          Explore
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}