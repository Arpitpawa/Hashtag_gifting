"use client";

import { useState, useEffect } from "react";
import { useSession }          from "next-auth/react";
import { useRouter }           from "next/navigation";
import Link                    from "next/link";
import Image                   from "next/image";
import {
  MapPin, Plus, CreditCard, Truck,
  ShieldCheck, ChevronRight, Loader2,
  CheckCircle, Tag, X, Package,
  Phone, User, Home, Building,
  ArrowLeft, BadgeCheck, Edit2,
} from "lucide-react";
import { useCartStore, formatPrice } from "@/lib/store/cartStore";
import { isValidPincode } from "@/lib/helpers";
import AvailableCoupons from "@/components/shared/AvailableCoupons";
import GiftNoteField from "@/components/shared/GiftNoteField";

// ── types ─────────────────────────────────────────────────────────────────────
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

interface FormData {
  name:    string;
  phone:   string;
  street:  string;
  city:    string;
  state:   string;
  pincode: string;
}

// ── step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Address"  },
    { n: 2, label: "Payment"  },
    { n: 3, label: "Confirm"  },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
              step > s.n  ? "bg-green-500 border-green-500 text-white"
              : step === s.n ? "bg-[#c0555a] border-[#c0555a] text-white"
              : "bg-white border-[#e8e0d5] text-[#aaa]"
            }`}>
              {step > s.n ? <CheckCircle size={14} /> : s.n}
            </div>
            <span className={`text-[11px] font-semibold whitespace-nowrap ${
              step >= s.n ? "text-[#1a1a1a]" : "text-[#aaa]"
            }`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-5 mx-2 rounded-full ${
              step > s.n ? "bg-green-500" : "bg-[#e8e0d5]"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── address card ──────────────────────────────────────────────────────────────
function AddressCard({
  address, selected, onSelect,
}: { address: Address; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        selected ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e0d5] hover:border-[#c0555a]/40 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          selected ? "border-[#c0555a] bg-[#c0555a]" : "border-[#e8e0d5]"
        }`}>
          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[14px] font-semibold text-[#1a1a1a]">{address.name}</p>
            {address.isDefault && (
              <span className="text-[10px] font-bold text-[#c0555a] bg-[#c0555a]/10 px-2 py-0.5 rounded-full">Default</span>
            )}
          </div>
          <p className="text-[13px] text-[#666] leading-snug">{address.street}</p>
          <p className="text-[13px] text-[#666]">{address.city}, {address.state} - {address.pincode}</p>
          <div className="flex items-center gap-1 mt-1">
            <Phone size={11} className="text-[#aaa]" />
            <p className="text-[12px] text-[#888]">{address.phone}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── address form ──────────────────────────────────────────────────────────────
function AddressForm({
  data, errors, onChange,
}: {
  data:     FormData;
  errors:   Partial<FormData>;
  onChange: (key: keyof FormData, val: string) => void;
}) {
  const fields: { key: keyof FormData; label: string; placeholder: string; icon: React.ReactNode; type?: string; maxLength?: number }[] = [
    { key: "name",    label: "Full name",     placeholder: "e.g. Priya Sharma",        icon: <User    size={14} /> },
    { key: "phone",   label: "Phone number",  placeholder: "10-digit mobile number",   icon: <Phone   size={14} />, type: "tel", maxLength: 10 },
    { key: "street",  label: "Street address",placeholder: "House no., area, landmark",icon: <Home    size={14} /> },
    { key: "city",    label: "City",          placeholder: "e.g. Jaipur",              icon: <Building size={14} /> },
    { key: "state",   label: "State",         placeholder: "e.g. Rajasthan",           icon: <MapPin  size={14} /> },
    { key: "pincode", label: "Pincode",       placeholder: "6-digit pincode",          icon: <MapPin  size={14} />, type: "tel", maxLength: 6 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.key} className={f.key === "street" ? "md:col-span-2" : ""}>
          <label className="text-[12px] font-semibold text-[#555] mb-1.5 block">{f.label}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]">{f.icon}</span>
            <input
              type={f.type || "text"}
              value={data[f.key]}
              maxLength={f.maxLength}
              onChange={(e) => onChange(f.key, f.key === "phone" || f.key === "pincode"
                ? e.target.value.replace(/\D/g, "")
                : e.target.value
              )}
              placeholder={f.placeholder}
              className={`w-full pl-9 pr-4 py-3 border rounded-xl text-[14px] outline-none transition-colors bg-white ${
                errors[f.key] ? "border-red-400" : "border-[#e8e0d5] focus:border-[#c0555a]"
              }`}
            />
          </div>
          {errors[f.key] && <p className="text-[11px] text-red-500 mt-1">{errors[f.key]}</p>}
        </div>
      ))}
    </div>
  );
}

