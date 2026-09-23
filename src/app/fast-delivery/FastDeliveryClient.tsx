"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, MapPin, Clock, Heart, ChevronRight, Package, Phone, ShoppingBag, CheckCircle2 } from "lucide-react";

interface Product {
  id: number; name: string; slug: string;
  price: number; comparePrice: number | null;
  images: string[]; badge: string | null;
}

function fp(p: number) { return `Rs. ${(p / 100).toLocaleString("en-IN")}`; }
function savePercent(price: number, compare: number) {
  return Math.round(((compare - price) / compare) * 100);
}

// Local hero photos — stopgap in place of the previous hotlinked
// confettigifts.in competitor CDN images (legal risk). Only shown if the real
// fastDelivery API returns zero products, see the fetch below.
const HERO_IMGS = [
  "/Personalisedpassportcoverheroimage.png",
  "/personaliseddiariespensheropng.png",
  "/personalisedwalletskeychain.png",
];


const areas = ["Vaishali Nagar", "Mansarovar", "Malviya Nagar", "C-Scheme", "Tonk Road", "Jagatpura", "Sanganer", "Bani Park", "Civil Lines", "Pratap Nagar", "Sirsi Road", "Sodala"];

const steps = [
  { icon: ShoppingBag,  step: "01", title: "Place your order",  desc: "Choose your gift & customise it online" },
  { icon: Zap,          step: "02", title: "We craft & pack it", desc: "Our team prepares your order immediately" },
  { icon: MapPin,       step: "03", title: "Out for delivery",   desc: "Rider picks up and heads to your address" },
  { icon: CheckCircle2, step: "04", title: "Delivered!",         desc: "Gift at your door within 3 hours" },
];

