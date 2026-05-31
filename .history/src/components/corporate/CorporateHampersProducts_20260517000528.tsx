"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

const allProducts = [
  {
    name: "Coffee Mug With Cork Detail",
    category: "Corporate Gifting",
    price: "Rs. 900",
    rating: 4,
    reviews: 2,
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/coffee-mug-cork",
    wishlist: true,
  },
  {
    name: "Savvy and Sustainable Gift Hamper",
    category: "Corporate Gifting",
    price: "Rs. 2,940",
    rating: 5,
    reviews: 7,
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/sustainable-hamper",
    wishlist: false,
  },
  {
    name: "Bamboo Coffee Sipper",
    category: "Corporate Gifting",
    price: "Rs. 1,000",
    rating: 4,
    reviews: 5,
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/corporate/bamboo-sipper",
    wishlist: false,
  },
  {
    name: "Journal - Rumi",
    category: "Corporate Gifting",
    price: "Rs. 600",
    rating: 5,
    reviews: 3,
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/journal-rumi",
    wishlist: false,
  },
  {
    name: "The Eco-Employee Gift Hamper",
    category: "Corporate Gifting",
    price: "Rs. 3,340",
    rating: 3,
    reviews: 3,
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/eco-employee-hamper",
    wishlist: true,
  },
  {
    name: "Cork Calendar",
    category: "Corporate Gifting",
    price: "Rs. 1,260",
    rating: 4,
    reviews: 6,
    image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    link: "/corporate/cork-calendar",
    wishlist: false,
  },
  {
    name: "Bold in Black Gift Box",
    category: "Corporate Gifting",
    price: "Rs. 4,360",
    rating: 4,
    reviews: 9,
    image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    link: "/corporate/bold-black-box",
    wishlist: true,
  },
  {
    name: "Water Sipper - Inari",
    category: "Corporate Gifting",
    price: "Rs. 930",
    rating: 3,
    reviews: 4,
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/water-sipper-inari",
    wishlist: false,
  },
  {
    name: "The Branded Desk Essentials",
    category: "Corporate Gifting",
    price: "Rs. 2,800",
    rating: 5,
    reviews: 11,
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/corporate/desk-essentials",
    wishlist: false,
  },
  {
    name: "The Executive Welcome Kit",
    category: "Corporate Gifting",
    price: "Rs. 5,600",
    rating: 5,
    reviews: 8,
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/executive-welcome-kit",
    wishlist: false,
  },
  {
    name: "The Festive Diwali Hamper",
    category: "Corporate Gifting",
    price: "Rs. 4,800",
    rating: 4,
    reviews: 14,
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/diwali-hamper",
    wishlist: false,
  },
  {
    name: "The Premium Onboarding Kit",
    category: "Corporate Gifting",
    price: "Rs. 11,000",
    rating: 5,
    reviews: 4,
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/premium-onboarding-kit",
    wishlist: false,
  },
];

const INITIAL_SHOW = 8;

const StarRating = ({ rating, reviews }: { rating: number; reviews: number }) => (
  <div className="flex items-center gap-1.5 mt-1.5">
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#c4922a" : "none"}
          stroke="#c4922a"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
    <span className="text-[11px] text-[#999]">
      {rating} ({reviews})
    </span>
  </div>
);

export default function WoodenCorporateGifting() {
  const [showAll, setShowAll] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>(
    allProducts.map((p, i) => (p.wishlist ? i : -1)).filter((i) => i !== -1)
  );

  const visibleProducts = showAll
    ? allProducts
    : allProducts.slice(0, INITIAL_SHOW);

  const toggleWishlist = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setWishlist((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="pt-0 pb-16 md:pb-20 bg-white">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="text-center mb-10 md:mb-12">
          <h2
            className="text-3xl md:text-4xl font-semibold text-[#c4922a] mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Wooden Corporate Gifting
          </h2>
          <p className="text-[#c4922a] text-[14px] md:text-[15px]">
            We offer thoughtful & Eco-Friendly Gifting Solutions for Employees & Office Colleagues
          </p>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {visibleProducts.map((product, i) => (
            <Link
              key={i}
              href={product.link}
              className="group block"
            >
              {/* IMAGE — rectangular like Boxup */}
              <div className="relative overflow-hidden rounded-lg bg-[#f5f0ea] mb-4"
                style={{ aspectRatio: "3/3.5" }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* WISHLIST BUTTON */}
                <button
                  onClick={(e) => toggleWishlist(e, i)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200"
                >
                  <Heart
                    size={15}
                    className={
                      wishlist.includes(i)
                        ? "fill-[#c0555a] text-[#c0555a]"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              {/* INFO */}
              <div>
                <h3
                  className="text-[14px] md:text-[15px] font-medium text-[#1a1a1a] mb-0.5 group-hover:text-[#c0555a] transition-colors duration-200"
                >
                  {product.name}
                </h3>
                <p className="text-[12px] text-[#999] mb-0.5">
                  {product.category}
                </p>
                <p className="text-[14px] md:text-[15px] font-semibold text-[#1a1a1a] mt-1">
                  ₹ {product.price.replace("Rs. ", "")}
                </p>
                <StarRating rating={product.rating} reviews={product.reviews} />
              </div>
            </Link>
          ))}
        </div>

        {/* LOAD MORE */}
        {!showAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#c4922a] text-white text-[13px] font-semibold rounded-full hover:bg-[#b07d22] transition-all duration-300"
            >
              Load More
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
              className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#c4922a] text-[#c4922a] text-[13px] font-semibold rounded-full hover:bg-[#c4922a] hover:text-white transition-all duration-300"
            >
              Show Less
            </button>
          </div>
        )}

      </div>
    </section>
  );
}