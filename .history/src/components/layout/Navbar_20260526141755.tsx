"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown, Heart, Menu, Search, ShoppingBag, User,
  ArrowRight, Cake, Gem, Users, Gift, Flower2, Sparkles,
  CalendarHeart, Package, X, TrendingUp, Building2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartDrawer from "@/components/layout/CartDrawer";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { useCartStore } from "@/lib/store/cartStore";

type NavItem = {
  title: string;
  featured: string;
  icon: React.ElementType;
  items: string[];
};

const personalNavItems: NavItem[] = [
  {
    title: "Birthday gifts",
    featured: "Top picks for birthdays",
    icon: Cake,
    items: ["Birthday gifts for him", "Birthday gifts for her", "Birthday hampers", "Birthday frames", "Birthday mugs", "Birthday cards"],
  },
  {
    title: "Anniversary gifts",
    featured: "Celebrate love",
    icon: Gem,
    items: ["Anniversary gifts for wife", "Anniversary gifts for husband", "Couple frames", "Personalized lamps", "Customized cushions", "Anniversary hampers"],
  },
  {
    title: "Gifts by relationship",
    featured: "For every bond",
    icon: Users,
    items: ["Gifts for boyfriend", "Gifts for girlfriend", "Gifts for husband", "Gifts for wife", "Gifts for sister", "Gifts for brother", "Gifts for friends", "Gifts for couple", "Gifts for her", "Gifts for him", "Gifts for father", "Gifts for mother", "Gifts for fiance", "Gifts for kids", "Gifts for bridesmaids", "Gifts for newly married couple", "Gifts for mom to be", "Gifts for dad to be", "Gifts for parents to be", "Gifts for baby shower"],
  },
  {
    title: "Gifts by type",
    featured: "Browse by type",
    icon: Gift,
    items: ["Customized mugs", "Photo frames", "Name plates", "Explosion boxes", "Gift hampers", "Wallet cards", "LED lamps", "Cushions"],
  },
  {
    title: "Mother's day gifts",
    featured: "For the best mom",
    icon: Flower2,
    items: ["Photo frames", "Customized lamps", "Gift hampers", "Flowers & chocolates", "Memory scrapbooks", "Personalized cushions"],
  },
  {
    title: "Style your own gifts",
    featured: "Make it yours",
    icon: Sparkles,
    items: ["Upload your photo", "Custom text gifts", "Custom mugs", "Custom frames", "Custom LED lamps", "Custom hampers"],
  },
  {
    title: "Special days",
    featured: "Mark the day",
    icon: CalendarHeart,
    items: ["Valentine's day", "Mother's day", "Father's day", "Friendship day", "Women's day", "Raksha bandhan"],
  },
  {
    title: "Bulk gifting",
    featured: "Order in bulk",
    icon: Package,
    items: ["Corporate gifts", "Employee hampers", "Wedding bulk orders", "Event gifting", "Customized branding"],
  },
];

const corporateNavItems: NavItem[] = [
  {
    title: "Employee gifting",
    featured: "Appreciate your team",
    icon: Users,
    items: ["Onboarding kits", "Work anniversary gifts", "Festival hampers", "Employee milestone gifts", "Team celebration gifts", "Farewell gifts"],
  },
  {
    title: "Corporate hampers",
    featured: "Premium corporate gifts",
    icon: Gift,
    items: ["Diwali hampers", "New year hampers", "Thank you hampers", "Client appreciation gifts", "Premium gift boxes", "Branded hampers"],
  },
  {
    title: "Branded merchandise",
    featured: "Your brand, our craft",
    icon: Sparkles,
    items: ["Custom logo mugs", "Branded notebooks", "Custom t-shirts", "Branded bags", "Custom pens & stationery", "Branded tech accessories"],
  },
  {
    title: "Event gifting",
    featured: "Make events memorable",
    icon: CalendarHeart,
    items: ["Conference gifts", "Seminar kits", "Product launch gifts", "Award ceremony gifts", "Wedding corporate gifts", "Festival event gifts"],
  },
  {
    title: "Bulk orders",
    featured: "Order in volume",
    icon: Package,
    items: ["50+ pieces", "100+ pieces", "500+ pieces", "1000+ pieces", "Custom quotes", "Pan India delivery"],
  },
];

