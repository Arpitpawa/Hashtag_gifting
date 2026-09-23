"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User, ShoppingBag, Heart, MapPin, CreditCard,
  Tag, Phone, LogOut, ChevronRight, LogIn,
} from "lucide-react";

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const MENU_ITEMS = [
    { icon: <ShoppingBag size={15} />, label: "My orders",       href: "/account?tab=orders"    },
    { icon: <Heart       size={15} />, label: "My wishlist",     href: "/wishlist"               },
    { icon: <MapPin      size={15} />, label: "Saved addresses", href: "/account?tab=addresses" },
    { icon: <CreditCard  size={15} />, label: "Saved cards",     href: "/account?tab=cards"     },
    { icon: <Tag         size={15} />, label: "My coupons",      href: "/account?tab=coupons"   },
    { icon: <Phone       size={15} />, label: "Contact us",      href: "/contact"               },
  ];

  return (
    // Used to be `hidden md:block` — below 768px there was no account/login
    // entry point anywhere in the navbar (the mobile hamburger Sheet doesn't
    // have one either), so phone visitors had no way to log in short of
    // typing /login directly. Now visible at every screen size.
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="p-2.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
      >
        <User size={19} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 top-10 w-[240px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-[#e8e0d5] z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#f0f0f0]">
            {session ? (
              <div>
                <p className="text-[13px] text-[#888]">Welcome back,</p>
                <p className="text-[15px] font-bold text-[#1a1a1a] truncate">{session.user?.name || "User"}</p>
                <p className="text-[11px] text-[#aaa] truncate mt-0.5">{session.user?.email}</p>
              </div>
            ) : (
              <div>
                <p className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">Welcome</p>
                <p className="text-[12px] text-[#888] mb-3">To access account & manage orders</p>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#c0555a] text-[#c0555a] text-[13px] font-bold rounded-full hover:bg-[#c0555a] hover:text-white transition-all">
                  <LogIn size={14} /> Login / Signup
                </Link>
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className="py-2">
            {MENU_ITEMS.map((item, i) => (
              <Link key={i} href={item.href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#f8f5f0] transition-colors group">
                <span className="text-[#c0555a]">{item.icon}</span>
                <span className="text-[13px] font-medium text-[#333] flex-1">{item.label}</span>
                <ChevronRight size={13} className="text-[#ccc] group-hover:text-[#c0555a] transition-colors" />
              </Link>
            ))}
          </div>

          {/* Sign out */}
          {session && (
            <div className="border-t border-[#f0f0f0] py-2">
              <button onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors w-full group">
                <LogOut size={15} className="text-red-400" />
                <span className="text-[13px] font-medium text-red-400">Sign out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}