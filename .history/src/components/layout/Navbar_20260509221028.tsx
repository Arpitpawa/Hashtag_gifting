"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  ArrowRight,
  Cake,
  Gem,
  Users,
  Gift,
  Flower2,
  Sparkles,
  CalendarHeart,
  Package,
  X,
  TrendingUp,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = {
  title: string;
  featured: string;
  icon: React.ElementType;
  items: string[];
};

const navItems: NavItem[] = [
  {
    title: "Birthday Gifts",
    featured: "Top Picks for Birthdays",
    icon: Cake,
    items: [
      "Birthday Gifts for Him",
      "Birthday Gifts for Her",
      "Birthday Hampers",
      "Birthday Frames",
      "Birthday Mugs",
      "Birthday Cards",
    ],
  },
  {
    title: "Anniversary Gifts",
    featured: "Celebrate Love",
    icon: Gem,
    items: [
      "Anniversary Gifts for Wife",
      "Anniversary Gifts for Husband",
      "Couple Frames",
      "Personalized Lamps",
      "Customized Cushions",
      "Anniversary Hampers",
    ],
  },
  {
    title: "Gifts by Relationship",
    featured: "For Every Bond",
    icon: Users,
    items: [
      "Gifts for Boyfriend",
      "Gifts for Girlfriend",
      "Gifts for Husband",
      "Gifts for Wife",
      "Gifts for Sister",
      "Gifts for Brother",
      "Gifts for Friends",
      "Gifts for Couple",
      "Gifts for Her",
      "Gifts for Him",
      "Gifts for Father",
      "Gifts for Mother",
      "Gifts for Fiance",
      "Gifts for Kids",
      "Gifts for Bridesmaids",
      "Gifts for Newly Married Couple",
      "Gifts for Mom To Be",
      "Gifts for Dad To Be",
      "Gifts for Parents To Be",
      "Gifts for Baby Shower",
    ],
  },
  {
    title: "Gifts by Type",
    featured: "Browse by Type",
    icon: Gift,
    items: [
      "Customized Mugs",
      "Photo Frames",
      "Name Plates",
      "Explosion Boxes",
      "Gift Hampers",
      "Wallet Cards",
      "LED Lamps",
      "Cushions",
    ],
  },
  {
    title: "Mother's Day Gifts",
    featured: "For the Best Mom",
    icon: Flower2,
    items: [
      "Photo Frames",
      "Customized Lamps",
      "Gift Hampers",
      "Flowers & Chocolates",
      "Memory Scrapbooks",
      "Personalized Cushions",
    ],
  },
  {
    title: "Style Your Own Gifts",
    featured: "Make it Yours",
    icon: Sparkles,
    items: [
      "Upload Your Photo",
      "Custom Text Gifts",
      "Custom Mugs",
      "Custom Frames",
      "Custom LED Lamps",
      "Custom Hampers",
    ],
  },
  {
    title: "Special Days",
    featured: "Mark the Day",
    icon: CalendarHeart,
    items: [
      "Valentine's Day",
      "Mother's Day",
      "Father's Day",
      "Friendship Day",
      "Women's Day",
      "Raksha Bandhan",
    ],
  },
  {
    title: "Bulk Gifting",
    featured: "Order in Bulk",
    icon: Package,
    items: [
      "Corporate Gifts",
      "Employee Hampers",
      "Wedding Bulk Orders",
      "Event Gifting",
      "Customized Branding",
    ],
  },
];