const allProducts = [
  { name: "Custom socks", image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=200", link: "/product/custom-socks", category: "Personalized" },
  { name: "CineMagic clap", image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=200", link: "/product/cinemagic-clap", category: "Personalized" },
  { name: "Travel memory box", image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=200", link: "/product/travel-memory-box", category: "Anniversary" },
  { name: "Wedding caricature", image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=200", link: "/product/wedding-caricature", category: "Personalized" },
  { name: "Metal wallet card", image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=200", link: "/product/metal-wallet-card", category: "Personalized" },
  { name: "Personalized mug", image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=200", link: "/product/personalized-mug", category: "Personalized" },
  { name: "LED name lamp", image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=200", link: "/product/led-lamp", category: "Personalized" },
  { name: "Anniversary frame", image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=200", link: "/product/anniversary-frame", category: "Anniversary" },
];

const trendingSearches = ["Custom socks", "Birthday hamper", "Personalized mug", "Wedding gift", "Anniversary frame", "LED lamp"];
const placeholders = ["Search for birthday gifts...", "Search for anniversary gifts...", "Search for personalized gifts...", "Search for couple gifts...", "Search for custom mugs..."];

export default function Navbar() {
  const pathname = usePathname();
  const isCorporate = pathname?.startsWith("/corporate");

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;
  const navItems = isCorporate ? corporateNavItems : personalNavItems;

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { itemCount, fetchCart } = useCartStore();

  // Fetch cart on mount
  useEffect(() => { fetchCart(); }, []);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen || searchQuery) return;
    const current = placeholders[placeholderIndex];
    let timeout: NodeJS.Timeout;
    if (!isDeleting && displayedPlaceholder.length < current.length) {
      timeout = setTimeout(() => setDisplayedPlaceholder(current.slice(0, displayedPlaceholder.length + 1)), 60);
    } else if (!isDeleting && displayedPlaceholder.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayedPlaceholder.length > 0) {
      timeout = setTimeout(() => setDisplayedPlaceholder(current.slice(0, displayedPlaceholder.length - 1)), 30);
    } else if (isDeleting && displayedPlaceholder.length === 0) {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }
    return () => clearTimeout(timeout);
  }, [searchOpen, searchQuery, displayedPlaceholder, isDeleting, placeholderIndex]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchQuery("");
      setDisplayedPlaceholder("");
      setPlaceholderIndex(0);
      setIsDeleting(false);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filteredProducts = searchQuery.length > 0
    ? allProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const suggestions = searchQuery.length > 0
    ? allProducts.filter((p) => p.name.toLowerCase().startsWith(searchQuery.toLowerCase())).map((p) => p.name).slice(0, 4) : [];

  return (
    <>
      <header className="bg-white relative z-50">

        {/* ── MAIN NAVBAR ROW ── */}
        <div className="border-b border-[#ececec]">
          <div className="container-custom h-[75px] flex items-center justify-between">

            {/* ── LEFT — search + user + switcher pills ── */}
            <div className="flex items-center gap-3">

              {/* Mobile hamburger */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-1">
                    <Menu size={22} strokeWidth={1.5} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-[#f7f4ef] p-0">
                  <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                  <div className="p-5 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-1">
                      <span className="text-[22px] font-bold tracking-tight text-[#111]">hashtag</span>
                      <span className="text-[10px] font-semibold tracking-[3px] text-[#c0555a] uppercase mt-1">gifting</span>
                    </div>
                  </div>
                  {/* Mobile switcher */}
                  <div className="flex gap-2 px-4 py-3 border-b border-[#ececec]">
                    <Link href="/" className={`flex-1 text-center py-2 rounded-full text-[11px] font-semibold border-2 transition-all ${!isCorporate ? "bg-[#c0555a] text-white border-[#c0555a]" : "bg-white text-[#c0555a] border-[#c0555a]"}`}>
                      Personal gifts
                    </Link>
                    <Link href="/corporate" className={`flex-1 text-center py-2 rounded-full text-[11px] font-semibold border-2 transition-all ${isCorporate ? "bg-[#c0555a] text-white border-[#c0555a]" : "bg-white text-[#c0555a] border-[#c0555a]"}`}>
                      Corporate
                    </Link>
                  </div>
                  <div className="flex flex-col overflow-y-auto">
                    {navItems.map((item) => (
                      <div key={item.title} className="border-b border-[#ececec]">
                        <button className="w-full text-left px-6 py-4 text-[13px] text-[#333] flex items-center justify-between hover:bg-white transition-colors">
                          <span className="flex items-center gap-2">
                            <item.icon size={14} strokeWidth={1.8} className="text-[#c0555a]" />
                            {item.title}
                          </span>
                          <ChevronDown size={13} strokeWidth={1.5} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop — search + user FIRST */}
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Search size={19} strokeWidth={1.5} />
                </button>
              </div>

              {/* Desktop — switcher pills AFTER icons */}
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all duration-300 ${
                    !isCorporate
                      ? "bg-[#c0555a] text-white border-[#c0555a]"
                      : "bg-white text-[#c0555a] border-[#c0555a] hover:bg-[#c0555a] hover:text-white"
                  }`}
                >
                  <Gift size={12} strokeWidth={2} />
                  Personal gifts
                </Link>
                <Link
                  href="/corporate"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all duration-300 ${
                    isCorporate
                      ? "bg-[#c0555a] text-white border-[#c0555a]"
                      : "bg-white text-[#c0555a] border-[#c0555a] hover:bg-[#c0555a] hover:text-white"
                  }`}
                >
                  <Building2 size={12} strokeWidth={2} />
                  Corporate gifting
                </Link>
              </div>
            </div>

            {/* ── CENTER — LOGO ── */}
            <Link href="/" className="flex flex-col items-center leading-none select-none absolute left-1/2 -translate-x-1/2">
              <span className="text-[32px] md:text-[38px] font-bold tracking-[-1.5px] text-[#111]">
                Hashtag
              </span>
              <span className="text-[9px] font-semibold tracking-[5px] text-[#c0555a] uppercase -mt-1">
                gifting
              </span>
            </Link>

            {/* ── RIGHT — profile dropdown + wishlist + cart ── */}
            <div className="flex items-center gap-2 justify-end">
              <ProfileDropdown />
              <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex">
                <Heart size={19} strokeWidth={1.5} />
              </Link>
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setCartOpen(true)}>
                <ShoppingBag size={19} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c0555a] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
              {isCorporate && (
                <Link
                  href="/corporate#inquiry"
                  className="hidden md:flex items-center gap-1.5 ml-1 px-4 py-2 bg-[#c0555a] text-white text-[11px] font-semibold rounded-full hover:bg-[#a84449] transition-colors whitespace-nowrap"
                >
                  <Building2 size={12} />
                  Get a quote
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── CATEGORY NAV ROW ── */}
        <div className="hidden lg:block border-b border-[#ececec] bg-white">
          <div className="container-custom h-[46px] flex items-center justify-center gap-7">
            {navItems.map((item) => (
              <div
                key={item.title}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu(item.title)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`flex items-center gap-1 text-[11px] font-medium tracking-wide transition-all duration-200 pb-0.5 border-b-2 whitespace-nowrap ${
                  activeMenu === item.title
                    ? "text-black border-black"
                    : "text-[#555] border-transparent hover:text-black hover:border-gray-300"
                }`}>
                  {item.title}
                  <ChevronDown size={11} strokeWidth={2} className={`transition-transform duration-200 ${activeMenu === item.title ? "rotate-180" : ""}`} />
                </button>

                {activeMenu === item.title && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 z-50">
                    <div
                      className="bg-white border-x border-b border-[#ececec] shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                      style={{ minWidth: item.items.length > 8 ? "640px" : "380px" }}
                    >
                      <div className="bg-[#f7f4ef] px-8 py-3.5 border-b border-[#ececec] flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#c0555a] tracking-[1px] flex items-center gap-2">
                          <item.icon size={13} strokeWidth={2} className="text-[#c0555a]" />
                          {item.featured}
                        </span>
                        <Link
                          href={`/category/${item.title.toLowerCase().replace(/[''']/g, '').replace(/\s+/g, '-')}`}
                          className="text-[11px] text-[#c0555a] font-medium flex items-center gap-1 hover:underline"
                        >
                          View all <ArrowRight size={10} />
                        </Link>
                      </div>
                      <div className={`px-8 py-5 grid gap-x-12 gap-y-0 ${item.items.length > 8 ? "grid-cols-3" : "grid-cols-2"}`}>
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem}
                            href={`/category/${subItem.toLowerCase().replace(/[''']/g, '').replace(/&/g, 'and').replace(/\s+/g, '-')}`}
                            className="text-[13px] font-light text-[#3d3d3d] py-2.5 border-b border-[#f0f0f0] last:border-0 hover:text-[#c0555a] transition-colors duration-150"
                          >
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

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative z-10 bg-white shadow-2xl">
            <div className="container-custom py-4 flex items-center gap-4">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={displayedPlaceholder}
                className="flex-1 text-[15px] outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black transition-colors">
                  <X size={17} />
                </button>
              )}
              <button onClick={() => setSearchOpen(false)} className="text-[13px] text-gray-500 hover:text-black transition-colors font-medium ml-2">
                Cancel
              </button>
            </div>
            <div className="border-t border-[#ececec]" />
            <div className="container-custom py-6">
              {!searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                      <TrendingUp size={13} /> Trending searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <button key={term} onClick={() => setSearchQuery(term)} className="px-4 py-1.5 rounded-full border border-gray-200 text-[12px] text-gray-600 hover:border-[#c0555a] hover:text-[#c0555a] transition-all duration-200">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4">Popular products</h3>
                    <div className="flex flex-col gap-3">
                      {allProducts.slice(0, 4).map((product) => (
                        <Link key={product.name} href={product.link} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 group">
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[13px] text-gray-700 group-hover:text-black font-medium transition-colors">{product.name}</p>
                            <p className="text-[11px] text-gray-400">{product.category}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4">Suggestions</h3>
                    {suggestions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {suggestions.map((s) => (
                          <button key={s} onClick={() => setSearchQuery(s)} className="text-left flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#f7f4ef] transition-colors group">
                            <Search size={13} className="text-gray-300 group-hover:text-gray-500" />
                            <span className="text-[13px] text-gray-700">
                              <span className="font-semibold">{s.slice(0, searchQuery.length)}</span>
                              {s.slice(searchQuery.length)}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : <p className="text-[13px] text-gray-400">No suggestions found</p>}
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4">Products</h3>
                    {filteredProducts.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {filteredProducts.slice(0, 4).map((product) => (
                          <Link key={product.name} href={product.link} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 group">
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-[13px] text-gray-700 group-hover:text-black font-medium transition-colors">{product.name}</p>
                              <p className="text-[11px] text-gray-400">{product.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : <p className="text-[13px] text-gray-400">No products found for "{searchQuery}"</p>}
                  </div>
                </div>
              )}
              {searchQuery && (
                <div className="mt-6 pt-4 border-t border-[#ececec]">
                  <Link href={`/search?q=${searchQuery}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-2 text-[13px] text-gray-600 hover:text-black font-medium transition-colors">
                    <ArrowRight size={15} /> Show all results for "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}