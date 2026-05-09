"use client";

import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const allProducts = [
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
    categories: ["Personalized", "Birthday", "Girlfriend", "Boyfriend"],
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
    categories: ["Personalized", "Birthday", "Boyfriend"],
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
    categories: ["Personalized", "Anniversary", "Girlfriend", "Boyfriend"],
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
    categories: ["Personalized", "Anniversary", "Girlfriend"],
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
    categories: ["Personalized", "Birthday", "Boyfriend", "Anniversary"],
  },
  {
    name: "Custom Caricature Cake",
    price: "Rs. 890",
    old: "Rs. 990",
    save: "Save 10%",
    image1:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    link: "/product/custom-cake",
    badge: "",
    categories: ["Cakes & Bouquet", "Birthday", "Anniversary"],
  },
  {
    name: "Flower Bouquet",
    price: "Rs. 790",
    old: "Rs. 890",
    save: "Save 11%",
    image1:
      "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=1800",
    image2:
      "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=1800",
    link: "/product/flower-bouquet",
    badge: "",
    categories: ["Cakes & Bouquet", "Girlfriend", "Anniversary"],
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
  const [activeCategory, setActiveCategory] = useState("Personalized");

  const filteredProducts = allProducts.filter((p) =>
    p.categories.includes(activeCategory)
  );

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <section className="pt-8 md:pt-0 pb-24 md:pb-0 bg-[#f7f4ef]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-8">

        {/* HEADING */}
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Best Sellers
          </h2>
          <p className="text-gray-500 text-base md:text-lg mt-4">
            Tried, tested, and totally gift-worthy!
          </p>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex justify-center flex-wrap gap-4 mb-14">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveCategory(cat);
                sliderRef.current?.scrollTo({ left: 0, behavior: "smooth" });
              }}
              className={`
                px-6 py-3 rounded-full border text-sm md:text-[15px]
                transition-all duration-300
                ${
                  activeCategory === cat
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700 hover:border-black hover:text-black"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT SLIDER */}
        <div className="relative">

          {/* LEFT BUTTON */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 bg-white shadow-xl hover:bg-black hover:text-white transition-all duration-300 p-3 rounded-full z-20"
          >
            <ChevronLeft size={22} />
          </button>

          {/* PRODUCTS */}
          <div
            ref={sliderRef}
            className="flex gap-7 overflow-x-auto scroll-smooth no-scrollbar pb-2 transition-all duration-300"
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <Link
                  href={product.link}
                  key={index}
                  className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden">

                    {/* MAIN IMAGE */}
                    <Image
                      src={product.image1}
                      alt={product.name}
                      width={600}
                      height={600}
                      className="w-full h-[320px] object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />

                    {/* HOVER IMAGE */}
                    <Image
                      src={product.image2}
                      alt={product.name}
                      width={600}
                      height={600}
                      className="w-full h-[320px] object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />

                    {/* WISHLIST */}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md hover:bg-black hover:text-white transition-all duration-300"
                    >
                      <Heart size={17} />
                    </button>

                    {/* BADGE */}
                    {product.badge && (
                      <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-black">
                        {product.price}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        {product.old}
                      </span>
                      <span className="text-red-500 text-sm font-medium">
                        {product.save}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="w-full text-center py-20 text-gray-400 text-lg">
                No products found in this category.
              </div>
            )}
          </div>

          {/* RIGHT BUTTON */}
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 bg-white shadow-xl hover:bg-black hover:text-white transition-all duration-300 p-3 rounded-full z-20"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}