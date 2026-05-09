"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
} from "lucide-react";

const categories = [
  "Personalized",
  "Birthday",
  "Anniversary",
  "Girlfriend",
  "Boyfriend",
];

const productData = {
  Personalized: [
    {
      id: 1,
      name: "Custom Memory Frame",
      sub: "Personalized Gift",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
      price: "₹1299",
      oldPrice: "₹1732",
      discount: "-25%",
      badge: "Bestseller",
      rating: "4.8",
    },

    {
      id: 2,
      name: "Travel Memory Box",
      sub: "Luxury Collection",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
      price: "₹1499",
      oldPrice: "₹1999",
      discount: "-20%",
      badge: "Trending",
      rating: "4.6",
    },

    {
      id: 3,
      name: "Photo Wallet Card",
      sub: "Personalized Metal Card",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
      price: "₹990",
      oldPrice: "₹1490",
      discount: "-34%",
      badge: "Hot Deal",
      rating: "4.7",
    },

    {
      id: 4,
      name: "Wedding Caricature",
      sub: "Customized Couple Gift",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
      price: "₹690",
      oldPrice: "₹990",
      discount: "-14%",
      badge: "Bestseller",
      rating: "4.5",
    },

    {
      id: 5,
      name: "Custom Gift Hamper",
      sub: "Premium Collection",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
      price: "₹1890",
      oldPrice: "₹2390",
      discount: "-18%",
      badge: "Trending",
      rating: "4.9",
    },
  ],

  Birthday: [
    {
      id: 6,
      name: "Birthday Hamper",
      sub: "Luxury Birthday Box",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
      price: "₹1599",
      oldPrice: "₹1999",
      discount: "-22%",
      badge: "Bestseller",
      rating: "4.8",
    },
  ],

  Anniversary: [
    {
      id: 7,
      name: "Couple Memory Lamp",
      sub: "Romantic Collection",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
      price: "₹1290",
      oldPrice: "₹1790",
      discount: "-20%",
      badge: "Trending",
      rating: "4.7",
    },
  ],

  Girlfriend: [
    {
      id: 8,
      name: "Love Scrapbook",
      sub: "Cute Personalized Gift",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
      price: "₹990",
      oldPrice: "₹1490",
      discount: "-34%",
      badge: "Hot Deal",
      rating: "4.9",
    },
  ],

  Boyfriend: [
    {
      id: 9,
      name: "Custom Wallet Card",
      sub: "Metal Wallet Insert",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
      price: "₹790",
      oldPrice: "₹1190",
      discount: "-25%",
      badge: "Trending",
      rating: "4.6",
    },
  ],
};

