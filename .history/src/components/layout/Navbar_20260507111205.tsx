"use client";

import Link from "next/link";
import {
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

const navLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Shop",
    href: "/shop",
  },
  {
    name: "Categories",
    href: "/categories",
  },
  {
    name: "Customize",
    href: "/customize",
  },
  {
    name: "About",
    href: "/about",
  },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border)]">

      {/* Announcement Bar */}
      <div className="bg-black text-white text-center py-2 text-xs sm:text-sm tracking-wide">
        Free Shipping on Orders Above ₹999
      </div>

      {/* Navbar */}
      <div className="container-custom h-20 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-4">

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden">
                <Menu size={24} />
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px]">
              <div className="mt-10 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl md:text-3xl font-bold tracking-[4px]"
          >
            HASHTAG
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-gray-500 transition"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-5">

          <button>
            <Search size={22} />
          </button>

          <button>
            <User size={22} />
          </button>

          <button className="relative">
            <ShoppingBag size={22} />

            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
              0
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}