"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown, Heart, Menu, Search, ShoppingBag, User,
  ArrowRight, Cake, Gem, Users, Gift, Flower2, Sparkles,
  CalendarHeart, Package, X, TrendingUp, Building2, Zap,
  Loader2, FolderOpen,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartDrawer from "@/components/layout/CartDrawer";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { useCartStore } from "@/lib/store/cartStore";
import { HAMPER_ENABLED } from "@/lib/features";

type SubItem = string | { name: string; slug: string };

type NavItem = {
  title: string;
  slug?: string;      // real DB slug, when known — overrides the guessed toSlug(title)
  featured: string;
  icon: React.ElementType;
  items: SubItem[];
};

function subLabel(s: SubItem): string {
  return typeof s === "string" ? s : s.name;
}
function subHref(s: SubItem): string {
  return typeof s === "string" ? `/category/${toSlug(s)}` : `/category/${s.slug}`;
}
function itemHref(item: NavItem): string {
  return `/category/${item.slug ?? toSlug(item.title)}`;
}

// Shared by the server-provided initial categories (see layout.tsx) and the
// client-side refresh fetch below — same /api/categories response shape
// either way, so both go through this one mapper.
function mapCategoriesToNavItems(cats: any[]): NavItem[] {
  if (!Array.isArray(cats)) return [];
  return cats.map((c) => ({
    title:    c.name,
    slug:     c.slug,
    featured: c._count?.products ? `${c._count.products} products` : "Shop the range",
    icon:     FolderOpen,
    items:    (c.children || []).map((ch: any) => ({ name: ch.name, slug: ch.slug })),
  }));
}

// One consistent slug function, used everywhere a category link is built —
// the old version re-derived slugs inline in 2 different spots with 2
// different (incomplete) rules, which is exactly why links didn't reliably
// match real category URLs. This mirrors the same {lower, strict}-style
// logic your admin's category creation uses server-side (via the `slugify`
// package), so as long as a name here matches a real category name, the
// generated link will match its real slug.
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")        // Mother's → Mothers (not Mother-s)
    .replace(/&/g, "and")        // Flowers & chocolates → Flowers and chocolates
    .replace(/[^a-z0-9]+/g, "-") // everything else non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "");    // trim leading/trailing hyphens

}

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

const trendingSearches = ["Wallet", "Passport cover", "Diary", "Pen", "Clutch", "Gift combo"];
const placeholders = ["Search for birthday gifts...", "Search for anniversary gifts...", "Search for personalized gifts...", "Search for wallets...", "Search for passport covers..."];

