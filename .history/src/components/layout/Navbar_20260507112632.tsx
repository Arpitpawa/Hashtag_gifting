"use client";

import Link from "next/link";
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  "PLANNERS & JOURNALS",
  "STATIONERY",
  "NOTEBOOKS",
  "GIFTING",
  "BULK ORDER",
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]">

      {/* Announcement Bar */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] overflow-hidden">

        <div className="whitespace-nowrap flex items-center gap-10 py-2 text-[13px] text-[var(--primary)] animate-marquee">

          <span>✦ Easy Returns & Refunds</span>
          <span>✦ Designed For Every Mood</span>
          <span>✦ Made with Love</span>
          <span>✦ Ready to Gift</span>
          <span>✦ Explore Your Next Page Today</span>
          <span>✦ Easy Returns & Refunds</span>
          <span>✦ Designed For Every Mood</span>

        </div>
      </div>

      {/* Top Navbar */}
      <div className="border-b border-[var(--border)]">

        <div className="container-custom h-[85px] flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-5">

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden">
                  <Menu size={22} />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px]">

                <div className="flex flex-col gap-6 mt-10">
                  {navLinks.map((link) => (
                    <button
                      key={link}
                      className="text-left text-sm tracking-wide"
                    >
                      {link}
                    </button>
                  ))}
                </div>

              </SheetContent>
            </Sheet>

            <button>
              <Search strokeWidth={1.5} size={22} />
            </button>

            <button className="hidden sm:block">
              <User strokeWidth={1.5} size={22} />
            </button>

          </div>

          {/* Logo */}
          <Link
            href="/"
            className="text-4xl md:text-5xl font-light tracking-wide"
            style={{
              fontFamily: "cursive",
            }}
          >
            hashtag
          </Link>

          {/* Right */}
          <div className="flex items-center gap-5">

            <button>
              <Heart strokeWidth={1.5} size={22} />
            </button>

            <button className="relative">

              <ShoppingCart
                strokeWidth={1.5}
                size={22}
              />

              <span className="absolute -top-2 -right-2 text-[10px] bg-[var(--primary)] text-white w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>

            </button>

          </div>

        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden lg:block border-b border-[var(--border)] bg-white">

        <div className="container-custom h-[58px] flex items-center justify-center gap-16 text-[15px] tracking-wide">

          {navLinks.map((link) => (
            <button
              key={link}
              className="hover:text-[var(--primary)] transition"
            >
              {link}
            </button>
          ))}

        </div>

      </div>
    </header>
  );
}