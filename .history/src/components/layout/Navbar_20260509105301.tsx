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
  ArrowRight,
  Cake,
  Gem,
  Users,
  Gift,
  Flower2,
  Sparkles,
  CalendarHeart,
  Package,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    title: "Birthday Gifts",
    featured: "Top Picks for Birthdays",
    icon: Cake,
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
    featured: "Celebrate Love",
    icon: Gem,
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
    featured: "For Every Bond",
    icon: Users,
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
    featured: "Browse by Type",
    icon: Gift,
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
    featured: "For the Best Mom",
    icon: Flower2,
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
    featured: "Make it Yours",
    icon: Sparkles,
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
    featured: "Mark the Day",
    icon: CalendarHeart,
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
    featured: "Order in Bulk",
    icon: Package,
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-white relative z-50 shadow-sm">

      {/* MAIN NAVBAR */}
      <div className="border-b border-[#ececec]">
        <div className="container-custom h-[75px] flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-5">

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden p-1">
                  <Menu size={22} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-[#f7f4ef] p-0">
                <div className="p-6 border-b border-[#e5e5e5]">
                  <span
                    className="text-3xl text-[#111]"
                    style={{ fontFamily: "var(--font-great-vibes)" }}
                  >
                    hashtag
                  </span>
                </div>
                <div className="flex flex-col overflow-y-auto">
                  {navItems.map((item) => (
                    <div key={item.title} className="border-b border-[#ececec]">
                      <button className="w-full text-left px-6 py-4 text-[14px] text-[#333] flex items-center justify-between hover:bg-white transition-colors">
                        {item.title}
                        <ChevronDown size={14} strokeWidth={1.5} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <User size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* LOGO */}
          <Link
            href="/"
            className="text-[58px] text-[#111] leading-none tracking-wide"
            style={{ fontFamily: "var(--font-great-vibes)" }}
          >
            hashtag
          </Link>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex">
              <Heart size={20} strokeWidth={1.5} />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 bg-[#2f3e7a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                0
              </span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        {searchOpen && (
          <div className="border-t border-[#ececec] px-6 py-3 flex items-center gap-3 bg-[#fafafa]">
            <Search size={18} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search for gifts, occasions, or products..."
              className="w-full bg-transparent text-[15px] outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="text-sm text-gray-400 hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* CATEGORY NAVBAR */}
      <div className="hidden lg:block border-b border-[#ececec] bg-white">
        <div className="container-custom h-[52px] flex items-center justify-center gap-8">
          {navItems.map((item) => (
            <div
              key={item.title}
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu(item.title)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className={`flex items-center gap-1 text-[13px] font-medium tracking-wide transition-all duration-200 pb-0.5 border-b-2 ${
                  activeMenu === item.title
                    ? "text-black border-black"
                    : "text-[#555] border-transparent hover:text-black hover:border-gray-300"
                }`}
              >
                {item.title}
                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  className={`transition-transform duration-200 ${
                    activeMenu === item.title ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ENHANCED DROPDOWN */}
              {activeMenu === item.title && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 pt-0">
                  <div className="mt-0 bg-white border border-[#ececec] rounded-b-xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] overflow-hidden"
                    style={{ minWidth: item.items.length > 8 ? "520px" : "320px" }}
                  >
                    {/* FEATURED HEADER */}
                    <div className="bg-[#f7f4ef] px-6 py-3 border-b border-[#ececec] flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gray-700">
                        {item.featured}
                      </span>
                      <Link
                        href={`/category/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-[12px] text-[#2f3e7a] font-medium flex items-center gap-1 hover:underline"
                      >
                        View All <ArrowRight size={12} />
                      </Link>
                    </div>

                    {/* GRID ITEMS */}
                    <div
                      className={`p-5 grid gap-x-8 gap-y-1 ${
                        item.items.length > 8 ? "grid-cols-3" : "grid-cols-2"
                      }`}
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem}
                          href={`/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex items-center gap-2 text-[13.5px] text-[#555] py-2 px-2 rounded-lg hover:bg-[#f7f4ef] hover:text-black transition-all duration-150 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-black transition-colors flex-shrink-0" />
                          {subItem}
                        </Link>
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