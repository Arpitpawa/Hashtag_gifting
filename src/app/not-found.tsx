import Link from "next/link";
import { Home, ShoppingBag, Search, Phone, ArrowRight } from "lucide-react";

export default function NotFound() {
  const QUICK_LINKS = [
    { label: "Birthday gifts",    href: "/category/birthday-gifts"    },
    { label: "Anniversary gifts", href: "/category/anniversary-gifts" },
    { label: "Gifts for her",     href: "/category/gifts-for-her"     },
    { label: "Gifts for him",     href: "/category/gifts-for-him"     },
    { label: "Corporate gifting", href: "/corporate"                  },
  ];

  return (
    <div className="min-h-screen bg-[#f3efe8] flex flex-col items-center justify-center px-4 py-16">

      {/* Big 404 */}
      <div className="text-center mb-10">
        <p
          className="text-[120px] md:text-[160px] font-normal text-[#e8e0d5] leading-none select-none"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          404
        </p>
        <div className="-mt-6 md:-mt-8">
          <h1
            className="text-[28px] md:text-[36px] font-normal text-[#1a1a1a] mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Page not found
          </h1>
          <p className="text-[15px] text-[#888] max-w-md mx-auto leading-relaxed">
            Looks like this page has been gifted away. Let's help you find
            something wonderful instead.
          </p>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#c0555a] text-white text-[14px] font-bold rounded-full hover:bg-[#a84449] transition-all"
        >
          <Home size={16} /> Back to home
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-[#1a1a1a] text-[#1a1a1a] text-[14px] font-bold rounded-full hover:bg-[#1a1a1a] hover:text-white transition-all"
        >
          <ShoppingBag size={16} /> Browse all gifts
        </Link>
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-[#e8e0d5] text-[#555] text-[14px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all"
        >
          <Search size={16} /> Search
        </Link>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-xl">
        <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-widest text-center mb-4">
          Popular categories
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between gap-2 px-4 py-3 bg-white rounded-xl border border-[#e8e0d5] text-[13px] text-[#555] font-medium hover:border-[#c0555a] hover:text-[#c0555a] transition-all group"
            >
              {label}
              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Help */}
      <p className="text-center text-[13px] text-[#aaa] mt-10">
        Need help?{" "}
        <a
          href="https://wa.me/917665909909"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#25D366] font-semibold hover:underline"
        >
          WhatsApp us
        </a>
        {" "}or{" "}
        <Link href="/contact" className="text-[#c0555a] font-semibold hover:underline">
          contact us
        </Link>
      </p>

    </div>
  );
}