const allProducts = [
  { name: "Custom Socks", image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=200", link: "/product/custom-socks", category: "Personalized" },
  { name: "CineMagic Clap", image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=200", link: "/product/cinemagic-clap", category: "Personalized" },
  { name: "Travel Memory Box", image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=200", link: "/product/travel-memory-box", category: "Anniversary" },
  { name: "Wedding Caricature", image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=200", link: "/product/wedding-caricature", category: "Personalized" },
  { name: "Metal Wallet Card", image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=200", link: "/product/metal-wallet-card", category: "Personalized" },
  { name: "Custom Caricature Cake", image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=200", link: "/product/custom-cake", category: "Cakes & Bouquet" },
  { name: "Flower Bouquet", image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=200", link: "/product/flower-bouquet", category: "Cakes & Bouquet" },
  { name: "Birthday Gift Hamper", image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=200", link: "/product/birthday-hamper", category: "Birthday" },
  { name: "Personalized Mug", image: "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=200", link: "/product/personalized-mug", category: "Personalized" },
  { name: "LED Name Lamp", image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=200", link: "/product/led-lamp", category: "Personalized" },
  { name: "Explosion Box", image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=200", link: "/product/explosion-box", category: "Birthday" },
  { name: "Anniversary Frame", image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=200", link: "/product/anniversary-frame", category: "Anniversary" },
];

const trendingSearches = [
  "Custom Socks",
  "Birthday Hamper",
  "Personalized Mug",
  "Wedding Gift",
  "Anniversary Frame",
  "LED Lamp",
];

const placeholders = [
  "Search for birthday gifts...",
  "Search for anniversary gifts...",
  "Search for personalized gifts...",
  "Search for couple gifts...",
  "Search for custom mugs...",
];

const promptFont = { fontFamily: "var(--font-prompt)" };

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen || searchQuery) return;
    const current = placeholders[placeholderIndex];
    let timeout: NodeJS.Timeout;
    if (!isDeleting && displayedPlaceholder.length < current.length) {
      timeout = setTimeout(() => {
        setDisplayedPlaceholder(current.slice(0, displayedPlaceholder.length + 1));
      }, 60);
    } else if (!isDeleting && displayedPlaceholder.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayedPlaceholder.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedPlaceholder(current.slice(0, displayedPlaceholder.length - 1));
      }, 30);
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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filteredProducts = searchQuery.length > 0
    ? allProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const suggestions = searchQuery.length > 0
    ? allProducts
        .filter((p) => p.name.toLowerCase().startsWith(searchQuery.toLowerCase()))
        .map((p) => p.name)
        .slice(0, 4)
    : [];

  return (
    <>
      <header className="bg-white relative z-50">

        {/* ── ROW 1: MAIN NAVBAR ── */}
        <div className="border-b border-[#ececec]">
          <div className="container-custom h-[75px] flex items-center justify-between">

            {/* LEFT — icons */}
            <div className="flex items-center gap-4 w-[120px]">

              {/* Mobile hamburger */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-1">
                    <Menu size={22} strokeWidth={1.5} />
                  </button>
                </SheetTrigger>
               <SheetContent side="left" className="w-[300px] bg-[#f7f4ef] p-0">
  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
  <div className="p-6 border-b border-[#e5e5e5]">
                    <span
                      className="text-3xl text-[#111]"
                      style={{ fontFamily: "var(--font-great-vibes)" }}
                    >
                      Hashtag Gifting 
                    </span>
                  </div>
                  <div className="flex flex-col overflow-y-auto">
                    {navItems.map((item) => (
                      <div key={item.title} className="border-b border-[#ececec]">
                        <button
                          className="w-full text-left px-6 py-4 text-[14px] text-[#333] flex items-center justify-between hover:bg-white transition-colors"
                          style={promptFont}
                        >
                          <span className="flex items-center gap-2">
                            <item.icon size={15} strokeWidth={1.8} className="text-[#2f3e7a]" />
                            {item.title}
                          </span>
                          <ChevronDown size={14} strokeWidth={1.5} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop search + user */}
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Search size={20} strokeWidth={1.5} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <User size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* CENTER — Logo */}
            <Link
              href="/"
              className="text-[58px] text-[#111] leading-none"
              style={{ fontFamily: "var(--font-great-vibes)" }}
            >
              hashtag
            </Link>

            {/* RIGHT — wishlist + cart */}
            <div className="flex items-center gap-3 w-[120px] justify-end">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:flex">
                <Heart size={20} strokeWidth={1.5} />
              </button>
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 bg-[#2f3e7a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── ROW 2: CATEGORY NAV ── */}
        <div className="hidden lg:block border-b border-[#ececec] bg-white">
          <div className="container-custom h-[50px] flex items-center justify-center gap-6">
            {navItems.map((item) => (
              <div
                key={item.title}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu(item.title)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  style={promptFont}
                  className={`flex items-center gap-1 text-[11.5px] font-medium tracking-wider uppercase transition-all duration-200 pb-0.5 border-b-2 whitespace-nowrap ${
                    activeMenu === item.title
                      ? "text-black border-black"
                      : "text-[#555] border-transparent hover:text-black hover:border-gray-300"
                  }`}
                >
                  {item.title}
                  <ChevronDown
                    size={12}
                    strokeWidth={2}
                    className={`transition-transform duration-200 ${
                      activeMenu === item.title ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}
                {activeMenu === item.title && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 z-50">
                    <div
                      className="bg-white border-x border-b border-[#ececec] shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                      style={{ minWidth: item.items.length > 8 ? "640px" : "380px" }}
                    >
                      {/* HEADER */}
                      <div className="bg-[#f7f4ef] px-8 py-4 border-b border-[#ececec] flex items-center justify-between">
                        <span
                          className="text-[11px] font-semibold text-[#2f3e7a] uppercase tracking-[3px] flex items-center gap-2"
                          style={promptFont}
                        >
                          <item.icon size={14} strokeWidth={2} className="text-[#2f3e7a]" />
                          {item.featured}
                        </span>
                        <Link
                          href={`/category/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                          className="text-[11px] text-[#2f3e7a] font-medium flex items-center gap-1 hover:underline tracking-wide uppercase"
                          style={promptFont}
                        >
                          View All <ArrowRight size={11} />
                        </Link>
                      </div>

                      {/* ITEMS */}
                      <div
                        className={`px-8 py-6 grid gap-x-12 gap-y-0 ${
                          item.items.length > 8 ? "grid-cols-3" : "grid-cols-2"
                        }`}
                      >
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem}
                            href={`/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`}
                            style={promptFont}
                            className="text-[14px] font-light text-[#3d3d3d] py-2.5 border-b border-[#f0f0f0] last:border-0 hover:text-[#2f3e7a] transition-colors duration-150 tracking-wide"
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
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />

          <div className="relative z-10 bg-white shadow-2xl">
            <div className="container-custom py-4 flex items-center gap-4">
              <Search size={22} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={displayedPlaceholder}
                style={promptFont}
                className="flex-1 text-[16px] outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black transition-colors">
                  <X size={18} />
                </button>
              )}
              <button
                onClick={() => setSearchOpen(false)}
                style={promptFont}
                className="text-[14px] text-gray-500 hover:text-black transition-colors font-medium ml-2"
              >
                Cancel
              </button>
            </div>

            <div className="border-t border-[#ececec]" />

            <div className="container-custom py-6">

              {/* DEFAULT — no query */}
              {!searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4 flex items-center gap-2" style={promptFont}>
                      <TrendingUp size={14} />
                      Trending Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          style={promptFont}
                          className="px-4 py-2 rounded-full border border-gray-200 text-[13px] text-gray-600 hover:border-black hover:text-black transition-all duration-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4" style={promptFont}>
                      Popular Products
                    </h3>
                    <div className="flex flex-col gap-3">
                      {allProducts.slice(0, 4).map((product) => (
                        <Link
                          key={product.name}
                          href={product.link}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[14px] text-gray-700 group-hover:text-black font-medium transition-colors" style={promptFont}>{product.name}</p>
                            <p className="text-[12px] text-gray-400" style={promptFont}>{product.category}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RESULTS — has query */}
              {searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4" style={promptFont}>
                      Suggestions
                    </h3>
                    {suggestions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSearchQuery(s)}
                            className="text-left flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#f7f4ef] transition-colors group"
                          >
                            <Search size={14} className="text-gray-300 group-hover:text-gray-500" />
                            <span className="text-[14px] text-gray-700" style={promptFont}>
                              <span className="font-semibold">{s.slice(0, searchQuery.length)}</span>
                              {s.slice(searchQuery.length)}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-gray-400" style={promptFont}>No suggestions found</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-4" style={promptFont}>
                      Products
                    </h3>
                    {filteredProducts.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {filteredProducts.slice(0, 4).map((product) => (
                          <Link
                            key={product.name}
                            href={product.link}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-[14px] text-gray-700 group-hover:text-black font-medium transition-colors" style={promptFont}>{product.name}</p>
                              <p className="text-[12px] text-gray-400" style={promptFont}>{product.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-gray-400" style={promptFont}>No products found for "{searchQuery}"</p>
                    )}
                  </div>
                </div>
              )}

              {/* SHOW ALL */}
              {searchQuery && (
                <div className="mt-6 pt-4 border-t border-[#ececec]">
                  <Link
                    href={`/search?q=${searchQuery}`}
                    onClick={() => setSearchOpen(false)}
                    style={promptFont}
                    className="flex items-center gap-2 text-[14px] text-gray-600 hover:text-black font-medium transition-colors"
                  >
                    <ArrowRight size={16} />
                    Show all results for "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}