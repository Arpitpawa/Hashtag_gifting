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
  "Mother's Day Gifts",
  "Style Your Own Gift",
  "Bulk Gifting",
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white">

      {/* Top Announcement */}
      <div className="bg-[#d7b6df] text-white text-sm">

        <div className="container-custom h-10 flex items-center justify-between">

          <p className="hidden md:block font-medium">
            Free Gift on Every Purchase
          </p>

          <p className="font-medium">
            24 - 48 Hours Delivery Available*
          </p>

          <button className="hidden md:block font-medium">
            Track Order
          </button>

        </div>
      </div>

      {/* Main Navbar */}
      <div className="border-b border-gray-200">

        <div className="container-custom h-[78px] flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-4">

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>

                <button className="lg:hidden">
                  <Menu size={22} strokeWidth={1.5} />
                </button>

              </SheetTrigger>

              <SheetContent side="left" className="w-[320px]">

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

            {/* Desktop Left Empty */}
            <div className="hidden lg:flex items-center gap-5">

              <button>
                <User size={22} strokeWidth={1.5} />
              </button>

              <button>
                <Search size={22} strokeWidth={1.5} />
              </button>

            </div>

          </div>

          {/* Logo */}
          <Link
            href="/"
            className="text-5xl font-light tracking-wide"
            style={{
              fontFamily: "cursive",
            }}
          >
            hashtag
          </Link>

          {/* Right */}
          <div className="flex items-center gap-5">

            <button>
              <Heart size={22} strokeWidth={1.5} />
            </button>

            <button className="relative">

              <ShoppingBag
                size={22}
                strokeWidth={1.5}
              />

              <span className="absolute -top-2 -right-2 bg-[#a5b8db] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>

            </button>

          </div>

        </div>

      </div>

      {/* Desktop Categories */}
      <div className="hidden lg:block border-b border-gray-200">

        <div className="container-custom h-[58px] flex items-center justify-center gap-10 text-[15px] text-[#444]">

          {categories.map((item) => (

            <button
              key={item}
              className="flex items-center gap-1 hover:text-black transition"
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