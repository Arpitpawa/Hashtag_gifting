"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowDown } from "lucide-react";

const allProducts = [
  {
    name: "The Noir Kit",
    category: "Corporate Gifting",
    price: "Rs. 3,140",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/noir-kit",
    rating: 4.8,
    reviews: 12,
    badge: "Best Seller",
  },
  {
    name: "The Midnight Gold Kit",
    category: "Corporate Gifting",
    price: "Rs. 5,320",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/midnight-gold-kit",
    rating: 4.9,
    reviews: 8,
    badge: "Premium",
  },
  {
    name: "The Terra Welcome Kit",
    category: "Corporate Gifting",
    price: "Rs. 4,300",
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/corporate/terra-welcome-kit",
    rating: 4.7,
    reviews: 15,
    badge: "",
  },
  {
    name: "The New Beginnings Kit",
    category: "Corporate Gifting",
    price: "Rs. 6,600",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/new-beginnings-kit",
    rating: 5.0,
    reviews: 6,
    badge: "New",
  },
  {
    name: "The Pink Bloom Kit",
    category: "Corporate Gifting",
    price: "Rs. 5,120",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/pink-bloom-kit",
    rating: 4.6,
    reviews: 19,
    badge: "",
  },
  {
    name: "The Marshall Hamper",
    category: "Corporate Gifting",
    price: "Rs. 9,840",
    image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    link: "/corporate/marshall-hamper",
    rating: 4.9,
    reviews: 23,
    badge: "Premium",
  },
  {
    name: "The Architect's Essentials",
    category: "Corporate Gifting",
    price: "Rs. 9,400",
    image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    link: "/corporate/architects-essentials",
    rating: 4.7,
    reviews: 9,
    badge: "",
  },
  {
    name: "The Elevated Routine Box",
    category: "Corporate Gifting",
    price: "Rs. 7,120",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/elevated-routine-box",
    rating: 4.8,
    reviews: 14,
    badge: "",
  },
  {
    name: "The Festive Diwali Hamper",
    category: "Corporate Gifting",
    price: "Rs. 4,800",
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/corporate/diwali-hamper",
    rating: 4.9,
    reviews: 31,
    badge: "Popular",
  },
  {
    name: "The Branded Desk Set",
    category: "Corporate Gifting",
    price: "Rs. 3,500",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/branded-desk-set",
    rating: 4.5,
    reviews: 7,
    badge: "",
  },
  {
    name: "The Client Appreciation Box",
    category: "Corporate Gifting",
    price: "Rs. 8,200",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/client-appreciation-box",
    rating: 4.8,
    reviews: 18,
    badge: "Best Seller",
  },
  {
    name: "The Premium Onboarding Kit",
    category: "Corporate Gifting",
    price: "Rs. 11,000",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/premium-onboarding-kit",
    rating: 5.0,
    reviews: 4,
    badge: "Premium",
  },
];

const INITIAL_SHOW = 8;

const promptFont = { fontFamily: "var(--font-prompt)" };
const caveatFont = { fontFamily: "var(--font-caveat)" };

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-[#c0555a] text-white",
  "Premium": "bg-[#1a1a1a] text-white",
  "New": "bg-[#2f3e7a] text-white",
  "Popular": "bg-[#c4922a] text-white",
};

const StarRating = ({ rating, reviews }: { rating: number; reviews: number }) => (
  <div className="flex items-center gap-1.5 mt-1">
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? "#c4922a" : "none"}
          stroke="#c4922a"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
    <span className="text-[11px] text-[#999]" style={promptFont}>
      {rating} ({reviews})
    </span>
  </div>
);

export default function CorporateProducts() {
  const [showAll, setShowAll] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const visibleProducts = showAll ? allProducts : allProducts.slice(0, INITIAL_SHOW);

  const toggleWishlist = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setWishlist((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="pt-0 pb-16 md:pb-24 bg-white">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-[#c4922a] text-sm uppercase tracking-[3px] font-medium mb-3"
            style={promptFont}
          >
            Thoughtful & Premium
          </p>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight mb-4"
            style={caveatFont}
          >
            Corporate Gifting Solutions
          </h2>
          <p
            className="text-[#6b6b6b] text-[14px] md:text-[15px] max-w-xl mx-auto leading-relaxed"
            style={promptFont}
          >
            Choose from a wide range of 500+ corporate gifting options —
            fully customized with your brand, logo & message.
          </p>

          {/* TRUST BADGES */}
          <div className="flex items-center justify-center flex-wrap gap-6 mt-8">
            {[
              "✦ No Minimum Order",
              "✦ Custom Branding",
              "✦ Pan India Delivery",
              "✦ Bulk Discounts",
            ].map((badge, i) => (
              <span
                key={i}
                className="text-[12px] text-[#888] font-medium"
                style={promptFont}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {visibleProducts.map((product, i) => (
            <Link
              key={i}
              href={product.link}
              className="group block"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden rounded-xl bg-[#f5f0ea] aspect-square mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* BADGE */}
                {product.badge && (
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${badgeColors[product.badge]}`}
                    style={promptFont}
                  >
                    {product.badge}
                  </span>
                )}

                {/* WISHLIST */}
                <button
                  onClick={(e) => toggleWishlist(e, i)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200"
                >
                  <Heart
                    size={15}
                    className={wishlist.includes(i) ? "fill-[#c0555a] text-[#c0555a]" : "text-gray-400"}
                  />
                </button>

                {/* QUICK VIEW on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[12px] font-medium py-2.5 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  style={promptFont}
                >
                  Quick View
                </div>
              </div>

              {/* INFO */}
              <div>
                <p
                  className="text-[11px] text-[#999] mb-1 uppercase tracking-wide"
                  style={promptFont}
                >
                  {product.category}
                </p>
                <h3
                  className="text-[14px] md:text-[15px] font-medium text-[#1a1a1a] mb-1 group-hover:text-[#c0555a] transition-colors duration-200"
                  style={promptFont}
                >
                  {product.name}
                </h3>
                <StarRating rating={product.rating} reviews={product.reviews} />
                <p
                  className="text-[15px] font-bold text-[#1a1a1a] mt-2"
                  style={promptFont}
                >
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* LOAD MORE / SHOW LESS */}
        <div className="text-center mt-14">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-semibold rounded-full hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
              style={promptFont}
            >
              Load More
              <ArrowDown size={15} />
            </button>
          ) : (
            <button
              onClick={() => setShowAll(false)}
              className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-semibold rounded-full hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
              style={promptFont}
            >
              Show Less
            </button>
          )}
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-16 bg-[#f5f0ea] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-2"
              style={caveatFont}
            >
              Need a Custom Corporate Quote?
            </h3>
            <p
              className="text-[14px] text-[#6b6b6b] max-w-md"
              style={promptFont}
            >
              Get bulk pricing, branded packaging & dedicated account manager
              for orders above 50 units.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            
              href="https://wa.me/917665909909"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 bg-[#1a1a1a] text-white text-[13px] font-semibold rounded-full hover:bg-[#c0555a] transition-all duration-300"
              style={promptFont}
            >
              WhatsApp Us
            </a>
            <Link
              href="/bulk-gifting"
              className="px-7 py-3.5 border-2 border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-semibold rounded-full hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
              style={promptFont}
            >
              Get a Quote
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}