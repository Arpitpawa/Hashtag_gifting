"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    title: "Birthday Gifts",
    items: [
      "Birthday Gifts for Him",
      "Birthday Gifts for Her",
      "Birthday Hampers",
      "Birthday Frames",
      "Birthday Mugs",
      "Birthday Cards",
    ],
  },

  {
    title: "Anniversary Gifts",
    items: [
      "Anniversary Gifts for Wife",
      "Anniversary Gifts for Husband",
      "Couple Frames",
      "Personalized Lamps",
      "Customized Cushions",
      "Anniversary Hampers",
    ],
  },

  {
    title: "Gifts by Relationship",
    items: [
      "Gifts for Boyfriend",
      "Gifts for Girlfriend",
      "Gifts for Husband",
      "Gifts for Wife",
      "Gifts for Sister",
      "Gifts for Brother",
      "Gifts for Friends",
      "Gifts for Couple",
      "Gifts for Her",
      "Gifts for Him",
      "Gifts for Father",
      "Gifts for Mother",
      "Gifts for Fiance",
      "Gifts for Kids",
      "Gifts for Bridesmaids",
      "Gifts for Newly Married Couple",
      "Gifts for Mom To Be",
      "Gifts for Dad To Be",
      "Gifts for Parents To Be",
      "Gifts for Baby Shower",
    ],
  },

  {
    title: "Gifts by Type",
    items: [
      "Customized Mugs",
      "Photo Frames",
      "Name Plates",
      "Explosion Boxes",
      "Gift Hampers",
      "Wallet Cards",
      "LED Lamps",
      "Cushions",
    ],
  },

  {
    title: "Mother's Day Gifts",
    items: [
      "Photo Frames",
      "Customized Lamps",
      "Gift Hampers",
      "Flowers & Chocolates",
      "Memory Scrapbooks",
      "Personalized Cushions",
    ],
  },

  {
    title: "Style Your Own Gifts",
    items: [
      "Upload Your Photo",
      "Custom Text Gifts",
      "Custom Mugs",
      "Custom Frames",
      "Custom LED Lamps",
      "Custom Hampers",
    ],
  },

  {
    title: "Special Days",
    items: [
      "Valentine's Day",
      "Mother's Day",
      "Father's Day",
      "Friendship Day",
      "Women's Day",
      "Raksha Bandhan",
    ],
  },

  {
    title: "Bulk Gifting",
    items: [
      "Corporate Gifts",
      "Employee Hampers",
      "Wedding Bulk Orders",
      "Event Gifting",
      "Customized Branding",
    ],
  },
];

export default function Navbar() {
  const [activeMenu, setActiveMenu] =
    useState<string | null>(null);

  return (
    <header className="bg-white relative z-50">

      {/* Main Navbar */}
      <div className="border-b border-[#ececec]">

        <div className="container-custom h-[70px] flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-5">

            {/* Mobile Menu */}
            <Sheet>

              <SheetTrigger asChild>

                <button className="lg:hidden">
                  <Menu size={21} strokeWidth={1.5} />
                </button>

              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[300px] bg-[#f7f4ef]"
              >

                <div className="mt-10 flex flex-col gap-6">

                  {navItems.map((item) => (

                    <button
                      key={item.title}
                      className="text-left text-[15px]"
                    >
                      {item.title}
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
            className="text-[56px] text-[#111] leading-none"
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
      <div className="hidden lg:block border-b border-[#ececec] bg-white">

        <div className="container-custom h-[62px] flex items-center justify-center gap-10">

          {navItems.map((item) => (

            <div
              key={item.title}
              className="relative h-full flex items-center"
              onMouseEnter={() =>
                setActiveMenu(item.title)
              }
              onMouseLeave={() =>
                setActiveMenu(null)
              }
            >

              {/* Nav Item */}
              <button
                className="
                  flex items-center
                  gap-1.5
                  text-[15px]
                  text-[#444]
                  hover:text-black
                  transition-all
                  duration-200
                "
              >

                {item.title}

                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                />

              </button>

              {/* Dropdown */}
{activeMenu === item.title && (

  <div className="absolute top-full left-1/2 -translate-x-1/2 z-50">

    <div
      className="
        w-[540px]
        bg-[#f8f8f8]
        border border-[#ececec]
        rounded-b-[5px]
        shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        px-8
        py-7
      "
    >

      {/* Grid Items */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-5">

        {item.items.map((subItem) => (

          <button
            key={subItem}
            className="
              text-left
              text-[15px]
              text-[#555]
              leading-none
              hover:text-black
              transition-all
              duration-200
            "
          >
            {subItem}
          </button>

        ))}

      </div>

    </div>

  </div>

)}

            </div>

          ))}

        </div>

      </div>

    </header>
  );
}