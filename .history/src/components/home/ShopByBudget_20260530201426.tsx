"use client";

import Link from "next/link";
import Image from "next/image";

const budgets = [
  {
    label: "Under Rs. 500",
    tag: "Thoughtful picks",
    link: "/collections/under-500",
    image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
  },
  {
    label: "Rs. 500 – Rs. 1500",
    tag: "Most popular",
    link: "/collections/500-1500",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
  },
  {
    label: "Rs. 1500 – Rs. 3000",
    tag: "Premium gifts",
    link: "/collections/1500-3000",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
  },
  {
    label: "Above Rs. 3000",
    tag: "Luxury hampers",
    link: "/collections/above-3000",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
  },
];

export default function ShopByBudget() {
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
              <div className="relative h-[300px] md:h-[420px] overflow-hidden">
                <Image src={item.image} alt={item.label} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
              <div className="absolute top-4 left-4">
                <span className="inline-block bg-[#f3efe8] text-[#1a1a1a] text-[11px] md:text-[12px] font-medium px-3 py-1.5 rounded-sm">
                  {item.tag}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] group-hover:bg-[#c0555a] transition-colors duration-300 px-4 py-4 text-center">
                <p className="text-white text-[14px] md:text-[15px] font-semibold tracking-wide">
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