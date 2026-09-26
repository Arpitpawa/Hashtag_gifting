"use client";

import { useState } from "react";
import Link          from "next/link";
import { usePathname } from "next/navigation";
import { signOut }   from "next-auth/react";
import {
  LayoutDashboard, ShoppingBag, Package,
  Users, Tag, Star, LogOut, Menu, X,
  ChevronRight, Megaphone, TrendingUp,
  LayoutGrid, Boxes, Gem, FolderTree,
  MessageCircle,
} from "lucide-react";

const NAV = [
  { href: "/admin",             icon: <LayoutDashboard size={18} />, label: "Dashboard"  },
  { href: "/admin/analytics",   icon: <TrendingUp      size={18} />, label: "Analytics"  },
  { href: "/admin/orders",      icon: <ShoppingBag     size={18} />, label: "Orders"     },
  { href: "/admin/kanban",      icon: <LayoutGrid      size={18} />, label: "Kanban"     },
  { href: "/admin/products",    icon: <Package         size={18} />, label: "Products"   },
  { href: "/admin/categories",  icon: <FolderTree      size={18} />, label: "Categories" },
  { href: "/admin/charms",      icon: <Gem             size={18} />, label: "Charms"     },
  { href: "/admin/inventory",   icon: <Boxes           size={18} />, label: "Inventory"  },
  { href: "/admin/customers",   icon: <Users           size={18} />, label: "Customers"  },
  { href: "/admin/abandoned-carts", icon: <MessageCircle size={18} />, label: "Abandoned Carts" },
  { href: "/admin/coupons",     icon: <Tag             size={18} />, label: "Coupons"    },
  { href: "/admin/reviews",     icon: <Star            size={18} />, label: "Reviews"    },
];

export default function AdminSidebar() {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#e8e8e8]">
        <Link href="/admin" className="flex flex-col">
          <span className="text-[20px] font-bold text-[#1a1a1a] tracking-tight">Hashtag</span>
          <span className="text-[9px] font-bold tracking-[4px] text-[#c0555a] uppercase">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-[13px] font-medium transition-all ${
                active
                  ? "bg-[#c0555a] text-white shadow-sm"
                  : "text-[#555] hover:bg-[#f0f0f0] hover:text-[#1a1a1a]"
              }`}>
              {item.icon}
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#e8e8e8]">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#555] hover:bg-[#f0f0f0] mb-1">
          <Megaphone size={18} /> View store
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-[#e8e8e8]">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-[240px] bg-white border-r border-[#e8e8e8] z-40 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {content}
      </aside>
    </>
  );
}