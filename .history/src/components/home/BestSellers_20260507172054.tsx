"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
} from "lucide-react";

const categories = [
  "planners & journals",
  "baby journal set",
  "jotter notepad",
  "pen",
  "notepad",
];

const products = {
  "planners & journals": [
    {
      id: 1,
      title: "BLUE MY ORGANISED CHAOS",
      subtitle: "Undated Daily Planner",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
      price: "₹1299",
      oldPrice: "₹1732",
      discount: "-25%",
      badge: "Bestseller",
      rating: "4.6",
    },

    {
      id: 2,
      title: "OWN THE DAY BLACK",
      subtitle: "Undated Daily Planner",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
      price: "₹1299",
      oldPrice: "₹1732",
      discount: "-25%",
      badge: "Bestseller",
      rating: "4.4",
    },

    {
      id: 3,
      title: "TO-DO",
      subtitle: "Undated Daily Planner",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
      price: "₹1299",
      oldPrice: "₹1732",
      discount: "-25%",
      badge: "Hot Deal",
      rating: "3.6",
    },

    {
      id: 4,
      title: "THIS GIRL HAS GOALS",
      subtitle: "Undated Daily Planner",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
      price: "₹1299",
      oldPrice: "₹1732",
      discount: "-25%",
      badge: "Bestseller",
      rating: "4.4",
    },

    {
      id: 5,
      title: "DAILY GRATITUDE",
      subtitle: "Premium Planner",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
      price: "₹1499",
      oldPrice: "₹1999",
      discount: "-20%",
      badge: "Trending",
      rating: "4.8",
    },
  ],

  "baby journal set": [
    {
      id: 6,
      title: "BABY MEMORIES",
      subtitle: "Luxury Journal",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
      price: "₹1599",
      oldPrice: "₹1999",
      discount: "-18%",
      badge: "Bestseller",
      rating: "4.9",
    },
  ],

  "jotter notepad": [
    {
      id: 7,
      title: "DAILY NOTES",
      subtitle: "Soft Cover Notebook",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
      price: "₹799",
      oldPrice: "₹1099",
      discount: "-12%",
      badge: "Trending",
      rating: "4.5",
    },
  ],

  pen: [
    {
      id: 8,
      title: "SIGNATURE PEN",
      subtitle: "Luxury Metal Pen",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
      price: "₹999",
      oldPrice: "₹1399",
      discount: "-15%",
      badge: "Hot Deal",
      rating: "4.7",
    },
  ],

  notepad: [
    {
      id: 9,
      title: "EVERYDAY THOUGHTS",
      subtitle: "Minimal Notepad",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
      price: "₹599",
      oldPrice: "₹899",
      discount: "-10%",
      badge: "Trending",
      rating: "4.3",
    },
  ],
};