// ── order summary sidebar ─────────────────────────────────────────────────────
function OrderSummary({
  items, subtotal, discount, coupon, onApplyCoupon, onRemoveCoupon,
}: {
  items:          any[];
  subtotal:       number;
  discount:       number;
  coupon:         { code: string; discount: number; id: number } | null;
  onApplyCoupon:  (code: string, discount: number, id: number) => void;
  onRemoveCoupon: () => void;
}) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const finalTotal = Math.max(0, subtotal - discount);
  const freeShip   = finalTotal >= 99900;

  const apply = async (codeOverride?: string) => {
    const useCode = (codeOverride ?? code).trim();
    if (!useCode) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/coupons/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: useCode.toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) { onApplyCoupon(useCode.toUpperCase(), data.discount, data.couponId); setCode(""); }
      else setError(data.message || "Invalid coupon");
    } catch { setError("Could not apply coupon."); }
    finally   { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Items */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
        <h3 className="text-[14px] font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
          <Package size={16} className="text-[#c0555a]" />
          Order summary ({items.length} {items.length === 1 ? "item" : "items"})
        </h3>
        <div className="flex flex-col gap-3 max-h-[35vh] sm:max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f8f5f0] flex-shrink-0 border border-[#e8e0d5]">
                <Image src={item.product.images?.[0] || "/placeholder.jpg"} alt={item.product.name}
                  fill className="object-cover" sizes="56px" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c0555a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#1a1a1a] capitalize line-clamp-2 leading-snug">
                  {item.product.name}
                </p>
                {item.customization && (
                  <p className="text-[11px] text-[#aaa] mt-0.5 truncate">
                    {Object.entries(item.customization)
                      .filter(([k,v]) => {
                        // Kept in sync with the equivalent exclusion lists in
                        // the cart page and admin/customer order detail pages.
                        const excluded = [
                          "photoUrl", "giftWrap", "greetingCard", "photo_upload", "preview_png",
                          "variantSelections", "isHamper", "hamperRef", "role",
                        ];
                        if (excluded.includes(k)) return false;
                        if (!v) return false;
                        if (typeof v === "string" && v.startsWith("data:")) return false;
                        if (typeof v === "object") return false;
                        return true;
                      })
                      .map(([,v]) => v).join(" · ")}
                  </p>
                )}
              </div>
              <p className="text-[13px] font-bold text-[#1a1a1a] flex-shrink-0">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
        {coupon ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-green-600" />
              <span className="text-[13px] font-bold text-green-700">{coupon.code}</span>
              <span className="text-[12px] text-green-600">applied</span>
            </div>
            <button onClick={onRemoveCoupon} aria-label="Close"><X size={14} className="text-[#aaa] hover:text-red-500" /></button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input type="text" value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && apply()}
                  placeholder="Coupon code"
                  className="w-full pl-8 pr-3 py-2.5 border border-[#e8e0d5] rounded-xl text-[13px] outline-none focus:border-[#c0555a] bg-white transition-colors"
                />
              </div>
              <button onClick={() => apply()} disabled={loading || !code.trim()}
                className="px-4 py-2.5 bg-[#c0555a] text-white text-[12px] font-bold rounded-xl hover:bg-[#a84449] disabled:opacity-50 transition-colors">
                {loading ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            {error && <p className="text-[11px] text-red-500">{error}</p>}
            <AvailableCoupons
              subtotal={subtotal}
              onApply={(c) => apply(c)}
              className="mt-2"
            />
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#888]">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[13px]">
              <span className="text-green-600">Coupon discount</span>
              <span className="font-semibold text-green-600">- {formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px]">
            <span className="text-[#888]">Delivery</span>
            {freeShip
              ? <span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Free</span>
              : <span className="text-[#888]">Rs. 99</span>}
          </div>
          {!freeShip && (
            <p className="text-[11px] text-[#c0555a] bg-[#c0555a]/5 px-3 py-1.5 rounded-xl">
              Add Rs. {Math.ceil((99900 - finalTotal) / 100)} more for free delivery
            </p>
          )}
          <div className="flex justify-between text-[16px] font-bold pt-3 border-t border-[#e8e0d5]">
            <span>Total</span>
            <span className="text-[#c0555a]">{formatPrice(finalTotal + (freeShip ? 0 : 9900))}</span>
          </div>
        </div>
      </div>

      {/* Trust */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] p-4">
        {[
          { icon: <ShieldCheck size={14} className="text-[#c0555a]" />, text: "100% secure & encrypted payment" },
          { icon: <BadgeCheck  size={14} className="text-[#c0555a]" />, text: "Quality guaranteed or money back" },
          { icon: <Truck       size={14} className="text-[#c0555a]" />, text: "Fast dispatch within 24–48 hours" },
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[12px] text-[#666] mb-2 last:mb-0">
            {t.icon} {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN CHECKOUT ─────────────────────────────────────────────────────────────
export default function CheckoutClient() {
  const { data: session }  = useSession();
  const router             = useRouter();
  const {
    items, subtotal, itemCount, cartId, clearCart, giftNote,
    appliedCoupon: coupon, setAppliedCoupon: setCoupon,
  } = useCartStore();

  const [step,      setStep]      = useState<1|2|3>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selAddrId, setSelAddrId] = useState<number | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [saveAddr,  setSaveAddr]  = useState(true);
  const [formData,  setFormData]  = useState<FormData>({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
  const [formErrs,  setFormErrs]  = useState<Partial<FormData>>({});
  const [payMethod, setPayMethod] = useState<"online"|"cod">("online");
  const [placing,   setPlacing]   = useState(false);
  const [error,     setError]     = useState("");

  const discount   = coupon?.discount ?? 0;
  const freeShip   = Math.max(0, subtotal - discount) >= 99900;
  const delivery   = freeShip ? 0 : 9900;
  const finalTotal = Math.max(0, subtotal - discount) + delivery;

  // Redirect if cart empty
  useEffect(() => {
    if (itemCount === 0) router.replace("/cart");
  }, [itemCount]);

  // Load saved addresses
  useEffect(() => {
    if (!session) return;
    fetch("/api/auth/addresses").then(r => r.json()).then((data) => {
      if (Array.isArray(data)) {
        setAddresses(data);
        const def = data.find((a: Address) => a.isDefault);
        if (def) { setSelAddrId(def.id); setShowForm(false); }
        else if (data.length === 0) setShowForm(true);
      }
    });
  }, [session]);

  // Pre-fill form from session
  useEffect(() => {
    if (session?.user) {
      setFormData(f => ({ ...f, name: session.user?.name || "" }));
    }
  }, [session]);

  // If not logged in, show form
  useEffect(() => {
    if (!session) setShowForm(true);
  }, [session]);

  const updateForm = (key: keyof FormData, val: string) => {
    setFormData(f => ({ ...f, [key]: val }));
    setFormErrs(e => ({ ...e, [key]: "" }));
  };

  const validateForm = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!formData.name.trim())                          errs.name    = "Full name is required";
    if (!/^\d{10}$/.test(formData.phone))               errs.phone   = "Enter a valid 10-digit number";
    if (!formData.street.trim())                        errs.street  = "Street address is required";
    if (!formData.city.trim())                          errs.city    = "City is required";
    if (!formData.state.trim())                         errs.state   = "State is required";
    if (!isValidPincode(formData.pincode))               errs.pincode = "Enter a valid 6-digit pincode";
    setFormErrs(errs);
    return Object.keys(errs).length === 0;
  };

  const getAddressSnapshot = () => {
    if (selAddrId) {
      const a = addresses.find(a => a.id === selAddrId);
      return a ? { name: a.name, phone: a.phone, street: a.street, city: a.city, state: a.state, pincode: a.pincode } : null;
    }
    return formData;
  };

  const handleStep1 = async () => {
    if (showForm || !selAddrId) {
      if (!validateForm()) return;
      // Save address if logged in and checkbox checked
      if (saveAddr && session) {
        try {
          const res = await fetch("/api/auth/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name:      formData.name,
              phone:     formData.phone,
              street:    formData.street,
              city:      formData.city,
              state:     formData.state,
              pincode:   formData.pincode,
              isDefault: addresses.length === 0,
            }),
          });
          const saved = await res.json();
          if (saved?.id) {
            setAddresses(prev => [...prev, saved]);
            setSelAddrId(saved.id);
            setShowForm(false);
          }
        } catch {}
      }
    }
    setStep(2);
  };

  const loadRazorpay = (): Promise<boolean> =>
    new Promise(resolve => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePlaceOrder = async () => {
    const addrSnap = getAddressSnapshot();
    if (!addrSnap) { setError("Please select or enter a delivery address."); return; }

    setPlacing(true); setError("");

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            productId:     i.productId,
            variantId:     i.variantId ?? null,
            quantity:      i.quantity,
            // A selected variant's own price governs this item — sending
            // the base product's price here regardless used to mean any
            // variant with its own price was silently charged the wrong
            // amount (and would actually get rejected by the server's
            // price-integrity check once that's compared correctly).
            price:         i.variant?.price ?? i.product.price,
            customization: i.customization,
          })),
          totalAmount:     finalTotal,
          paymentMethod:   payMethod,
          addressSnapshot: addrSnap,
          addressId:       selAddrId || null,
          couponCode:      coupon?.code  || null,
          couponId:        coupon?.id    || null,
          couponDiscount:  coupon?.discount || null,
          giftNote:        giftNote.trim() || null,
          cartId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      // ── COD ──
      if (payMethod === "cod") {
        await clearCart();
        router.push(`/order/success?orderId=${data.orderId}&method=cod`);
        return;
      }

      // ── ONLINE — open Razorpay ──
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Payment gateway failed to load. Please try again.");

      const { razorpay: rp } = data;
      const rzp = new (window as any).Razorpay({
        key:         rp.key,
        amount:      rp.amount,
        currency:    rp.currency,
        order_id:    rp.orderId,
        name:        "Hashtag Gifting",
        description: "Personalised gifts with love",
        image:       "/logo.png",
        prefill:     rp.prefill,
        theme:       rp.theme,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             data.orderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await clearCart();
            router.push(`/order/success?orderId=${data.orderId}&method=online`);
          } else {
            setError("Payment verification failed. Contact support if amount was deducted.");
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => { setPlacing(false); },
        },
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  if (itemCount === 0) return null;

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#aaa] mb-6">
          <Link href="/"    className="hover:text-[#c0555a] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-[#c0555a] transition-colors">Cart</Link>
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium">Checkout</span>
        </nav>

        <StepBar step={step} />

        {/* xl instead of lg — an iPad Pro in portrait (1024px) was matching
            lg and getting squeezed into a two-column layout meant for wide
            desktop screens, with a sticky order summary pinned beside a
            cramped form column instead of stacking naturally. */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-5">

            {/* ── STEP 1: ADDRESS ── */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
                <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-5 flex items-center gap-2">
                  <MapPin size={18} className="text-[#c0555a]" /> Delivery address
                </h2>

                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <div className="flex flex-col gap-3 mb-5">
                    {addresses.map(addr => (
                      <AddressCard key={addr.id} address={addr} selected={selAddrId === addr.id && !showForm}
                        onSelect={() => { setSelAddrId(addr.id); setShowForm(false); }} />
                    ))}
                    <button onClick={() => { setShowForm(true); setSelAddrId(null); }}
                      className="flex items-center gap-2 text-[13px] text-[#c0555a] font-semibold hover:underline w-fit">
                      <Plus size={14} /> Add new address
                    </button>
                  </div>
                )}

                {/* Form */}
                {(showForm || addresses.length === 0) && (
                  <div>
                    {addresses.length > 0 && (
                      <p className="text-[14px] font-semibold text-[#1a1a1a] mb-4">New address</p>
                    )}
                    <AddressForm data={formData} errors={formErrs} onChange={updateForm} />
                    {/* Save address for logged in users */}
                    {session && (
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#c0555a]" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} />
                        <span className="text-[13px] text-[#555]">Save this address for future orders</span>
                      </label>
                    )}
                  </div>
                )}

                {/* Gift note — order-level (not tied to the address), shared
                    with the product/cart pages via the cart store, so it
                    survives whether the customer picks a saved address or
                    fills the form, and whatever they wrote earlier is
                    already here. */}
                <div className="mt-6 pt-5 border-t border-[#f0ece6]">
                  <GiftNoteField bordered={false} />
                </div>

                <button onClick={handleStep1}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] transition-all">
                  Continue to payment <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── STEP 2: PAYMENT ── */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                {/* Address summary */}
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">{getAddressSnapshot()?.name}</p>
                      <p className="text-[12px] text-[#888]">{getAddressSnapshot()?.street}, {getAddressSnapshot()?.city}</p>
                      <p className="text-[12px] text-[#888]">{getAddressSnapshot()?.state} - {getAddressSnapshot()?.pincode}</p>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[12px] text-[#c0555a] font-semibold flex items-center gap-1 hover:underline flex-shrink-0">
                    <Edit2 size={12} /> Change
                  </button>
                </div>

                {/* Payment method */}
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
                  <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-5 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#c0555a]" /> Payment method
                  </h2>

                  <div className="flex flex-col gap-3">
                    {/* Online */}
                    <button onClick={() => setPayMethod("online")}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        payMethod === "online" ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e0d5] hover:border-[#c0555a]/40"
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        payMethod === "online" ? "border-[#c0555a] bg-[#c0555a]" : "border-[#e8e0d5]"
                      }`}>
                        {payMethod === "online" && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[14px] font-bold text-[#1a1a1a]">Pay online</p>
                        <p className="text-[12px] text-[#888]">UPI, cards, net banking, wallets via Razorpay</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Recommended</span>
                      </div>
                    </button>

                    {/* COD */}
                    <button onClick={() => setPayMethod("cod")}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        payMethod === "cod" ? "border-[#c0555a] bg-[#c0555a]/5" : "border-[#e8e0d5] hover:border-[#c0555a]/40"
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        payMethod === "cod" ? "border-[#c0555a] bg-[#c0555a]" : "border-[#e8e0d5]"
                      }`}>
                        {payMethod === "cod" && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[14px] font-bold text-[#1a1a1a]">Cash on delivery</p>
                        <p className="text-[12px] text-[#888]">Pay when your order arrives</p>
                      </div>
                      <Truck size={18} className="text-[#aaa] flex-shrink-0" />
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Place order */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[15px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-70 active:scale-[0.98]"
                  >
                    {placing ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : payMethod === "online" ? (
                      <><CreditCard size={18} /> Pay {formatPrice(finalTotal)}</>
                    ) : (
                      <><Package size={18} /> Place order — {formatPrice(finalTotal)}</>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-[#aaa] mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Your payment is 100% secure
                  </p>
                </div>

                <button onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-[13px] text-[#888] hover:text-[#c0555a] transition-colors w-fit">
                  <ArrowLeft size={14} /> Back to address
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT — order summary ── */}
          <div className="xl:sticky xl:top-6">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              discount={discount}
              coupon={coupon}
              onApplyCoupon={(code, disc, id) => setCoupon({ code, discount: disc, id })}
              onRemoveCoupon={() => setCoupon(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}