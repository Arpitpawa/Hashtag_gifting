"use client";

import { ChevronDown } from "lucide-react";

const categories = [
  "Birthday Gifts",
  "Anniversary Gifts",
  "Gifts by Relationship",
  "Gifts by Type",
  "Wedding Gifts",
  "Customize Gifts",
  "Bulk Orders",
];

export default function CategoryNavbar() {
  return (
    <div className="hidden lg:block bg-white border-b border-[#ddd8cf]">

      <div className="container-custom h-[58px] flex items-center justify-center gap-10 text-[15px] text-[#444]">

        {categories.map((item) => (

          <button
            key={item}
            className="flex items-center gap-1 hover:text-[#2f3e7a] transition"
          >
            {item}

            <ChevronDown
              size={15}
              strokeWidth={1.5}
            />

          </button>

        ))}

      </div>

    </div>
  );
}