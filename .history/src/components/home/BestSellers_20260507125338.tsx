"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
    badge: "Best Seller",
  },
];

export default function BestSellers() {
  return (
    <section className="bg-[#f7f4ef] py-14 lg:py-16 overflow-hidden">

      <div className="w-full px-4 lg:px-7">

        {/* Header */}
        <div className="relative">

          {/* Arrows */}
          <div className="absolute right-0 top-0 hidden lg:flex items-center gap-3">

            <button
              className="
                w-[46px]
                h-[46px]
                rounded-[14px]
                bg-white
                shadow-[0_2px_10px_rgba(0,0,0,0.08)]
                flex
                items-center
                justify-center
              "
            >
              <ChevronLeft
                size={20}
                strokeWidth={1.8}
              />
            </button>

            <button
              className="
                w-[46px]
                h-[46px]
                rounded-[14px]
                bg-white
                shadow-[0_2px_10px_rgba(0,0,0,0.08)]
                flex
                items-center
                justify-center
              "
            >
              <ChevronRight
                size={20}
                strokeWidth={1.8}
              />
            </button>

          </div>

          {/* Heading */}
          <div className="text-center">

            <h2 className="text-[42px] font-semibold text-[#333] leading-none">
              Best Sellers
            </h2>

            <p className="text-[18px] text-[#555] mt-3">
              Tried, tested, and totally gift-worthy!
            </p>

          </div>

        </div>

        {/* Categories */}
        <div className="flex items-center justify-center gap-6 flex-wrap mt-10">

          {categories.map((category, index) => (

            <button
              key={category}
              className={`
                h-[58px]
                px-9
                rounded-full
                border-[2px]
                text-[17px]
                font-medium
                transition-all
                ${
                  index === 0
                    ? "bg-[#e8d8cb] border-[#e8d8cb] text-[#222]"
                    : "border-[#ead7f3] text-[#222] hover:bg-[#f3e8df]"
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
              className="group"
            >

              {/* Image */}
              <div className="relative rounded-[24px] overflow-hidden">

                <img
                  src={product.image}
                  alt={product.name}
                  className="
                    w-full
                    h-[270px]
                    md:h-[340px]
                    lg:h-[390px]
                    object-cover
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
                      font-medium
                      px-4
                      py-[5px]
                      rounded-full
                    "
                  >
                    {product.badge}
                  </div>

                )}

              </div>

              {/* Product Content */}
              <div className="text-center pt-5">

                <h3 className="text-[20px] font-semibold text-[#444]">
                  {product.name}
                </h3>

                {/* Pricing */}
                <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">

                  {product.oldPrice && (

                    <span className="line-through text-[#444] text-[16px]">
                      {product.oldPrice}
                    </span>

                  )}

                  <span className="text-[#222] text-[17px]">
                    {product.price}
                  </span>

                  {product.save && (

                    <span className="text-[#ff2a2a] text-[16px]">
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