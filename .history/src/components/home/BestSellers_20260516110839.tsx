"use client";

import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  "Personalized",
  "Birthday",
  "Anniversary",
  "Girlfriend",
  "Boyfriend",
  "Cakes & bouquet",
];

const products = [
  {
    id: 1,
    title: "Custom socks",
    image: "/products/socks.jpg",
    price: 590,
    oldPrice: 690,
    save: "14%",
    tag: "Best seller",
    category: "Personalized",
  },
  {
    id: 2,
    title: "CineMagic clap",
    image: "/products/clap.jpg",
    price: 690,
    oldPrice: 890,
    save: "22%",
    tag: "",
    category: "Birthday",
  },
  {
    id: 3,
    title: "Travel memory box",
    image: "/products/box.jpg",
    price: 1290,
    oldPrice: 1390,
    save: "7%",
    tag: "",
    category: "Anniversary",
  },
  {
    id: 4,
    title: "Wedding caricature",
    image: "/products/caricature.jpg",
    price: 490,
    oldPrice: 590,
    save: "17%",
    tag: "Best seller",
    category: "Girlfriend",
  },
  {
    id: 5,
    title: "Metal world gift",
    image: "/products/confetti.jpg",
    price: 990,
    oldPrice: 1190,
    save: "18%",
    tag: "Best seller",
    category: "Boyfriend",
  },
];

export default function BestSellers() {
  const [activeCategory, setActiveCategory] = useState("Personalized");

  const sliderRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    const scrollAmount = 350;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-20 bg-[#f3efe8] overflow-hidden">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-[#0d1633]">
            Best sellers
          </h2>

          <p className="mt-4 text-gray-500 text-lg">
            Tried, tested, and totally gift-worthy!
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full border text-sm transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#c0555a] text-white border-[#c0555a] shadow-none"
                  : "border-gray-300 text-gray-700 hover:border-[#c0555a] hover:text-[#c0555a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="relative mt-14">
          {/* Left Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white w-14 h-14 rounded-full shadow-md flex items-center justify-center"
          >
            <ChevronLeft size={26} />
          </button>

          {/* Right Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white w-14 h-14 rounded-full shadow-md flex items-center justify-center"
          >
            <ChevronRight size={26} />
          </button>

          {/* Products */}
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-16"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[320px] bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100"
              >
                {/* Image */}
                <div className="relative">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="w-full h-[320px] object-cover"
                  />

                  {/* Tag */}
                  {product.tag && (
                    <div className="absolute top-4 left-4 bg-black text-white text-sm px-4 py-2 rounded-full font-medium">
                      {product.tag}
                    </div>
                  )}

                  {/* Wishlist */}
                  <button className="absolute top-4 right-4 bg-white w-12 h-12 rounded-full shadow-md flex items-center justify-center">
                    <Heart size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-[#0d1633]">
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <span className="text-3xl font-bold text-black">
                      Rs. {product.price}
                    </span>

                    <span className="text-gray-400 line-through text-lg">
                      Rs. {product.oldPrice}
                    </span>

                    <span className="text-[#c0555a] text-base font-medium">
                      Save {product.save}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-14">
          <button
            onClick={() =>
              router.push(
                `/products/${activeCategory
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`
              )
            }
            className="bg-[#c0555a] text-white px-8 py-3 rounded-full text-sm font-medium border border-[#c0555a] hover:bg-white hover:text-[#c0555a] transition-all duration-300"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}