export default function Navbar({ initialCategories = [] }: { initialCategories?: any[] }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const isCorporate = pathname?.startsWith("/corporate");

  if (pathname?.startsWith("/admin")) return null;

  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeMenu, setActiveMenu]   = useState<string | null>(null);
  // Seeded from the server-rendered initial data (see layout.tsx) so the
  // category row is populated on first paint — no empty flash while the
  // client fetch below is still in flight.
  const [dbCategoryItems, setDbCategoryItems] = useState<NavItem[]>(
    () => mapCategoriesToNavItems(initialCategories)
  );
  // Category row used to always show 7 items once a screen hit Tailwind's
  // `lg:` (>=1024px) breakpoint — but an iPad Pro in portrait is exactly
  // 1024px wide, and 7 real (not guessed) category names can run wider than
  // that before the layout has any wrap/scroll fallback. Only bump to the
  // full count once the screen is genuinely wide (xl, >=1280px); the
  // `overflow-x-auto` safety net added below the nav row still catches
  // anything that doesn't fit.
  const [isWideDesktop, setIsWideDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsWideDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Closes an open category/"More" dropdown on outside click/tap — needed
  // now that dropdowns also open via onClick (for touch devices, which
  // don't reliably fire hover), not just onMouseEnter/onMouseLeave.
  const categoryNavRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryNavRef.current && !categoryNavRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ products: any[]; categories: any[] }>({ products: [], categories: [] });
  const [searching, setSearching]     = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting]   = useState(false);
  const [cartOpen, setCartOpen]       = useState(false);

  const { itemCount, fetchCart } = useCartStore();
  useEffect(() => { fetchCart(); }, []);

  // ── Real categories from the admin panel — pulled in alongside the curated
  // marketing dropdowns above, so anything an admin creates shows up here too.
  // Initial render already has server-provided data (see useState above), so
  // this is just a background refresh — keeps categories current if an admin
  // edit happens while someone's had the tab open a while, without needing a
  // page reload. ──
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: any[]) => {
        if (!Array.isArray(cats)) return;
        setDbCategoryItems(mapCategoriesToNavItems(cats));
      })
      .catch(() => {});
  }, []);

  // Personal-side nav now runs entirely off the real categories you've set
  // up in the admin panel — no more made-up placeholder menus with fake
  // sub-items. (Corporate side has no admin-managed categories yet, so it
  // still uses its own curated menu.)
  const navItems = isCorporate ? corporateNavItems : dbCategoryItems;

  // The desktop row only has so much width — past a point, items start
  // getting crushed or pushed off-screen. Cap what's shown inline and tuck
  // the rest behind a "More" dropdown instead (mobile's menu is a scrollable
  // list, so it still shows everything and doesn't need this).
  const MAX_VISIBLE_NAV_ITEMS = isCorporate
    ? (isWideDesktop ? 5 : 4)
    : (isWideDesktop ? 7 : 5);
  const visibleNavItems  = navItems.slice(0, MAX_VISIBLE_NAV_ITEMS);
  const overflowNavItems = navItems.slice(MAX_VISIBLE_NAV_ITEMS);

  const inputRef    = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ── Animated placeholder ──────────────────────────────────────────────────
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
      setSearchResults({ products: [], categories: [] });
      setDisplayedPlaceholder("");
      setPlaceholderIndex(0);
      setIsDeleting(false);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      if (e.key === "Enter" && searchOpen && searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [searchOpen, searchQuery]);

  // ── Real-time API search with 300ms debounce ──────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults({ products: [], categories: [] }); return; }
    setSearching(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=8`);
      const data = await res.json();
      setSearchResults({ products: data.products || [], categories: data.categories || [] });
    } catch {
      setSearchResults({ products: [], categories: [] });
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setSearchResults({ products: [], categories: [] }); return; }
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, doSearch]);

  return (
    <>
      <header className="bg-white relative z-50">

        {/* ── MAIN NAVBAR ROW ── */}
        <div className="border-b border-[#ececec]">
          <div className="container-custom h-[75px] flex items-center justify-between">

            {/* ── LEFT ── */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2.5 -ml-2.5" aria-label="Open menu">
                    <Menu size={22} strokeWidth={1.5} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-[#f7f4ef] p-0">
                  <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                  <div className="p-5 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-2 leading-none">
                      <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="16" width="30" height="17" rx="2.5" fill="#f3efe8" stroke="#c0555a" strokeWidth="1"/>
                        <rect x="1" y="12" width="34" height="6" rx="2" fill="#f3efe8" stroke="#c0555a" strokeWidth="1"/>
                        <rect x="15.5" y="12" width="5" height="21" fill="#c0555a"/>
                        <rect x="1" y="14.5" width="34" height="2" fill="#c0555a"/>
                        <path d="M18 12 C13 6 6 7.5 7.5 12" stroke="#c0555a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                        <path d="M18 12 C23 6 30 7.5 28.5 12" stroke="#c0555a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                        <circle cx="18" cy="12" r="2.2" fill="#c0555a"/>
                      </svg>
                      <div className="flex flex-col leading-none">
                        <div className="flex items-baseline gap-[1px]">
                          <span style={{ fontFamily: "var(--font-dm-serif), serif" }}
                            className="text-[20px] font-normal text-[#1a1a1a] leading-none">Hashtag</span>
                          <span style={{ fontFamily: "var(--font-dm-serif), serif" }}
                            className="text-[20px] font-normal text-[#c0555a] leading-none">Gifting</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-body), sans-serif" }}
                          className="text-[7.5px] font-medium text-[#888] uppercase tracking-wide mt-[3px]">
                          Change the idea of gifting
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 px-4 py-3 border-b border-[#ececec]">
                    <Link href="/" className={`flex-1 text-center py-2 rounded-full text-[11px] font-semibold border-2 transition-all ${!isCorporate ? "bg-[#c0555a] text-white border-[#c0555a]" : "bg-white text-[#c0555a] border-[#c0555a]"}`}>
                      Personal gifts
                    </Link>
                    <Link href="/corporate" className={`flex-1 text-center py-2 rounded-full text-[11px] font-semibold border-2 transition-all ${isCorporate ? "bg-[#c0555a] text-white border-[#c0555a]" : "bg-white text-[#c0555a] border-[#c0555a]"}`}>
                      Corporate
                    </Link>
                  </div>
                  <div className="flex flex-col overflow-y-auto">
                    {navItems.map((item, navIdx) => (
                      <div key={`${item.slug ?? item.title}-${navIdx}`} className="border-b border-[#ececec]">
                        <button
                          onClick={() => setMobileExpanded(mobileExpanded === item.title ? null : item.title)}
                          className="w-full text-left px-6 py-4 text-[13px] text-[#333] flex items-center justify-between hover:bg-white transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <item.icon size={14} strokeWidth={1.8} className="text-[#c0555a]" />
                            {item.title}
                          </span>
                          <ChevronDown size={13} strokeWidth={1.5}
                            className={`text-gray-400 transition-transform ${mobileExpanded === item.title ? "rotate-180" : ""}`} />
                        </button>
                        {mobileExpanded === item.title && (
                          <div className="bg-white px-6 pb-3 flex flex-col">
                            <Link href={itemHref(item)} className="py-2 text-[12px] font-semibold text-[#c0555a]">
                              View all {item.title} →
                            </Link>
                            {item.items.map((subItem, i) => (
                              <Link key={i} href={subHref(subItem)}
                                className="py-2 text-[12px] text-[#555] border-t border-[#f3f3f3]">
                                {subLabel(subItem)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search icon — visible at every size now. It used to be
                  `hidden lg:flex`, which meant anything below 1024px wide
                  (every phone and tablet) had no way to open search at all,
                  since the mobile hamburger menu doesn't have a search
                  entry either. */}
              <div className="flex items-center gap-1">
                <button onClick={() => setSearchOpen(true)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                  <Search size={19} strokeWidth={1.5} />
                </button>
              </div>

              {/* Desktop switcher pills — pushed to xl (1280px) instead of
                  lg (1024px): at exactly 1024px (an iPad Pro in portrait),
                  these pills plus the search icon crowd the same row as the
                  absolutely-centered logo block and can collide with it. */}
              <div className="hidden xl:flex items-center gap-2">
                <Link href="/" className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all duration-300 ${!isCorporate ? "bg-[#c0555a] text-white border-[#c0555a]" : "bg-white text-[#c0555a] border-[#c0555a] hover:bg-[#c0555a] hover:text-white"}`}>
                  <Gift size={12} strokeWidth={2} /> Personal gifts
                </Link>
                <Link href="/corporate" className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all duration-300 ${isCorporate ? "bg-[#c0555a] text-white border-[#c0555a]" : "bg-white text-[#c0555a] border-[#c0555a] hover:bg-[#c0555a] hover:text-white"}`}>
                  <Building2 size={12} strokeWidth={2} /> Corporate gifting
                </Link>
              </div>
            </div>

            {/* ── CENTER — LOGO ──
                Absolutely centered regardless of what's in the left/right
                flex groups, so on narrow phones it can collide with them.
                Fix: shrink the wordmark on the smallest screens and drop the
                divider + tagline below `sm` (640px) — they're decorative,
                not essential, and were the widest part of this block. */}
            <Link href="/" className="flex flex-col sm:flex-row items-center gap-[5px] sm:gap-2.5 leading-none select-none absolute left-1/2 -translate-x-1/2 max-w-[62vw] sm:max-w-none">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-[34px] sm:h-[34px] flex-shrink-0">
                <rect x="3" y="16" width="30" height="17" rx="2.5" fill="#f3efe8" stroke="#c0555a" strokeWidth="1"/>
                <rect x="1" y="12" width="34" height="6" rx="2" fill="#f3efe8" stroke="#c0555a" strokeWidth="1"/>
                <rect x="15.5" y="12" width="5" height="21" fill="#c0555a"/>
                <rect x="1" y="14.5" width="34" height="2" fill="#c0555a"/>
                <path d="M18 12 C13 6 6 7.5 7.5 12" stroke="#c0555a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M18 12 C23 6 30 7.5 28.5 12" stroke="#c0555a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="18" cy="12" r="2.2" fill="#c0555a"/>
              </svg>
                <div className="flex items-baseline gap-[1px] min-w-0">
                  <span style={{ fontFamily: "var(--font-dm-serif), serif" }}
                    className="text-[16px] sm:text-[22px] md:text-[26px] font-normal text-[#1a1a1a] leading-none truncate">Hashtag</span>
                  <span style={{ fontFamily: "var(--font-dm-serif), serif" }}
                    className="text-[16px] sm:text-[22px] md:text-[26px] font-normal text-[#c0555a] leading-none truncate">Gifting</span>
                </div>
              </div>
              {/* Motto — phones: same black uppercase body font as desktop, one line under the logo */}
              <span
                style={{ fontFamily: "var(--font-body), sans-serif" }}
                className="sm:hidden text-[8px] font-medium text-[#1a1a1a] uppercase tracking-wide whitespace-nowrap leading-none">
                Change the idea of gifting
              </span>
              {/* Motto — tablet/desktop: original divider + two-line uppercase text */}
              <div className="hidden sm:block w-px h-8 bg-gray-300 mx-1" />
              <div className="hidden sm:flex flex-col leading-none">
                <span style={{ fontFamily: "var(--font-body), sans-serif" }}
                  className="text-[9px] font-medium text-[#1a1a1a] leading-[1.4] uppercase tracking-wide">Change the</span>
                <span style={{ fontFamily: "var(--font-body), sans-serif" }}
                  className="text-[9px] font-medium text-[#1a1a1a] leading-[1.4] uppercase tracking-wide">idea of gifting</span>
              </div>
            </Link>

            {/* ── RIGHT ── */}
            <div className="flex items-center gap-2 justify-end">
              <ProfileDropdown />
              <Link href="/wishlist" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex" aria-label="Add to wishlist">
                <Heart size={19} strokeWidth={1.5} />
              </Link>
              <button className="relative p-2.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setCartOpen(true)}>
                <ShoppingBag size={19} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c0555a] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
              {isCorporate && (
                <Link href="/corporate#inquiry" className="hidden md:flex items-center gap-1.5 ml-1 px-4 py-2 bg-[#c0555a] text-white text-[11px] font-semibold rounded-full hover:bg-[#a84449] transition-colors whitespace-nowrap">
                  <Building2 size={12} /> Get a quote
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── CATEGORY NAV ROW ──
            No overflow-x here on purpose — browsers force overflow-y to
            clip too whenever overflow-x isn't `visible` (there's no real
            "scroll x, but let y overflow" combo), and that was silently
            cutting every dropdown panel off since they render below this
            row's box. MAX_VISIBLE_NAV_ITEMS + the "More" overflow menu
            already keep this row from overflowing in normal use, so that
            scroll fallback wasn't actually needed to prevent a broken row —
            just letting the dropdowns render unclipped matters more. */}
        <div className="hidden lg:block border-b border-[#ececec] bg-white" ref={categoryNavRef}>
          <div className="container-custom h-[46px] flex items-center justify-center gap-6 xl:gap-7">
            {visibleNavItems.map((item, navIdx) => {
              const navKey = `${item.slug ?? item.title}-${navIdx}`;
              // Categories with no subcategories still get a dropdown, just
              // with a single "Shop all" entry instead of an empty grid.
              const dropdownItems: SubItem[] = item.items.length > 0
                ? item.items
                : [{ name: `Shop all ${item.title}`, slug: item.slug ?? toSlug(item.title) }];

              return (
                <div key={navKey} className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveMenu(item.title)}
                  onMouseLeave={() => setActiveMenu(null)}>
                  {/* onClick added alongside the existing hover handlers —
                      an iPad Pro (and any touch device that happens to sit
                      at/above the lg breakpoint) doesn't reliably fire
                      hover, so tapping needs to open/close this too. */}
                  <button
                    onClick={() => setActiveMenu(activeMenu === item.title ? null : item.title)}
                    className={`flex items-center gap-1 text-[11px] font-medium tracking-wide transition-all duration-200 pb-0.5 border-b-2 whitespace-nowrap ${activeMenu === item.title ? "text-black border-black" : "text-[#555] border-transparent hover:text-black hover:border-gray-300"}`}>
                    {item.title}
                    <ChevronDown size={11} strokeWidth={2} className={`transition-transform duration-200 ${activeMenu === item.title ? "rotate-180" : ""}`} />
                  </button>
                  {activeMenu === item.title && (
                    // Centered-under-the-button anchoring could push the box
                    // past the viewport edge for items near either end of the
                    // row — most noticeable right at the 1024px iPad Pro
                    // width where there's little room to spare. Anchoring
                    // left at the lg tier (where space is tightest) and only
                    // switching to a centered anchor at xl (genuinely wide
                    // screens), plus a hard max-width clamp, keeps the panel
                    // on-screen at every width instead of relying on exact
                    // centering.
                    <div className="absolute top-full left-0 xl:left-1/2 xl:-translate-x-1/2 z-50" style={{ maxWidth: "calc(100vw - 2rem)" }}>
                      <div className="bg-white border-x border-b border-[#ececec] shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden max-w-[calc(100vw-2rem)]"
                        style={{ minWidth: dropdownItems.length > 8 ? "min(640px, calc(100vw - 2rem))" : "min(380px, calc(100vw - 2rem))" }}>
                        <div className="bg-[#f7f4ef] px-8 py-3.5 border-b border-[#ececec] flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#c0555a] tracking-[1px] flex items-center gap-2">
                            <item.icon size={13} strokeWidth={2} className="text-[#c0555a]" />
                            {item.featured}
                          </span>
                          <Link href={itemHref(item)}
                            className="text-[11px] text-[#c0555a] font-medium flex items-center gap-1 hover:underline">
                            View all <ArrowRight size={10} />
                          </Link>
                        </div>
                        <div className={`px-8 py-5 grid gap-x-12 gap-y-0 ${dropdownItems.length > 8 ? "grid-cols-3" : "grid-cols-2"}`}>
                          {dropdownItems.map((subItem, i) => (
                            <Link key={i} href={subHref(subItem)}
                              className="text-[13px] font-light text-[#3d3d3d] py-2.5 border-b border-[#f0f0f0] last:border-0 hover:text-[#c0555a] transition-colors duration-150">
                              {subLabel(subItem)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Overflow — anything past the visible cap lives here instead of
                getting cut off / squeezed off the edge of the screen. */}
            {overflowNavItems.length > 0 && (
              <div className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu("__more__")}
                onMouseLeave={() => setActiveMenu(null)}>
                <button
                  onClick={() => setActiveMenu(activeMenu === "__more__" ? null : "__more__")}
                  className={`flex items-center gap-1 text-[11px] font-medium tracking-wide transition-all duration-200 pb-0.5 border-b-2 whitespace-nowrap ${activeMenu === "__more__" ? "text-black border-black" : "text-[#555] border-transparent hover:text-black hover:border-gray-300"}`}>
                  More
                  <ChevronDown size={11} strokeWidth={2} className={`transition-transform duration-200 ${activeMenu === "__more__" ? "rotate-180" : ""}`} />
                </button>
                {activeMenu === "__more__" && (
                  <div className="absolute top-full right-0 z-50" style={{ maxWidth: "calc(100vw - 2rem)" }}>
                    <div className="bg-white border-x border-b border-[#ececec] shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden max-w-[calc(100vw-2rem)]"
                      style={{ minWidth: "min(640px, calc(100vw - 2rem))" }}>
                      <div className="bg-[#f7f4ef] px-8 py-3.5 border-b border-[#ececec]">
                        <span className="text-[11px] font-semibold text-[#c0555a] tracking-[1px]">MORE CATEGORIES</span>
                      </div>
                      <div className="px-8 py-5 grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-0 max-h-[60vh] overflow-y-auto">
                        {overflowNavItems.map((item, i) => (
                          <Link key={`${item.slug ?? item.title}-${i}`} href={itemHref(item)}
                            className="flex items-center gap-2 text-[13px] font-light text-[#3d3d3d] py-2.5 border-b border-[#f0f0f0] hover:text-[#c0555a] transition-colors duration-150">
                            <item.icon size={13} strokeWidth={2} className="text-[#c0555a] flex-shrink-0" />
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isCorporate && HAMPER_ENABLED && (
              <Link href="/build-hamper" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#6B4F3F] border-b-2 border-transparent hover:border-[#6B4F3F] pb-0.5 whitespace-nowrap transition-all duration-200">
                <Gift size={11} /> Build Hamper
              </Link>
            )}
            {!isCorporate && (
              <Link href="/fast-delivery" className="flex items-center gap-1 text-[11px] font-medium tracking-wide text-[#c0555a] border-b-2 border-transparent hover:text-black hover:border-gray-300 pb-0.5 whitespace-nowrap transition-all duration-200">
                <Zap size={11} /> 3hr delivery
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── SEARCH OVERLAY ──
          Redesigned from an edge-to-edge bar pinned to the top (old style)
          into a centered, rounded "command palette" style card with a
          proper backdrop and entrance/exit animation — the look most
          modern search UIs (Spotlight, Cmd+K palettes, Algolia DocSearch)
          share. All the existing search logic/state above is untouched;
          this only restructures the markup. */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[8vh] md:pt-[12vh]"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setSearchOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[76vh]"
            >

              {/* Input row */}
              <div className="flex items-center gap-3 px-5 md:px-6 py-4 md:py-5 border-b border-[#f0ece6] flex-shrink-0">
                <Search size={20} className="text-[#c0555a] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={displayedPlaceholder || "Search products, categories..."}
                  className="flex-1 text-[16px] outline-none text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0"
                />
                {searching && <Loader2 size={17} className="animate-spin text-[#c0555a] flex-shrink-0" />}
                {searchQuery && !searching && (
                  <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black transition-colors flex-shrink-0">
                    <X size={17} />
                  </button>
                )}
                <button onClick={() => setSearchOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#f3efe8] hover:text-black transition-colors flex-shrink-0">
                  <X size={18} />
                </button>
              </div>

              {/* Results panel */}
              <div className="px-5 md:px-6 py-5 overflow-y-auto flex-1">

                {/* Empty state — trending */}
                {!searchQuery && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-3 flex items-center gap-2">
                      <TrendingUp size={13} /> Trending searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <button key={term} onClick={() => setSearchQuery(term)}
                          className="px-4 py-1.5 rounded-full border border-[#c0555a] text-[12px] text-[#c0555a] hover:bg-[#c0555a] hover:text-white transition-all duration-200">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live results */}
                {searchQuery && (
                  <div className="flex flex-col gap-5">

                    {searching && (
                      <div className="flex items-center gap-2 text-[13px] text-gray-400">
                        <Loader2 size={14} className="animate-spin" /> Searching...
                      </div>
                    )}

                    {/* Categories */}
                    {!searching && searchResults.categories.length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-3 flex items-center gap-2">
                          <FolderOpen size={12} /> Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {searchResults.categories.map((cat: any) => (
                            <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-[#f3efe8] rounded-full text-[12px] text-[#555] hover:bg-[#c0555a] hover:text-white transition-all font-medium">
                              <FolderOpen size={11} />
                              {cat.name}
                              <span className="text-[10px] opacity-60">({cat._count.products})</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* In-stock products */}
                    {!searching && searchResults.products.filter((p: any) => p.stock > 0).length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[3px] mb-3">
                          Products ({searchResults.products.filter((p: any) => p.stock > 0).length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {searchResults.products.filter((p: any) => p.stock > 0).map((product: any) => {
                            const discount = product.comparePrice
                              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
                            return (
                              <Link key={product.id} href={`/product/${product.slug}`} onClick={() => setSearchOpen(false)}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f7f4ef] transition-colors group">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#f3efe8] flex-shrink-0 border border-[#e8e0d5]">
                                  {product.images?.[0]
                                    ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-300" /></div>
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-gray-800 group-hover:text-[#c0555a] transition-colors truncate">{product.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[12px] font-bold text-[#c0555a]">Rs. {(product.price / 100).toLocaleString("en-IN")}</span>
                                    {discount > 0 && <span className="text-[10px] text-green-600 font-semibold">{discount}% off</span>}
                                  </div>
                                  {product.category && <p className="text-[10px] text-gray-400 mt-0.5">{product.category.name}</p>}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Out of stock — dimmed separate section */}
                    {!searching && searchResults.products.filter((p: any) => p.stock === 0).length > 0 && (
                      <div className="border-t border-[#f0ece6] pt-4">
                        <h3 className="text-[11px] font-semibold text-gray-300 uppercase tracking-[3px] mb-3">
                          Out of stock ({searchResults.products.filter((p: any) => p.stock === 0).length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 opacity-60">
                          {searchResults.products.filter((p: any) => p.stock === 0).map((product: any) => (
                            <Link key={product.id} href={`/product/${product.slug}`} onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#fafafa] transition-colors group">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#f3efe8] flex-shrink-0 border border-[#e8e0d5]">
                                {product.images?.[0]
                                  ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-300" /></div>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-gray-400 truncate">{product.name}</p>
                                <p className="text-[12px] text-gray-400 mt-0.5">Rs. {(product.price / 100).toLocaleString("en-IN")}</p>
                                {product.category && <p className="text-[10px] text-gray-300 mt-0.5">{product.category.name}</p>}
                              </div>
                              <span className="text-[9px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0 whitespace-nowrap">Out of stock</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results */}
                    {!searching && searchResults.products.length === 0 && searchResults.categories.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-[14px] font-semibold text-gray-800 mb-1">No results for "{searchQuery}"</p>
                        <p className="text-[13px] text-gray-400 mb-4">Try a different spelling or browse categories</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {trendingSearches.slice(0, 4).map(term => (
                            <button key={term} onClick={() => setSearchQuery(term)}
                              className="px-3 py-1.5 rounded-full border border-[#c0555a] text-[12px] text-[#c0555a] hover:bg-[#c0555a] hover:text-white transition-all">
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View all link */}
                    {(searchResults.products.length > 0 || searchResults.categories.length > 0) && (
                      <div className="pt-4 border-t border-[#ececec]">
                        <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-2 text-[13px] text-gray-600 hover:text-[#c0555a] font-semibold transition-colors">
                          <ArrowRight size={15} /> See all results for "{searchQuery}"
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer hint — quiet keyboard-shortcut cue, common in modern search palettes */}
              <div className="hidden sm:flex items-center justify-between px-6 py-2.5 border-t border-[#f0ece6] bg-[#faf8f5] text-[11px] text-gray-400 flex-shrink-0">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-white text-[10px] font-semibold">Enter</kbd> to search
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-white text-[10px] font-semibold">Esc</kbd> to close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}