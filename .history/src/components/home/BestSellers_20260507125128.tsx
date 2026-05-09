"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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
    name: "Custom Socks",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "Rs. 690.00",
    price: "Rs. 590.00",
    save: "Save 14%",
    badge: "Best Seller",
  },

  {
    id: 2,
    name: "CineMagic Clap",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "Rs. 890.00",
    price: "Rs. 690.00",
    save: "Save 22%",
  },

  {
    id: 3,
    name: "Travel Memory Box",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "Rs. 1,390.00",
    price: "Rs. 1,290.00",
    save: "Save 7%",
  },

  {
    id: 4,
    name: "Indian Wedding Caricature",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    price: "Rs. 590.00",
  },

  {
    id: 5,
    name: "Metal Wallet Card",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    oldPrice: "Rs. 1,490.00",
    price: "from Rs. 990.00",
    save: "Save 34%",
    badge: "Trending",
  },
];

export default function BestSellers() {
  return (
    <section className="bg-[#f7f3ee] py-16 lg:py-20 overflow-hidden">

      <div className="max-w-[1780px] mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="relative">

          {/* Arrows */}
          <div className="absolute right-0 -top-2 hidden lg:flex items-center gap-3">

            <button
              className="
                w-[48px]
                h-[48px]
                rounded-[14px]
                bg-white
                shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                flex
                items-center
                justify-center
                hover:scale-105
                transition-all
              "
            >
              <ChevronLeft size={22} />
            </button>

            <button
              className="
                w-[48px]
                h-[48px]
                rounded-[14px]
                bg-white
                shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                flex
                items-center
                justify-center
                hover:scale-105
                transition-all
              "
            >
              <ChevronRight size={22} />
            </button>

          </div>

          {/* Title */}
          <div className="text-center">

            <h2 className="text-[34px] md:text-[42px] font-medium text-[#2d2d2d]">
              Best Sellers
            </h2>

            <p className="text-[#555] text-[18px] mt-2">
              Tried, tested, and totally gift-worthy!
            </p>

          </div>

        </div>

        {/* Categories */}
        <div className="flex items-center justify-center gap-5 flex-wrap mt-10">

          {categories.map((category, index) => (

            <button
              key={category}
              className={`
                h-[58px]
                px-8
                rounded-full
                border-2
                text-[16px]
                font-medium
                transition-all
                ${
                  index === 0
                    ? "bg-[#e7d2c3] border-[#e7d2c3] text-[#2d2d2d]"
                    : "border-[#e7d2c3] text-[#2d2d2d] hover:bg-[#efe1d7]"
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
            gap-6
          "
        >

          {products.map((product) => (

            <div
              key={product.id}
              className="group cursor-pointer"
            >

              {/* Image */}
              <div className="relative overflow-hidden rounded-[24px] bg-white">

                <img
                  src={product.image}
                  alt={product.name}
                  className="
                    w-full
                    h-[250px]
                    md:h-[340px]
                    lg:h-[380px]
                    object-cover
                    group-hover:scale-[1.03]
                    transition-all
                    duration-500
                  "
                />

                {/* Badge */}
                {product.badge && (

                  <div
                    className="
                      absolute
                      top-4
                      right-4
                      bg-black
                      text-white
                      text-[13px]
                      px-4
                      py-[6px]
                      rounded-full
                      font-medium
                    "
                  >
                    {product.badge}
                  </div>

                )}

              </div>

              {/* Content */}
              <div className="pt-5 text-center">

                <h3 className="text-[20px] font-medium text-[#333]">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">

                  {product.oldPrice && (

                    <span className="line-through text-[#555] text-[16px]">
                      {product.oldPrice}
                    </span>

                  )}

                  <span className="text-[#222] text-[18px]">
                    {product.price}
                  </span>

                  {product.save && (

                    <span className="text-red-500 text-[16px]">
                      {product.save}
                    </span>

                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}