"use client";

import { usePathname } from "next/navigation";
import { useSession }  from "next-auth/react";
import AdminNotifications from "./AdminNotifications";
import Image from "next/image";

const PAGE_TITLES: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/analytics":   "Analytics",
  "/admin/orders":      "Orders",
  "/admin/kanban":      "Kanban Board",
  "/admin/products":    "Products",
  "/admin/inventory":   "Inventory",
  "/admin/customers":   "Customers",
  "/admin/coupons":     "Coupons",
  "/admin/reviews":     "Reviews",
  "/admin/categories":  "Categories",
  "/admin/charms":      "Charms",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = PAGE_TITLES[pathname] || "Admin";

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-[#e8e8e8] px-4 sm:px-6 py-3.5 flex items-center justify-between min-h-[60px]">
      {/* Mobile: the fixed menu button owns the left edge, so the title is centred; desktop: left-aligned */}
      <h2 className="absolute left-1/2 -translate-x-1/2 max-w-[45%] truncate text-center text-[16px] font-bold text-[#1a1a1a] lg:static lg:translate-x-0 lg:max-w-none lg:text-left">{title}</h2>
      <span className="w-10 lg:hidden" aria-hidden />

      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <AdminNotifications />

        {/* Admin avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#e8e8e8]">
          <div className="w-8 h-8 rounded-full bg-[#c0555a] flex items-center justify-center text-white font-bold text-[13px] overflow-hidden">
            {session?.user?.image
              ? <Image src={session.user.image} alt="" width={32} height={32} className="object-cover" />
              : session?.user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-[12px] font-semibold text-[#1a1a1a] leading-tight">{session?.user?.name || "Admin"}</p>
            <p className="text-[10px] text-[#aaa]">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}