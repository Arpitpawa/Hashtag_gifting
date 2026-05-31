"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const allProducts = [
  {
    name: "The noir kit",
    category: "Corporate gifts",
    price: "Rs. 3,140",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/noir-kit",
  },
  {
    name: "The midnight gold kit",
    category: "Corporate gifts",
    price: "Rs. 5,320",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/midnight-gold-kit",
  },
  {
    name: "The terra welcome kit",
    category: "Corporate gifts",
    price: "Rs. 4,300",
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/corporate/terra-welcome-kit",
  },
  {
    name: "The new beginnings kit",
    category: "Corporate gifts",
    price: "Rs. 6,600",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/new-beginnings-kit",
  },
  {
    name: "The pink bloom kit",
    category: "Corporate gifts",
    price: "Rs. 5,120",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/pink-bloom-kit",
  },
  {
    name: "The marshall hamper",
    category: "Corporate gifts",
    price: "Rs. 9,840",
    image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    link: "/corporate/marshall-hamper",
  },
  {
    name: "The architect's essentials",
    category: "Corporate gifts",
    price: "Rs. 9,400",
    image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    link: "/corporate/architects-essentials",
  },
  {
    name: "The elevated routine box",
    category: "Corporate gifts",
    price: "Rs. 7,120",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/elevated-routine-box",
  },
  {
    name: "The festive diwali hamper",
    category: "Corporate gifts",
    price: "Rs. 4,800",
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/corporate/diwali-hamper",
  },
  {
    name: "The branded desk set",
    category: "Corporate gifts",
    price: "Rs. 3,500",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/branded-desk-set",
  },
  {
    name: "The client appreciation box",
    category: "Corporate gifts",
    price: "Rs. 8,200",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/client-appreciation-box",
  },
  {
    name: "The premium onboarding kit",
    category: "Corporate gifts",
    price: "Rs. 11,000",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/premium-onboarding-kit",
  },
];

const INITIAL_SHOW = 8;

export default function CorporateProducts() {
  const [showAll, setShowAll] = useState(false);
  const visibleProducts = showAll ? allProducts : allProducts.slice(0, INITIAL_SHOW);

  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mt-15.5 mb-10 md:mb-12">
          <h2
            className="text-3xl md:text-4xl font-semibold text-[black] mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Corporate gifting solutions for businesses
          </h2>
          <p className="text-[#6b6b6b] text-[14px] md:text-[15px]">
            Choose from a wide range of over 500+ corporate gifting options
          </p>
        </div>

        {/* ── PRODUCT GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {visibleProducts.map((product, i) => (
            <Link
              key={i}
              href={product.link}
              className="group block"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden rounded-lg bg-[#f5f0ea] aspect-square mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* INFO */}
              <div>
                <h3 className="text-[14px] md:text-[15px] font-medium text-[#1a1a1a] mb-1 group-hover:text-[#c0555a] transition-colors duration-200 capitalize">
                  {product.name}
                </h3>
                <p className="text-[12px] text-[#999] mb-1">
                  {product.category}
                </p>
                <p className="text-[14px] font-semibold text-[#1a1a1a]">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── LOAD MORE ── */}
        {!showAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-10 py-4 bg-[white] text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all duration-300"
            >
              Load more
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* SHOW LESS */}
        {showAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(false)}
              className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#c0555a] text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all duration-300"
            >
              Show less
            </button>
          </div>
        )}

      </div>
    </section>
  );
}