function useCountdown() {
  const [time, setTime] = useState({ h: 2, m: 59, s: 59 });
  const ref = useRef<NodeJS.Timeout | undefined>(undefined);
  useEffect(() => {
    ref.current = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 2, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);
  return time;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function FastDeliveryClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const time = useCountdown();

  useEffect(() => {
    fetch("/api/products?fastDelivery=true&status=ACTIVE&limit=20")
      .then(r => r.json())
      .then(async d => {
        if (d.products?.length > 0) return setProducts(d.products);
        // none flagged for fast delivery yet → show real catalogue picks (never fake products)
        const m = await fetch("/api/home/mix?limit=8&seed=3").then(r => r.json()).catch(() => ({ products: [] }));
        setProducts(m.products || []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#f3efe8] min-h-screen">

      {/* ── HERO — real image background ── */}
      <div className="relative min-h-[600px] md:min-h-[680px] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1513201099705-a9746072f418?w=1800&q=80&fit=crop"
          alt="Fast delivery"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(15,15,15,0.88) 0%, rgba(15,15,15,0.75) 50%, rgba(15,15,15,0.2) 100%)" }} />

        <div className="relative z-10 max-w-[1450px] mx-auto px-6 md:px-10 w-full py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="bg-[#c0555a] text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Zap size={10} className="fill-white" /> Live now
              </span>
              <span className="text-white/50 text-[12px]">9am – 9pm daily · Jaipur only</span>
            </div>

            <h1
              className="text-[52px] md:text-[76px] font-normal text-white mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", lineHeight: "1.05" }}
            >
              Gift in<br />
              <span className="text-[#c0555a]">3 Hours.</span>
            </h1>

            <p className="text-white/65 text-[15px] md:text-[16px] max-w-md mb-8 leading-relaxed">
              Order a personalised gift right now and get it delivered anywhere in Jaipur within 3 hours. No waiting. No delays.
            </p>

            {/* Countdown */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-4 mb-8">
              {[
                { val: pad(time.h), label: "hrs" },
                { val: pad(time.m), label: "min" },
                { val: pad(time.s), label: "sec", red: true },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-4">
                  {i > 0 && <span className="text-white/30 text-[20px] font-light">:</span>}
                  <div className="text-center">
                    <p className={`text-[28px] font-bold leading-none ${t.red ? "text-[#c0555a]" : "text-white"}`}
                      style={{ fontFamily: "'Playfair Display', serif" }}>{t.val}</p>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{t.label}</p>
                  </div>
                </div>
              ))}
              <p className="text-white/40 text-[11px] ml-2 max-w-[70px] leading-tight">Order now · deliver by then</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="#products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#c0555a] text-white text-[13px] font-semibold rounded-full hover:bg-[#a84449] transition-all">
                <Zap size={14} className="fill-white" /> Order now
              </Link>
              <a href="https://wa.me/917665909909" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/25 text-white text-[13px] font-medium rounded-full hover:bg-white/20 transition-all">
                <Phone size={14} /> WhatsApp us
              </a>
            </div>
          </div>
        </div>

        {/* Delivery areas floating card */}
        <div className="absolute bottom-6 right-6 hidden lg:block bg-white/95 backdrop-blur-sm rounded-2xl p-5 max-w-[280px] border border-white/20 shadow-xl">
          <p className="text-[10px] font-bold text-[#888] uppercase tracking-[2px] mb-3 flex items-center gap-1.5">
            <MapPin size={10} className="text-[#c0555a]" /> We deliver to
          </p>
          <div className="flex flex-wrap gap-1.5">
            {areas.slice(0, 8).map((area, i) => (
              <span key={i} className="text-[11px] text-[#555] bg-[#f3efe8] px-2 py-1 rounded-full">{area}</span>
            ))}
            <span className="text-[11px] text-[#888] px-2 py-1">+ more</span>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="max-w-[1450px] mx-auto px-4 md:px-10 py-14">
        <div className="text-center mb-10">
          <h2
            className="text-[36px] md:text-[52px] font-normal text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            How it works
          </h2>
          <p className="text-[#888] text-[14px] mt-2">From order to your door — here's what happens</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#e8e0d5] text-center relative overflow-hidden">
                <span className="absolute top-4 left-4 text-[11px] font-bold text-[#ede8e0]">{step.step}</span>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 z-10 w-4 h-4 rounded-full bg-[#c0555a] border-2 border-white" />
                )}
                <div className="w-12 h-12 rounded-2xl bg-[#c0555a]/8 flex items-center justify-center mx-auto mb-4 mt-2">
                  <Icon size={22} className="text-[#c0555a]" strokeWidth={1.6} />
                </div>
                <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">{step.title}</p>
                <p className="text-[12px] text-[#888] leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <div id="products" className="max-w-[1450px] mx-auto px-4 md:px-10 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2
              className="text-[36px] md:text-[52px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
            >
              Available for fast delivery
            </h2>
            <p className="text-[#888] text-[14px] mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              {loading ? "Loading products..." : `${products.length} products ready`} · Jaipur delivery only
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-square bg-[#e8e0d5] rounded-2xl mb-3" />
                <div className="h-4 bg-[#e8e0d5] rounded-full w-3/4 mb-2" />
                <div className="h-4 bg-[#e8e0d5] rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(product => (
              <Link key={product.id} href={`/product/${product.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden aspect-square">
                  {product.images?.[0] && (
                    <Image src={product.images[0]} alt={product.name} fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw" />
                  )}
                  <div className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Zap size={9} className="fill-white" /> 3hr delivery
                  </div>
                  <button onClick={e => { e.preventDefault(); setWishlist(w => w.includes(product.id) ? w.filter(i => i !== product.id) : [...w, product.id]); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all">
                    <Heart size={14} className={wishlist.includes(product.id) ? "fill-[#c0555a] text-[#c0555a]" : "text-gray-400"} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-medium text-[#1a1a1a] mb-2 capitalize line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-[#1a1a1a]">{fp(product.price)}</span>
                    {product.comparePrice && (
                      <>
                        <span className="text-[12px] text-gray-400 line-through">{fp(product.comparePrice)}</span>
                        <span className="text-[11px] font-semibold text-[#c0555a]">{savePercent(product.price, product.comparePrice)}% off</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="bg-[#f3efe8] border-t border-[#e8e0d5] py-12 px-4">
        <div className="max-w-[1450px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[24px] md:text-[32px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Need a gift urgently?
            </h3>
            <p className="text-[#888] text-[14px] mt-1">WhatsApp us and we'll sort it within minutes.</p>
          </div>
          <a href="https://wa.me/917665909909?text=Hi!%20I%20need%20a%20gift%20delivered%20urgently%20in%20Jaipur"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#c0555a] text-white text-[14px] font-bold rounded-full hover:bg-[#a84449] transition-all whitespace-nowrap flex-shrink-0">
            <Phone size={16} /> WhatsApp now
          </a>
        </div>
      </div>

    </div>
  );
}