export default function BestSellers() {

  const [activeTab, setActiveTab] =
    useState("planners & journals");

  const sliderRef = useRef(null);

  const scroll = (direction) => {

    if (sliderRef.current) {

      sliderRef.current.scrollBy({
        left: direction === "left" ? -420 : 420,
        behavior: "smooth",
      });

    }

  };

  return (
    <section className="bg-[#f7f3ee] py-24 lg:py-28 overflow-hidden">

      <div className="max-w-[1700px] mx-auto px-5 lg:px-10">

        {/* Top Space */}
        <div className="mb-10" />

        {/* Heading */}
        <div className="text-center">

          <p
            className="
              text-[#6d655d]
              text-[26px]
              italic
              mb-3
            "
            style={{
              fontFamily: "cursive",
            }}
          >
            choose gifts that fit your moments
          </p>

          <h2
            className="
              text-[52px]
              md:text-[84px]
              leading-[0.95]
              tracking-[-2px]
              text-[#2f3e7a]
              font-light
            "
            style={{
              fontFamily: "Georgia, serif",
            }}
          >
            FIND YOUR EVERYDAY
            <br />
            COMPANION
          </h2>

          {/* Underline */}
          <div className="flex justify-center mt-5">

            <svg
              width="250"
              height="18"
              viewBox="0 0 250 18"
              fill="none"
            >
              <path
                d="M2 9C20 2 38 16 56 9C74 2 92 16 110 9C128 2 146 16 164 9C182 2 200 16 218 9C228 4 238 5 248 9"
                stroke="#d8b14d"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

          </div>

        </div>

        {/* Categories */}
        <div className="flex justify-center flex-wrap gap-14 mt-16">

          {categories.map((category) => (

            <button
              key={category}
              onClick={() =>
                setActiveTab(category)
              }
              className={`
                relative
                text-[18px]
                transition-all
                duration-300
                capitalize
                pb-2
                ${
                  activeTab === category
                    ? "text-[#2d2d2d]"
                    : "text-[#666]"
                }
              `}
            >

              {category}

              {activeTab === category && (

                <div
                  className="
                    absolute
                    left-0
                    bottom-0
                    w-full
                    h-[1.5px]
                    bg-[#555]
                  "
                />

              )}

            </button>

          ))}

        </div>

        {/* Slider Wrapper */}
        <div className="relative mt-20">

          {/* Arrows */}
          <div className="absolute -top-24 right-0 hidden lg:flex items-center gap-4 z-20">

            <button
              onClick={() => scroll("left")}
              className="
                w-[52px]
                h-[52px]
                rounded-[16px]
                bg-white
                border
                border-[#e3ddd2]
                flex
                items-center
                justify-center
                shadow-[0_4px_14px_rgba(0,0,0,0.05)]
              "
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={() => scroll("right")}
              className="
                w-[52px]
                h-[52px]
                rounded-[16px]
                bg-white
                border
                border-[#e3ddd2]
                flex
                items-center
                justify-center
                shadow-[0_4px_14px_rgba(0,0,0,0.05)]
              "
            >
              <ChevronRight size={22} />
            </button>

          </div>

          {/* Products Slider */}
          <div
            ref={sliderRef}
            className="
              flex
              overflow-x-auto
              scroll-smooth
              scrollbar-hide
            "
          >

            {products[activeTab]?.map((product) => (

              <div
                key={product.id}
                className="
                  min-w-[320px]
                  lg:min-w-[370px]
                  bg-[#f3f0e7]
                  border
                  border-[#ddd7cb]
                  mr-0
                  group
                "
              >

                {/* Image Area */}
                <div className="relative px-10 pt-10">

                  {/* Badge */}
                  <div
                    className="
                      absolute
                      top-5
                      right-5
                      bg-white
                      text-[#4054b2]
                      text-[14px]
                      px-4
                      py-2
                      rounded-full
                    "
                  >
                    {product.badge}
                  </div>

                  {/* Product Image */}
                  <div
                    className="
                      h-[430px]
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <img
                      src={product.image}
                      alt={product.title}
                      className="
                        h-[360px]
                        object-contain
                        group-hover:scale-[1.03]
                        transition-all
                        duration-500
                      "
                    />

                  </div>

                  {/* Rating */}
                  <div
                    className="
                      absolute
                      left-4
                      bottom-5
                      bg-white
                      rounded-full
                      px-3
                      py-2
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
                      fill="#f5b400"
                      color="#f5b400"
                    />

                  </div>

                </div>

                {/* Content */}
                <div className="px-5 pb-6 pt-4">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3
                        className="
                          text-[18px]
                          text-[#2d2d2d]
                          uppercase
                          leading-snug
                        "
                      >
                        {product.title}
                      </h3>

                      <p className="text-[#9a948a] mt-3 text-[15px]">
                        {product.subtitle}
                      </p>

                    </div>

                    <button>

                      <Heart
                        size={18}
                        strokeWidth={1.6}
                        className="text-[#777]"
                      />

                    </button>

                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-3 mt-7 flex-wrap">

                    <span className="text-[30px] text-[#222]">
                      {product.price}
                    </span>

                    <span className="line-through text-[#9b9b9b] text-[18px]">
                      {product.oldPrice}
                    </span>

                    <span
                      className="
                        bg-[#fff0eb]
                        text-[#ff5b4d]
                        text-[14px]
                        px-3
                        py-1
                        rounded-full
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

        {/* View All */}
        <div className="flex justify-center mt-20">

          <button
            className="
              text-[24px]
              text-[#2d2d2d]
              border-b
              border-[#2d2d2d]
              pb-1
              hover:opacity-70
              transition-all
            "
          >
            VIEW ALL
          </button>

        </div>

      </div>

    </section>
  );
}