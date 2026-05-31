"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Zap,
  Gift,
  Heart,
  RefreshCw,
} from "lucide-react";

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YouTubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const footerLinks = [
  {
    title: "Quick links",
    links: [
      { label: "Home", href: "/" },
      { label: "Best sellers", href: "/collections/best-sellers" },
      { label: "New arrivals", href: "/collections/new-arrivals" },
      { label: "Bulk gifting", href: "/bulk-gifting" },
      { label: "Track order", href: "/track-order" },
      { label: "About us", href: "/about" },
    ],
  },
  {
    title: "Shop by occasion",
    links: [
      { label: "Birthday gifts", href: "/category/birthday-gifts" },
      { label: "Anniversary gifts", href: "/category/anniversary-gifts" },
      { label: "Wedding gifts", href: "/category/wedding-gifts" },
      { label: "Valentine's day", href: "/category/valentines-day" },
      { label: "Mother's day", href: "/category/mothers-day" },
      { label: "Raksha bandhan", href: "/category/raksha-bandhan" },
    ],
  },
  {
    title: "Shop by relationship",
    links: [
      { label: "Gifts for girlfriend", href: "/category/gifts-for-girlfriend" },
      { label: "Gifts for boyfriend", href: "/category/gifts-for-boyfriend" },
      { label: "Gifts for wife", href: "/category/gifts-for-wife" },
      { label: "Gifts for husband", href: "/category/gifts-for-husband" },
      { label: "Gifts for parents", href: "/category/gifts-for-parents" },
      { label: "Gifts for friends", href: "/category/gifts-for-friends" },
    ],
  },
  {
    title: "Help & support",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping policy", href: "/shipping-policy" },
      { label: "Return & refund", href: "/return-policy" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];

const FOOTER_BG = "#c0555a";
const FOOTER_BG_DARK = "#a84449";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: FOOTER_BG }} className="text-white">

      {/* ── TOP STRIP ── */}
      <div style={{ backgroundColor: FOOTER_BG_DARK }} className="py-4 px-4 border-b border-white/5">
        <div className="max-w-[1450px] mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-12 text-center">
          {[
            { icon: <Zap size={13} />, text: "3-hour express delivery in Jaipur" },
            { icon: <Gift size={13} />, text: "Free gift wrapping on every order" },
            { icon: <Heart size={13} />, text: "100% customized & made with love" },
            { icon: <RefreshCw size={13} />, text: "Easy returns & hassle-free refunds" },
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-[12px] text-white font-medium">
              {/* ✅ icons now white */}
              <span className="text-white">{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN FOOTER ── */}
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* ── BRAND COLUMN ── */}
          <div className="lg:col-span-2">

            {/* LOGO */}
            <Link href="/" className="flex flex-col leading-none select-none mb-5 w-fit">
              <span className="text-[32px] font-bold tracking-[-1.5px] text-white">
                hashtag
              </span>
              <span className="text-[9px] font-semibold tracking-[5px] text-white uppercase -mt-1">
                gifting
              </span>
            </Link>

            <p className="text-[13px] text-white/80 leading-relaxed mb-6 max-w-xs">
              Jaipur's most loved personalized gifting brand. Crafting memories,
              one gift at a time — with love, care & creativity.
            </p>

            {/* CONTACT — brighter white */}
            <div className="flex flex-col gap-3 mb-8">
              
                href="https://maps.google.com/?q=Hashtag+Gifts+Jaipur"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-[13px] text-white/80 hover:text-white transition-colors"
              >
                {/* ✅ icons now white */}
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-white" />
                Shankar Nagar Main Road, Raipur, Jaipur
              </a>
                
                href="tel:+917665909909"
                className="flex items-center gap-2.5 text-[13px] text-white/80 hover:text-white transition-colors"
              >
                <Phone size={14} className="flex-shrink-0 text-white" />
                +91 86400 30112
              </a>
              
                href="mailto:hashtaggiftsupport@gmail.com"
                className="flex items-center gap-2.5 text-[13px] text-white/80 hover:text-white transition-colors"
              >
                <Mail size={14} className="flex-shrink-0 text-white" />
                hashtaggiftsupport@gmail.com
              </a>
            </div>

            {/* SOCIAL */}
            <div className="flex items-center gap-3">
              {[
                { icon: <InstagramIcon size={16} />, href: "https://www.instagram.com/hashtagifting/", label: "Instagram" },
                { icon: <WhatsAppIcon size={16} />, href: "https://wa.me/917665909909", label: "WhatsApp" },
                { icon: <FacebookIcon size={16} />, href: "https://facebook.com/hashtagifting", label: "Facebook" },
                { icon: <YouTubeIcon size={16} />, href: "https://youtube.com/@hashtagifting", label: "YouTube" },
              ].map((social, i) => (
                
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── LINKS COLUMNS ── */}
          {footerLinks.map((col, i) => (
            <div key={i} className="lg:col-span-1">
              <h4 className="text-[11px] font-semibold uppercase tracking-[2px] text-white mb-5">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                    >
                      <ChevronRight
                        size={11}
                        className="opacity-0 group-hover:opacity-100 -ml-1 transition-all duration-200 text-white"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── NEWSLETTER ── */}
        <div className="mt-12 pt-10 border-t border-white/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h4
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Get gifting ideas in your inbox
              </h4>
              <p className="text-[13px] text-white/70">
                Subscribe for exclusive deals, new arrivals & gifting inspiration.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 md:w-[280px] bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[13px] px-4 py-3 rounded-xl outline-none focus:border-white transition-colors"
              />
              {/* ✅ subscribe button — white bg + red text */}
              <button className="bg-white text-[#c0555a] text-[13px] font-semibold px-5 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/60 text-center">
            © {new Date().getFullYear()} Hashtag Gifting, Jaipur. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {["Visa", "Mastercard", "UPI", "Razorpay", "COD"].map((method, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-white/10 text-white/70 border border-white/20"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}