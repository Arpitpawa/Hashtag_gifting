"use client";

import { useState } from "react";

const categories = [
  "Personalized",
  "Birthday",
  "Anniversary",
  "Girlfriend",
  "Boyfriend",
  "Cakes & Bouquet",
];

const products = [
  {
    id: 1,
    name: "Custom Memory Frame",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "₹1,299",
    price: "₹899",
    save: "Save 30%",
    badge: "Best Seller",
  },

  {
    id: 2,
    name: "Luxury Gift Hamper",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "₹1,899",
    price: "₹1,390",
    save: "Save 22%",
  },

  {
    id: 3,
    name: "Couple Memory Box",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "₹1,490",
    price: "₹1,090",
    save: "Save 18%",
  },

  {
    id: 4,
    name: "Wedding Caricature",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "₹990",
    price: "₹690",
    save: "Save 14%",
  },

  {
    id: 5,
    name: "Photo Wallet Card",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "₹1,490",
    price: "₹990",
    save: "Save 34%",
    badge: "Trending",
  },
];

export default function BestSellers() {
  const [activeCategory, setActiveCategory] =
    useState("Personalized");

  return (
    <section className="bg-[#f6f1eb] py-16 lg:py-24 overflow-hidden">

      <div className="container-custom">

        {/* Heading */}
        <div className="text-center">

          <p
            className="text-[#c7a04b] text-[24px] italic mb-2"
            style={{
              fontFamily: "cursive",
            }}
          >
            handpicked with love
          </p>

          <h2
            className="
              text-[34px]
              md:text-[48px]
              text-[#2c2c2c]
              leading-none
              font-light
            "
            style={{
              fontFamily: "Georgia, serif",
            }}
          >
            Best Sellers
          </h2>

          <p className="text-[#5f5f5f] text-[15px] md:text-[18px] mt-4">
            Tried, tested and loved by everyone.
          </p>

        </div>

        {/* Categories */}
        <div className="flex items-center justify-center gap-4 flex-wrap mt-10">

          {categories.map((category) => (

            <button
              key={category}
              onClick={() =>
                setActiveCategory(category)
              }
              className={`
                px-7
                py-3
                rounded-full
                border
                transition-all
                duration-300
                text-[15px]
                md:text-[16px]
                ${
                  activeCategory === category
                    ? "bg-[#ead7f3] border-[#ead7f3] text-[#2c2c2c]"
                    : "bg-transparent border-[#ead7f3] text-[#2c2c2c] hover:bg-[#f1e3f7]"
                }
              `}
            >
              {category}
            </button>

          ))}

        </div>

        {/* Products */}
        <div
          className="
            mt-14
            grid
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-5
            gap-5
          "
        >

          {products.map((product) => (

            <div
              key={product.id}
              className="group"
            >

              {/* Image */}
              <div className="relative overflow-hidden rounded-[22px] bg-white">

                <img
                  src={product.image}
                  alt={product.name}
                  className="
                    w-full
                    h-[240px]
                    md:h-[340px]
                    object-cover
                    group-hover:scale-105
                    transition-all
                    duration-500
                  "
                />

                {/* Badge */}
                {product.badge && (

                  <div
                    className="
                      absolute
                      top-3
                      right-3
                      bg-black
                      text-white
                      text-[11px]
                      px-3
                      py-1
                      rounded-full
                    "
                  >
                    {product.badge}
                  </div>

                )}

              </div>

              {/* Content */}
              <div className="pt-5 text-center">

                <h3 className="text-[17px] text-[#2c2c2c]">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">

                  <span className="line-through text-[#777] text-[15px]">
                    {product.oldPrice}
                  </span>

                  <span className="text-[#2c2c2c] text-[18px]">
                    {product.price}
                  </span>

                  <span className="text-red-500 text-[15px]">
                    {product.save}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}