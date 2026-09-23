"use client";

import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "Birthday Gifts",
    count: "120+ Gifts",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    link: "/category/birthday",
    color: "from-pink-500/60",
  },
  {
    name: "Anniversary",
    count: "85+ Gifts",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    link: "/category/anniversary",
    color: "from-rose-500/60",
  },
  {
    name: "For Girlfriend",
    count: "95+ Gifts",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
    link: "/category/girlfriend",
    color: "from-purple-500/60",
  },
  {
    name: "For Boyfriend",
    count: "78+ Gifts",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop",
    link: "/category/boyfriend",
    color: "from-blue-500/60",
  },
  {
    name: "Personalized",
    count: "200+ Gifts",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    link: "/category/personalized",
    color: "from-amber-500/60",
  },
  {
    name: "Cakes & Bouquet",
    count: "60+ Gifts",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop",
    link: "/category/cakes-bouquet",
    color: "from-green-500/60",
  },
  {
    name: "Wedding Gifts",
    count: "110+ Gifts",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
    link: "/category/wedding",
    color: "from-red-500/60",
  },
  {
    name: "Bulk Gifting",
    count: "45+ Options",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800&auto=format&fit=crop",
    link: "/category/bulk",
    color: "from-teal-500/60",
  },
];

export default function ShopByCategory() {
  return (
    <section className="py-16 md:py-24 bg-[#f7f4ef]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-8">

        {/* HEADING */}
        <div className="text-center mb-14 md:mb-16">
          <p
            className="text-[#c4922a] text-lg md:text-xl italic mb-2 font-light"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            something for everyone
          </p>
          <h2
            className="text-5xl md:text-6xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            Shop by Category
          </h2>
          <p className="text-gray-500 text-base md:text-lg mt-4">
            Find the perfect gift for every occasion and every person
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <Link
              href={cat.link}
              key={index}
              className={`
                relative rounded-2xl overflow-hidden group cursor-pointer
                ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}
              `}
            >
              <div
                className={`
                  relative overflow-hidden
                  ${index === 0 ? "h-[280px] md:h-[440px]" : "h-[200px] md:h-[210px]"}
                `}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* GRADIENT */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300`}
                />

                {/* CONTENT */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <h3
                    className={`font-bold text-white leading-tight
                      ${index === 0 ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}
                    `}
                    style={{ fontFamily: "var(--font-caveat)" }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">{cat.count}</p>

                  {/* ARROW */}
                  <div className="mt-3 flex items-center gap-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* VIEW ALL */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-black text-black font-semibold text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300 rounded-full"
          >
            View All Categories
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}