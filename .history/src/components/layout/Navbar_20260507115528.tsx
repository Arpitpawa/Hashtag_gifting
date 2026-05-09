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
    <header className="bg-white relative z-50">

      {/* Main Navbar */}
      <div className="border-b border-[#ddd8cf]">

        <div className="container-custom h-[62px] flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-5">

            {/* Mobile Menu */}
            <Sheet>

              <SheetTrigger asChild>

                <button className="lg:hidden">
                  <Menu size={21} strokeWidth={1.5} />
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
                  size={21}
                  strokeWidth={1.5}
                />
              </button>

              <button>
                <User
                  size={21}
                  strokeWidth={1.5}
                />
              </button>

            </div>

          </div>

          {/* Logo */}
          <Link
            href="/"
            className="text-[56px] text-[#2c2c2c] leading-none"
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
                size={21}
                strokeWidth={1.5}
              />
            </button>

            <button className="relative">

              <ShoppingBag
                size={21}
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

  <div className="container-custom h-[54px] flex items-center justify-center gap-10">

    {navItems.map((item) => (

      <div
        key={item.title}
        className="relative group h-full flex items-center"
      >

        {/* Nav Button */}
        <button className="flex items-center gap-1 text-[14px] text-[#444] tracking-wide hover:text-[#2f3e7a] transition">

          {item.title}

          <ChevronDown
            size={14}
            strokeWidth={1.5}
          />

        </button>

        {/* Dropdown */}
        <div className="absolute top-full left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-white border border-[#ddd8cf] shadow-sm min-w-[320px] p-6 z-50">

          <div className="grid grid-cols-2 gap-x-10 gap-y-4">

            {item.dropdown.map((subItem) => (

              <button
                key={subItem}
                className="text-left text-[14px] text-[#555] hover:text-[#2f3e7a] transition whitespace-nowrap"
              >
                {subItem}
              </button>

            ))}

          </div>

        </div>

      </div>

    ))}

  </div>

</div>

    </header>
  );
}