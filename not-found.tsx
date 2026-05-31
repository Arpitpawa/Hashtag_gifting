import Link from "next/link";
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] md:text-[160px] font-bold text-[#e8e0d5] leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#e8e0d5]">
              <Search size={32} className="text-[#c0555a]" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="text-[26px] font-bold text-[#1a1a1a] mb-3">Page not found</h1>
        <p className="text-[15px] text-[#888] leading-relaxed mb-8">
          Looks like this gift went missing! The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-all">
            <Home size={16} /> Go home
          </Link>
          <Link href="/shop"
            className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold rounded-full hover:bg-[#1a1a1a] hover:text-white transition-all">
            <ShoppingBag size={16} /> Browse gifts
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-[#e8e0d5]">
          <p className="text-[12px] text-[#aaa] uppercase tracking-wider font-semibold mb-4">Popular categories</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Birthday gifts",    href: "/category/birthday-gifts"      },
              { label: "Anniversary gifts", href: "/category/anniversary-gifts"   },
              { label: "Gifts for him",     href: "/category/gifts-for-him"       },
              { label: "Gifts for her",     href: "/category/gifts-for-her"       },
              { label: "Photo mugs",        href: "/category/customized-mugs"     },
              { label: "LED lamps",         href: "/category/led-lamps"           },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-[12px] text-[#555] bg-white border border-[#e8e0d5] px-3 py-1.5 rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}