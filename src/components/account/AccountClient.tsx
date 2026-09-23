"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link                     from "next/link";
import Image                    from "next/image";
import {
  User, Package, MapPin, Heart,
  LogOut, ChevronRight, Edit2,
  CheckCircle, Loader2, Plus, Trash2,
  Phone, Mail, Home, Star, X,
  ShoppingBag, Clock, BadgeCheck,
  CreditCard, Tag, AlertCircle, Truck, Pencil,
} from "lucide-react";
import { formatPrice } from "@/lib/store/cartStore";
import { useCartStore } from "@/lib/store/cartStore";
import AvailableCoupons from "@/components/shared/AvailableCoupons";

type Tab = "profile" | "orders" | "addresses" | "wishlist" | "cards" | "coupons";

interface Order {
  id:             number;
  totalAmount:    number;
  paymentStatus:  string;
  deliveryStatus: string;
  createdAt:      string;
  items:          { product: { name: string; images: string[] }; quantity: number; price: number }[];
}

interface Address {
  id:        number;
  name:      string;
  phone:     string;
  street:    string;
  city:      string;
  state:     string;
  pincode:   string;
  isDefault: boolean;
}

// ── sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, session }: { tab: Tab; setTab: (t: Tab) => void; session: any }) {
  const items: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",   label: "Profile",       icon: <User       size={16} /> },
    { key: "orders",    label: "My orders",     icon: <Package    size={16} /> },
    { key: "addresses", label: "Addresses",     icon: <MapPin     size={16} /> },
    { key: "cards",     label: "Saved cards",   icon: <CreditCard size={16} /> },
    { key: "coupons",   label: "My coupons",    icon: <Tag        size={16} /> },
    { key: "wishlist",  label: "Wishlist",      icon: <Heart      size={16} /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden">
      {/* User info */}
      <div className="p-5 border-b border-[#e8e0d5] bg-[#fdf9f5]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#c0555a] flex items-center justify-center text-white font-bold text-[18px] flex-shrink-0 overflow-hidden">
            {session?.user?.image
              ? <Image src={session.user.image} alt="" width={48} height={48} className="object-cover" />
              : session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-[#1a1a1a] truncate">{session?.user?.name || "Guest"}</p>
            <p className="text-[12px] text-[#888] truncate">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="p-2">
        {items.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
              tab === item.key
                ? "bg-[#c0555a]/10 text-[#c0555a]"
                : "text-[#555] hover:bg-[#f3efe8] hover:text-[#1a1a1a]"
            }`}>
            {item.icon}
            {item.label}
            <ChevronRight size={14} className="ml-auto opacity-50" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <div className="p-3 border-t border-[#e8e0d5]">
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-all">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}

// ── profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({ session }: { session: any }) {
  const [name,    setName]    = useState(session?.user?.name  || "");
  const [phone,   setPhone]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res  = await fetch("/api/auth/update-profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
      <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
        <User size={18} className="text-[#c0555a]" /> Profile details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">Full name</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input type="email" value={session?.user?.email || ""} disabled
              className="w-full pl-9 pr-4 py-3 border border-[#e8e0d5] rounded-xl text-[14px] bg-[#f3efe8] text-[#888] cursor-not-allowed" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">Phone</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
              placeholder="10-digit number"
              className="w-full pl-9 pr-4 py-3 border border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors" />
          </div>
        </div>
      </div>
      {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}
      <button onClick={handleSave} disabled={saving}
        className="mt-5 flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-50">
        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
         : saved  ? <><CheckCircle size={14} /> Saved!</>
         : <><Edit2 size={14} /> Save changes</>}
      </button>
    </div>
  );
}

// ── orders tab ────────────────────────────────────────────────────────────────
const DELIVERY_STEPS = ["PROCESSING","CONFIRMED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED"];

const DELIVERY_LABELS: Record<string,string> = {
  PROCESSING:      "Order Placed",
  CONFIRMED:       "Confirmed",
  SHIPPED:         "Shipped",
  OUT_FOR_DELIVERY:"Out for Delivery",
  DELIVERED:       "Delivered",
  CANCELLED:       "Cancelled",
};

const DELIVERY_COLORS: Record<string,string> = {
  PROCESSING:      "bg-blue-100 text-blue-700",
  CONFIRMED:       "bg-blue-100 text-blue-700",
  SHIPPED:         "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY:"bg-orange-100 text-orange-700",
  DELIVERED:       "bg-green-100 text-green-700",
  CANCELLED:       "bg-gray-100 text-gray-500",
};

function MiniTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") return (
    <div className="flex items-center gap-1.5 mt-3">
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Cancelled</span>
    </div>
  );
  const currentIdx = DELIVERY_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
      {DELIVERY_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex flex-col items-center gap-0.5`}>
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                current ? "bg-[#c0555a] ring-2 ring-[#c0555a]/30" :
                done    ? "bg-[#c0555a]" : "bg-[#e8e0d5]"
              }`} />
              <span className={`text-[9px] font-medium whitespace-nowrap ${
                current ? "text-[#c0555a]" : done ? "text-[#888]" : "text-[#ccc]"
              }`}>
                {DELIVERY_LABELS[step]?.split(" ")[0]}
              </span>
            </div>
            {i < DELIVERY_STEPS.length - 1 && (
              <div className={`w-5 h-px mb-3 flex-shrink-0 ${done && i < currentIdx ? "bg-[#c0555a]" : "bg-[#e8e0d5]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <p className="text-[14px] font-bold text-[#1a1a1a]">Order #{order.id}</p>
            <p className="text-[12px] text-[#aaa] flex items-center gap-1 mt-0.5">
              <Clock size={11} />
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[15px] font-bold text-[#c0555a]">{formatPrice(order.totalAmount)}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" :
              order.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-600"
            }`}>
              {order.paymentStatus === "PAID" ? <span className="flex items-center gap-1"><CheckCircle size={10} /> Paid</span> : order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Product thumbnails */}
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
          {order.items.slice(0,5).map((item, i) => (
            <div key={i} className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#f8f5f0] border border-[#e8e0d5]">
              <Image src={item.product.images?.[0] || "/placeholder.jpg"} alt={item.product.name}
                fill className="object-cover" sizes="48px" />
              {item.quantity > 1 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c0555a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              )}
            </div>
          ))}
          {order.items.length > 5 && (
            <div className="w-12 h-12 rounded-xl bg-[#f3efe8] flex items-center justify-center text-[11px] font-bold text-[#888] flex-shrink-0 border border-[#e8e0d5]">
              +{order.items.length - 5}
            </div>
          )}
        </div>

        {/* Mini status timeline */}
        <MiniTimeline status={order.deliveryStatus} />

        {/* Current status badge */}
        <div className="flex items-center justify-between mt-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${DELIVERY_COLORS[order.deliveryStatus] || "bg-gray-100 text-gray-600"}`}>
            {DELIVERY_LABELS[order.deliveryStatus] || order.deliveryStatus}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] text-[#c0555a] font-semibold hover:underline flex items-center gap-1"
          >
            {expanded ? "Hide details ↑" : "View details ↓"}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#f0ece6] bg-[#fafaf9] px-5 py-4 flex flex-col gap-3">

          {/* Full item list */}
          <div className="flex flex-col gap-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#f3efe8] border border-[#e8e0d5]">
                  <Image src={item.product.images?.[0] || "/placeholder.jpg"} alt={item.product.name}
                    fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{item.product.name}</p>
                  <p className="text-[11px] text-[#aaa]">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                </div>
                {(item as any).customization && (
                  <span className="flex items-center gap-1 text-[10px] text-[#c0555a] font-semibold bg-[#c0555a]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    <Pencil size={9} /> Custom
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1 flex-wrap">
            <Link
              href={`/track?orderId=${order.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-bold rounded-full hover:bg-[#333] transition-all"
            >
              <Truck size={12} /> Track Order
            </Link>
            <a
              href={`https://wa.me/917665909909?text=Hi! My order ID is %23${order.id}. Can you help me?`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-white text-[12px] font-bold rounded-full hover:bg-[#1da851] transition-all"
            >
              <Phone size={12} /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/my").then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : (Array.isArray(data.orders) ? data.orders : [])))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6 flex flex-col gap-4">
      {[1,2,3].map(i => <div key={i} className="h-36 bg-[#e8e0d5] rounded-2xl animate-pulse" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] p-12 text-center">
      <ShoppingBag size={40} className="text-[#e8e0d5] mx-auto mb-4" strokeWidth={1.5} />
      <p className="text-[16px] font-bold text-[#1a1a1a] mb-2">No orders yet</p>
      <p className="text-[13px] text-[#888] mb-5">Your orders will appear here</p>
      <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
        <ShoppingBag size={14} /> Browse gifts
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </div>
  );
}

// ── addresses tab ─────────────────────────────────────────────────────────────
function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", street:"", city:"", state:"", pincode:"", isDefault: false });

  const load = () => {
    fetch("/api/auth/addresses").then(r => r.json())
      .then(data => setAddresses(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.street || !form.city || !form.state || !form.pincode) return;
    setSaving(true);
    try {
      await fetch("/api/auth/addresses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ name:"", phone:"", street:"", city:"", state:"", pincode:"", isDefault: false });
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/auth/addresses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6 flex flex-col gap-3">
          {[1,2].map(i => <div key={i} className="h-24 bg-[#e8e0d5] rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white rounded-2xl border border-[#e8e0d5] p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Home size={16} className="text-[#c0555a] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">{addr.name}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-[#c0555a] bg-[#c0555a]/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <BadgeCheck size={10} /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#666]">{addr.street}</p>
                  <p className="text-[13px] text-[#666]">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-[12px] text-[#888] mt-1 flex items-center gap-1"><Phone size={11} /> {addr.phone}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(addr.id)}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#ccc] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {/* Add form */}
          {showForm ? (
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
              <p className="text-[14px] font-bold text-[#1a1a1a] mb-4">New address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  { key:"name",    placeholder:"Full name",       type:"text" },
                  { key:"phone",   placeholder:"Phone number",    type:"tel"  },
                  { key:"street",  placeholder:"Street address",  type:"text", col2: true },
                  { key:"city",    placeholder:"City",            type:"text" },
                  { key:"state",   placeholder:"State",           type:"text" },
                  { key:"pincode", placeholder:"Pincode",         type:"tel"  },
                ].map(f => (
                  <input key={f.key} type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: f.key === "phone" || f.key === "pincode"
                      ? e.target.value.replace(/\D/g,"").slice(0, f.key === "pincode" ? 6 : 10)
                      : e.target.value }))}
                    className={`border border-[#e8e0d5] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#c0555a] transition-colors ${f.col2 ? "md:col-span-2" : ""}`}
                  />
                ))}
              </div>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({...p, isDefault: e.target.checked}))}
                  className="w-4 h-4 accent-[#c0555a]" />
                <span className="text-[13px] text-[#555]">Set as default address</span>
              </label>
              <div className="flex gap-3">
                <button onClick={handleAdd} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  Save address
                </button>
                <button onClick={() => setShowForm(false)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#e8e0d5] text-[#555] text-[13px] font-semibold rounded-full hover:border-[#c0555a] hover:text-[#c0555a] transition-all">
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold w-fit hover:underline">
              <Plus size={15} /> Add new address
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── wishlist tab ──────────────────────────────────────────────────────────────
// ── saved cards tab ────────────────────────────────────────────────────────────
function CardsTab() {
  return (
    <div className="p-6 flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#f3efe8] rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCard size={28} className="text-[#c0555a]" strokeWidth={1.5} />
      </div>
      <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2">No saved cards</h3>
      <p className="text-[13px] text-[#888] max-w-xs leading-relaxed mb-6">
        Your payment cards will be saved securely by Razorpay during checkout for faster future payments.
      </p>
      <div className="bg-[#f3efe8] border border-[#e8e0d5] rounded-xl px-5 py-4 flex items-start gap-3 max-w-sm text-left">
        <AlertCircle size={16} className="text-[#c0555a] flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#666] leading-relaxed">
          Cards are saved securely by Razorpay — we never store your card details on our servers. Your saved cards will appear here after your first online payment.
        </p>
      </div>
    </div>
  );
}

// ── coupons tab ────────────────────────────────────────────────────────────────
function CouponsTab() {
  const { subtotal } = useCartStore();
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validate = async (codeOverride?: string) => {
    const useCode = (codeOverride ?? code).trim();
    if (!useCode) return;
    setLoading(true); setMsg(null);
    try {
      const res  = await fetch("/api/coupons/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: useCode.toUpperCase(), subtotal: subtotal || 0 }),
      });
      const data = await res.json();
      if (data.valid) setMsg({ type: "success", text: data.message || "Coupon is valid!" });
      else setMsg({ type: "error", text: data.error || "Invalid coupon code" });
    } catch {
      setMsg({ type: "error", text: "Could not check this coupon right now." });
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-5">My coupons</h3>

      {/* Check coupon */}
      <div className="bg-[#f3efe8] border border-[#e8e0d5] rounded-2xl p-5 mb-6">
        <p className="text-[13px] font-semibold text-[#555] mb-3">Have a coupon code?</p>
        <div className="flex gap-2">
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && validate()}
            placeholder="Enter coupon code"
            className="flex-1 border border-[#e8e0d5] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#c0555a] bg-white uppercase font-mono tracking-wider" />
          <button onClick={() => validate()} disabled={loading || !code.trim()}
            className="px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-xl hover:bg-[#a84449] disabled:opacity-50 transition-all">
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Check"}
          </button>
        </div>
        {subtotal === 0 && (
          <p className="text-[11px] text-[#aaa] mt-2">Your cart is empty — add items first to check eligibility against your real order.</p>
        )}
        {msg && (
          <p className={`text-[12px] mt-2 font-medium flex items-center gap-1.5 ${msg.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {msg.type === "success" ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
            {msg.text}
          </p>
        )}
      </div>

      {/* Real available coupons — pulled live from the database, not hardcoded */}
      <AvailableCoupons
        subtotal={subtotal || undefined}
        onApply={(c) => { setCode(c); validate(c); }}
        collapsedCount={2}
      />
    </div>
  );
}

function WishlistTab() {
  const [items,   setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist").then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : [])))
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (productId: number) => {
    await fetch("/api/wishlist/remove", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems(p => p.filter(i => i.productId !== productId));
  };

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-[#e8e0d5] rounded-2xl animate-pulse" />)}
    </div>
  );

  if (items.length === 0) return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] p-12 text-center">
      <Heart size={40} className="text-[#e8e0d5] mx-auto mb-4" strokeWidth={1.5} />
      <p className="text-[16px] font-bold text-[#1a1a1a] mb-2">Your wishlist is empty</p>
      <p className="text-[13px] text-[#888] mb-5">Save gifts you love for later</p>
      <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all">
        Browse gifts
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(item => (
        <div key={item.id} className="group relative bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden">
          <Link href={`/product/${item.product.slug}`}>
            <div className="relative aspect-square bg-[#f8f5f0]">
              <Image src={item.product.images?.[0] || "/placeholder.jpg"} alt={item.product.name}
                fill className="object-cover group-hover:scale-[1.04] transition-transform duration-500" sizes="300px" />
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-[#1a1a1a] capitalize line-clamp-2 leading-snug">{item.product.name}</p>
              <p className="text-[14px] font-bold text-[#c0555a] mt-1">{formatPrice(item.product.price)}</p>
            </div>
          </Link>
          <button onClick={() => removeItem(item.productId)}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all">
            <X size={13} className="text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function AccountClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab   = (searchParams?.get("tab") as Tab) || "profile";
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?callbackUrl=/account");
  }, [status]);

  if (status === "loading") return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#c0555a]" />
    </div>
  );

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-6">
          <Link href="/" className="hover:text-[#c0555a] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium">My account</span>
        </nav>

        {/* xl instead of lg — an iPad Pro in portrait matches lg (1024px)
            and was squeezing a fixed 260px sidebar beside cramped content
            instead of stacking, on a screen that's actually tall/narrow. */}
        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <div className="xl:sticky xl:top-6 xl:self-start">
            <Sidebar tab={tab} setTab={setTab} session={session} />
          </div>

          {/* Content */}
          <div>
            {tab === "profile"   && <ProfileTab   session={session} />}
            {tab === "orders"    && <OrdersTab   />}
            {tab === "addresses" && <AddressesTab />}
            {tab === "cards"     && <CardsTab     />}
            {tab === "coupons"   && <CouponsTab   />}
            {tab === "wishlist"  && <WishlistTab  />}
          </div>
        </div>
      </div>
    </div>
  );
}