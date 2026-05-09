"use client";

import Link from "next/link";

import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  ChevronDown,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const categories = [
  "Birthday Gifts",
  "Anniversary Gifts",
  "Gifts by Relationship",
  "Gifts by Type",
  "Wedding Gifts",
  "Customize Gifts",
  "Bulk Orders",
];

export default function Navbar() {
  return (
    <header className="bg-[#f7f4ef] relative z-50">

      {/* Main Navbar */}
      <div className="border-b border-[#ddd8cf]">

        <div className="container-custom h-[78px] flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-5">

            {/* Mobile Menu */}
            <Sheet>

              <SheetTrigger asChild>

                <button className="lg:hidden">
                  <Menu size={22} strokeWidth={1.5} />
                </button>

              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] bg-[#f7f4ef]">

                <div className="mt-10 flex flex-col gap-6">

                  {categories.map((item) => (
                    <button
                      key={item}
                      className="text-left text-[15px]"
                    >
                      {item}
                    </button>
                  ))}

                </div>

              </SheetContent>

            </Sheet>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center gap-5">

              <button>
                <Search
                  size={22}
                  strokeWidth={1.5}
                />
              </button>

              <button>
                <User
                  size={22}
                  strokeWidth={1.5}
                />
              </button>

            </div>

          </div>

          {/* Logo */}
          <Link
            href="/"
            className="text-4xl md:text-5xl text-[#2c2c2c]"
            style={{
              fontFamily: "cursive",
            }}
          >
            hashtag
          </Link>

          {/* Right */}
          <div className="flex items-center gap-5">

            <button>
              <Heart
                size={22}
                strokeWidth={1.5}
              />
            </button>

            <button className="relative">

              <ShoppingBag
                size={22}
                strokeWidth={1.5}
              />

              <span className="absolute -top-2 -right-2 bg-[#2f3e7a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>

            </button>

          </div>

        </div>

      </div>

      {/* Category Navbar */}
      <div className="hidden lg:block border-b border-[#ddd8cf] bg-white">

        <div className="container-custom h-[58px] flex items-center justify-center gap-10 text-[15px] text-[#444]">

          {categories.map((item) => (

            <button
              key={item}
              className="flex items-center gap-1 hover:text-[#2f3e7a] transition"
            >
              {item}

              <ChevronDown
                size={15}
                strokeWidth={1.5}
              />

            </button>

          ))}

        </div>

      </div>

    </header>
  );
}