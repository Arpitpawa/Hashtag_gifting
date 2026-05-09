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
      "Gifts for Mother",
      "Gifts for Father",
      "Gifts for Kids",
      "Gifts for Parents",
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
    ],
  },

  {
    title: "Wedding Gifts",
    items: [
      "Wedding Hampers",
      "Bride To Be Gifts",
      "Groom Gifts",
      "Wedding Frames",
      "Couple Gifts",
    ],
  },

  {
    title: "Customize Gifts",
    items: [
      "Upload Your Photo",
      "Custom Text Gifts",
      "Custom Mugs",
      "Custom Frames",
      "Custom LED Lamps",
    ],
  },

  {
    title: "Bulk Orders",
    items: [
      "Corporate Gifts",
      "Employee Hampers",
      "Wedding Bulk Orders",
      "Event Gifting",
    ],
  },
];

export default function Navbar() {
  const [activeMenu, setActiveMenu] =
    useState<string | null>(null);

  return (
    <header className="bg-white relative z-50">

      {/* Main Navbar */}
      <div className="border-b border-[#ddd8cf]">

        <div className="container-custom h-[72px] flex items-center justify-between">

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
      <div className="hidden lg:block border-b border-[#ddd8cf] bg-white relative">

        <div className="container-custom h-[56px] flex items-center justify-center gap-12">

          {navItems.map((item) => (

            <div
              key={item.title}
              className="h-full flex items-center"
              onMouseEnter={() =>
                setActiveMenu(item.title)
              }
              onMouseLeave={() =>
                setActiveMenu(null)
              }
            >

              {/* Nav Item */}
              <button className="flex items-center gap-1 text-[15px] text-[#444] hover:text-[#2f3e7a] transition">

                {item.title}

                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                />

              </button>

              {/* Mega Menu */}
              {activeMenu === item.title && (

                <div className="absolute left-0 top-full w-full bg-white border-t border-[#ddd8cf] shadow-sm">

                  <div className="container-custom py-10">

                    <div className="grid grid-cols-4 gap-8">

                      {item.items.map((subItem) => (

                        <button
                          key={subItem}
                          className="text-left text-[15px] text-[#555] hover:text-[#2f3e7a] transition"
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