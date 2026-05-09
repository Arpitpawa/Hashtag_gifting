"use client";

import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const products = [
  {
    name: "Custom Socks",
    price: "Rs. 590",
    old: "Rs. 690",
    save: "Save 14%",
    image1:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    link: "/product/custom-socks",
    badge: "Best Seller",
  },
  {
    name: "CineMagic Clap",
    price: "Rs. 690",
    old: "Rs. 890",
    save: "Save 22%",
    image1:
      "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/1_3e7d7759-e2b8-48e4-8732-d94227e61690.webp?v=1764568216&width=1080",
    link: "/product/cinemagic-clap",
    badge: "",
  },
  {
    name: "Travel Memory Box",
    price: "Rs. 1290",
    old: "Rs. 1390",
    save: "Save 7%",
    image1:
      "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=1800",
    image2:
      "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=1800",
    link: "/product/travel-memory-box",
    badge: "",
  },
  {
    name: "Wedding Caricature",
    price: "Rs. 490",
    old: "Rs. 590",
    save: "Save 17%",
    image1:
      "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/4-7_6d3afacb-f70e-495e-896b-b260f34b2dc1.webp?v=1772883529&width=1080",
    link: "/product/wedding-caricature",
    badge: "Best Seller",
  },
  {
    name: "Metal Wallet Card",
    price: "Rs. 990",
    old: "Rs. 1090",
    save: "Save 10%",
    image1:
      "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=1800",
    image2:
      "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=1800",
    link: "/product/metal-wallet-card",
    badge: "Best Seller",
  },
];

const categories = [
  "Personalized",
  "Birthday",
  "Anniversary",
  "Girlfriend",
  "Boyfriend",
  "Cakes & Bouquet",
];

export default function BestSellers() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -400,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative bg-[#f7f4ef] pt-32 md:pt-40 pb-24 overflow-hidden">
      
      {/* TOP SPACING DECOR */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#f7f4ef]/0 to-[#f7f4ef]" />

      <div className="max-w-[1500px] mx-auto px-4 md:px-8">
        
        {/* HEADER */}
        <div className="text-center mb-16 md:mb-20">
          
          <span className="text-sm tracking-[4px] uppercase text-gray-500">
            Trending Gifts
          </span>

          <h2
            className="
              text-5xl
              md:text-7xl
              mt-4
              text-[#111827]
              tracking-tight
              leading-none
            "
            style={{
              fontFamily: "Georgia, serif",
            }}
          >
            Best Sellers
          </h2>

          <p className="text-gray-500 text-lg mt-5 max-w-2xl mx-auto">
            Handpicked personalized gifts crafted beautifully to make every
            memory unforgettable.
          </p>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex justify-center flex-wrap gap-4 mb-16">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`
                px-7 py-3 rounded-full text-sm md:text-[15px]
                transition-all duration-300 border
                ${
                  index === 0
                    ? "bg-black text-white border-black shadow-lg"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-black hover:text-white hover:border-black"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SLIDER */}
        <div className="relative">
          
          {/* LEFT BUTTON */}
          <button
            onClick={scrollLeft}
            className="
              hidden lg:flex
              absolute -left-7 top-1/2 -translate-y-1/2
              w-14 h-14
              bg-white
              rounded-full
              shadow-2xl
              items-center justify-center
              hover:bg-black hover:text-white
              transition-all duration-300
              z-30
            "
          >
            <ChevronLeft size={24} />
          </button>

          {/* PRODUCTS */}
          <div
            ref={sliderRef}
            className="
              flex gap-8 overflow-x-auto scroll-smooth
              no-scrollbar pb-4
            "
          >
            {products.map((product, index) => (
              <Link
                href={product.link}
                key={index}
                className="
                  min-w-[300px]
                  md:min-w-[340px]
                  bg-white
                  rounded-[30px]
                  overflow-hidden
                  group
                  transition-all duration-500
                  hover:-translate-y-3
                  shadow-[0_10px_40px_rgba(0,0,0,0.06)]
                  hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                "
              >
                
                {/* IMAGE AREA */}
                <div className="relative overflow-hidden">
                  
                  {/* IMAGE 1 */}
                  <Image
                    src={product.image1}
                    alt={product.name}
                    width={700}
                    height={700}
                    className="
                      w-full h-[400px]
                      object-cover
                      transition-all duration-700
                      group-hover:scale-105
                      group-hover:opacity-0
                    "
                  />

                  {/* IMAGE 2 */}
                  <Image
                    src={product.image2}
                    alt={product.name}
                    width={700}
                    height={700}
                    className="
                      absolute inset-0
                      w-full h-[400px]
                      object-cover
                      opacity-0
                      scale-105
                      transition-all duration-700
                      group-hover:opacity-100
                      group-hover:scale-100
                    "
                  />

                  {/* BADGE */}
                  {product.badge && (
                    <div className="absolute top-5 left-5">
                      <span className="bg-black text-white text-xs px-4 py-2 rounded-full tracking-wide">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* HEART */}
                  <button
                    className="
                      absolute top-5 right-5
                      w-11 h-11
                      rounded-full
                      bg-white/90
                      backdrop-blur-md
                      flex items-center justify-center
                      shadow-lg
                      hover:bg-black hover:text-white
                      transition-all duration-300
                    "
                  >
                    <Heart size={18} />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-2xl font-bold text-black">
                      {product.price}
                    </span>

                    <span className="text-gray-400 line-through">
                      {product.old}
                    </span>

                    <span className="text-red-500 font-medium">
                      {product.save}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* RIGHT BUTTON */}
          <button
            onClick={scrollRight}
            className="
              hidden lg:flex
              absolute -right-7 top-1/2 -translate-y-1/2
              w-14 h-14
              bg-white
              rounded-full
              shadow-2xl
              items-center justify-center
              hover:bg-black hover:text-white
              transition-all duration-300
              z-30
            "
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}