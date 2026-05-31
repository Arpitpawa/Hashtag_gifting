"use client";

import { usePathname } from "next/navigation";
import { useSession }  from "next-auth/react";
import AdminNotifications from "./AdminNotifications";
import Image from "next/image";

const PAGE_TITLES: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/orders":      "Orders",
  "/admin/products":    "Products",
  "/admin/customers":   "Customers",
  "/admin/coupons":     "Coupons",
  "/admin/reviews":     "Reviews",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = PAGE_TITLES[pathname] || "Admin";

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-[#e8e8e8] px-6 py-3.5 flex items-center justify-between">
      <h2 className="text-[16px] font-bold text-[#1a1a1a]">{title}</h2>

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