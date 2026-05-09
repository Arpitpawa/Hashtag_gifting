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
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -350,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 bg-[var(--bg-section)]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* TITLE */}

        <div className="text-center mb-5">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Best Sellers
          </h2>

          <p className="text-gray-500 mt-2">
            Tried, tested, and totally gift-worthy!
          </p>
        </div>

        {/* CATEGORY PILLS */}

        <div className="flex justify-center flex-wrap gap-4 mb-8 md:mb-10">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`px-6 py-2 rounded-full border text-sm transition
              ${
                index === 0
                  ? "bg-[var(--red)] text-white border-[var(--red)]"
                  : "border-gray-300 text-gray-700 hover:border-[var(--red)] hover:text-[var(--red)]"
              }`}
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
            className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-md hover:bg-[var(--red)] hover:text-white transition p-2 rounded-full z-10"
          >
            <ChevronLeft size={20} />
          </button>

          {/* PRODUCTS */}

          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
          >
            {products.map((product, index) => (
              <Link
                href={product.link}
                key={index}
                className="min-w-[280px] group block bg-white p-3 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                {/* IMAGE */}

                <div className="relative overflow-hidden rounded-lg">
                  
                  {/* MAIN IMAGE */}

                  <Image
                    src={product.image1}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-[300px] object-cover transition-opacity duration-300 group-hover:opacity-0"
                  />

                  {/* HOVER IMAGE */}

                  <Image
                    src={product.image2}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-[300px] object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  {/* WISHLIST */}

                  <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow hover:text-[var(--red)] transition">
                    <Heart size={16} />
                  </button>

                  {/* BADGE */}

                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* PRODUCT INFO */}

                <div className="mt-3">
                  <h3 className="text-gray-800 font-medium">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="font-semibold">
                      {product.price}
                    </span>

                    <span className="text-gray-400 line-through">
                      {product.old}
                    </span>

                    <span className="text-[var(--red)]">
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
            className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-md hover:bg-[var(--red)] hover:text-white transition p-2 rounded-full z-10"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}