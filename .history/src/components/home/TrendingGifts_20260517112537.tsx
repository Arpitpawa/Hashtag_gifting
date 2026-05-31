"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

const products = [
  {
    name: "Custom spotify frame",
    price: "Rs. 799",
    old: "Rs. 999",
    save: "Save 20%",
    badge: "Best seller",
    image1: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    image2: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/product/custom-spotify-frame",
  },
  {
    name: "Photo memory box",
    price: "Rs. 1290",
    old: "Rs. 1490",
    save: "Save 13%",
    badge: "",
    image1: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    image2: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/product/photo-memory-box",
  },
  {
    name: "Personalized keychain",
    price: "Rs. 399",
    old: "Rs. 499",
    save: "Save 20%",
    badge: "",
    image1: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    image2: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=800",
    link: "/product/personalized-keychain",
  },
  {
    name: "LED name frame",
    price: "Rs. 999",
    old: "Rs. 1299",
    save: "Save 23%",
    badge: "Best seller",
    image1: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    image2: "https://confettigifts.in/cdn/shop/files/1_3e7d7759-e2b8-48e4-8732-d94227e61690.webp?v=1764568216&width=800",
    link: "/product/led-name-frame",
  },
  {
    name: "Couple photo frame",
    price: "Rs. 699",
    old: "Rs. 799",
    save: "Save 13%",
    badge: "Best seller",
    image1: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    image2: "https://confettigifts.in/cdn/shop/files/4-7_6d3afacb-f70e-495e-896b-b260f34b2dc1.webp?v=1772883529&width=800",
    link: "/product/couple-photo-frame",
  },
  {
    name: "Wedding caricature",
    price: "Rs. 490",
    old: "Rs. 590",
    save: "Save 17%",
    badge: "",
    image1: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    image2: "https://confettigifts.in/cdn/shop/files/4-7_6d3afacb-f70e-495e-896b-b260f34b2dc1.webp?v=1772883529&width=800",
    link: "/product/wedding-caricature",
  },
  {
    name: "Metal wallet card",
    price: "Rs. 990",
    old: "Rs. 1090",
    save: "Save 10%",
    badge: "Best seller",
    image1: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    image2: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/product/metal-wallet-card",
  },
];

export default function TrendingGifts() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -340, behavior: "smooth" });
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 340, behavior: "smooth" });

  const toggleWishlist = (index: number) => {
    setWishlist((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="pt-0 pb-16 md:pb-24 relative overflow-hidden">

      {/* Decorative blob */}
      <div
        className="absolute top-0 left-1/2 w-[600px] h-[300px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: "#2f3e7a", filter: "blur(80px)", transform: "translate(-50%, -50%)" }}
      />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-12 md:mb-14">
          <span
            className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            People are loving right now
          </span>
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a1a] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Trending personalized gifts
          </h2>
          <p className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto">
            Gifts people are loving right now
          </p>
        </div>

        {/* ── SLIDER ── */}
        <div className="relative">

          {/* LEFT ARROW */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* CARDS */}
          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2 px-1"
          >
            {products.map((product, index) => (
              <div key={index} className="min-w-[260px] md:min-w-[300px] flex-shrink-0 group">

                {/* IMAGE AREA */}
                <div className="relative rounded-2xl overflow-hidden bg-white">
                  <div className="relative h-[280px] md:h-[320px]">
                    <Image
                      src={product.image1}
                      alt={product.name}
                      fill
                      className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                      sizes="(max-width: 768px) 260px, 300px"
                    />
                    <Image
                      src={product.image2}
                      alt={product.name}
                      fill
                      className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      sizes="(max-width: 768px) 260px, 300px"
                    />
                  </div>

                  {/* BADGE */}
                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* WISHLIST */}
                  <button
                    onClick={() => toggleWishlist(index)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200"
                  >
                    <Heart
                      size={16}
                      strokeWidth={2}
                      className={wishlist.includes(index) ? "fill-red-500 text-[#c0555a]" : "text-gray-400"}
                    />
                  </button>
                </div>

                {/* PRODUCT INFO */}
                <Link href={product.link} className="block mt-4 px-1">
                  <h3 className="text-[15px] font-medium text-[#1a1a1a] mb-2 hover:text-[#2f3e7a] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-[#1a1a1a]">{product.price}</span>
                    <span className="text-[13px] text-gray-400 line-through">{product.old}</span>
                    <span className="text-[12px] font-semibold text-[#c0555a]">{product.save}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-lg items-center justify-center hover:bg-black hover:text-white transition-all duration-300 border border-[#e8e0d5]"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        {/* VIEW ALL CTA */}
        <div className="flex justify-center mt-14">
  <button
    onClick={() => router.push("/products/trending")}
    className="px-8 py-4 rounded-full border border-gray-300 text-[#c0555a] font-medium whitespace-nowrap hover:bg-[#c0555a] hover:text-white hover:border-[#c0555a] transition-all duration-300 flex items-center gap-3"
  >
    View all trending gifts
    <span className="text-lg">→</span>
  </button>
</div>

      </div>
    </section>
  );
}