export default function BestSellers() {

  const [activeCategory, setActiveCategory] =
    useState("Personalized");

  const scrollRef = useRef(null);

  const scroll = (direction) => {

    if (scrollRef.current) {

      const amount = 420;

      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });

    }

  };

  return (
    <section className="bg-[#f7f3ee] py-24 lg:py-28">

      <div className="max-w-[1800px] mx-auto px-5 lg:px-8">

        {/* Heading */}
        <div className="text-center">

          <p
            className="
              text-[#b98d58]
              text-[28px]
              italic
              mb-3
            "
            style={{
              fontFamily: "cursive",
            }}
          >
            thoughtfully curated
          </p>

          <h2
            className="
              text-[48px]
              md:text-[72px]
              text-[#2d2d2d]
              leading-[0.95]
              font-light
              tracking-[-2px]
            "
            style={{
              fontFamily: "Georgia, serif",
            }}
          >
            Best Sellers
          </h2>

          <div className="flex justify-center mt-4">

            <svg
              width="220"
              height="18"
              viewBox="0 0 220 18"
              fill="none"
            >
              <path
                d="M2 9C18 2 34 16 50 9C66 2 82 16 98 9C114 2 130 16 146 9C162 2 178 16 194 9C202 5 210 6 218 9"
                stroke="#d8b14d"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

          </div>

          <p className="text-[#666] text-[18px] mt-5">
            Tried, tested and loved by everyone.
          </p>

        </div>

        {/* Categories */}
        <div className="flex justify-center flex-wrap gap-5 mt-14">

          {categories.map((category) => (

            <button
              key={category}
              onClick={() =>
                setActiveCategory(category)
              }
              className={`
                h-[56px]
                px-9
                rounded-full
                border
                text-[16px]
                transition-all
                duration-300
                ${
                  activeCategory === category
                    ? "bg-[#e7d8ca] border-[#e7d8ca] text-[#2d2d2d]"
                    : "bg-transparent border-[#e7d8ca] text-[#444] hover:bg-[#efe3d8]"
                }
              `}
            >
              {category}
            </button>

          ))}

        </div>

        {/* Slider */}
        <div className="relative mt-20">

          {/* Arrows */}
          <div className="absolute -top-24 right-0 hidden lg:flex items-center gap-4 z-20">

            <button
              onClick={() => scroll("left")}
              className="
                w-[54px]
                h-[54px]
                rounded-[16px]
                bg-white
                shadow-[0_8px_20px_rgba(0,0,0,0.08)]
                flex
                items-center
                justify-center
                hover:scale-105
                transition-all
              "
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => scroll("right")}
              className="
                w-[54px]
                h-[54px]
                rounded-[16px]
                bg-white
                shadow-[0_8px_20px_rgba(0,0,0,0.08)]
                flex
                items-center
                justify-center
                hover:scale-105
                transition-all
              "
            >
              <ChevronRight size={24} />
            </button>

          </div>

          {/* Products */}
          <div
            ref={scrollRef}
            className="
              flex
              gap-7
              overflow-x-auto
              scrollbar-hide
              scroll-smooth
              pb-4
            "
          >

            {productData[activeCategory]?.map((product) => (

              <div
                key={product.id}
                className="
                  min-w-[320px]
                  bg-[#f5f1e8]
                  border
                  border-[#ddd4c7]
                  group
                "
              >

                {/* Image */}
                <div className="relative overflow-hidden">

                  <img
                    src={product.image}
                    alt={product.name}
                    className="
                      w-full
                      h-[430px]
                      object-cover
                      group-hover:scale-[1.03]
                      transition-all
                      duration-500
                    "
                  />

                  {/* Badge */}
                  <div
                    className="
                      absolute
                      top-5
                      right-5
                      bg-white
                      text-[#3550b8]
                      text-[14px]
                      px-4
                      py-2
                      rounded-full
                    "
                  >
                    {product.badge}
                  </div>

                  {/* Rating */}
                  <div
                    className="
                      absolute
                      bottom-5
                      left-5
                      bg-white
                      px-3
                      py-2
                      rounded-full
                      flex
                      items-center
                      gap-1
                    "
                  >

                    <span className="text-[14px]">
                      {product.rating}
                    </span>

                    <Star
                      size={14}
                      fill="#f4b400"
                      color="#f4b400"
                    />

                  </div>

                </div>

                {/* Content */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="text-[18px] text-[#2d2d2d] uppercase">
                        {product.name}
                      </h3>

                      <p className="text-[#999] text-[15px] mt-2">
                        {product.sub}
                      </p>

                    </div>

                    <button className="mt-1">

                      <Heart
                        size={18}
                        strokeWidth={1.5}
                        className="text-[#666]"
                      />

                    </button>

                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-3 mt-6">

                    <span className="text-[28px] text-[#222]">
                      {product.price}
                    </span>

                    <span className="line-through text-[#999] text-[18px]">
                      {product.oldPrice}
                    </span>

                    <span
                      className="
                        bg-[#fff1ee]
                        text-[#ff4d4d]
                        px-3
                        py-1
                        rounded-full
                        text-[14px]
                      "
                    >
                      {product.discount}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}