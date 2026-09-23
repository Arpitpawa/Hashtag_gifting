"use client";

import { useState } from "react";
import ThemedSelect from "@/components/shared/ThemedSelect";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, ArrowRight } from "lucide-react";

const FAQS = [
  { q: "How long does personalisation take?", a: "Most personalised products are ready within 4-8 hours. Complex orders may take up to 24 hours." },
  { q: "Can I change my order after placing it?", a: "Changes can be made within 1 hour of placing your order. After that, production may have started. WhatsApp us ASAP." },
  { q: "Do you deliver outside Jaipur?", a: "Yes! We ship pan India via trusted courier partners. Delivery takes 2-5 business days depending on your location." },
  { q: "What if my product arrives damaged?", a: "We'll send a free replacement immediately. Just WhatsApp us a photo within 48 hours of receiving your order." },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Could not send your message. Please try again or WhatsApp us.");
      else setSent(true);
    } catch {
      setError("Network error. Please try again or WhatsApp us.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#e8e0d5] py-14 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">Get in touch</p>
        <h1
          className="text-[36px] md:text-[48px] font-normal text-[#1a1a1a] mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          We'd love to hear from you
        </h1>
        <p className="text-[15px] text-[#888] max-w-lg mx-auto">
          Have a question, custom requirement or just want to say hi? We're here — always.
        </p>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">

          {/* ── Left: Contact info ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* WhatsApp — most prominent */}
            <a
              href="https://wa.me/917665909909?text=Hi! I have a question about Hashtag Gifting."
              target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 bg-[#25D366] rounded-2xl text-white hover:bg-[#1da851] transition-colors"
            >
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5 text-white/80">Fastest response</p>
                <p className="text-[15px] font-bold text-white">WhatsApp us</p>
                <p className="text-[12px] text-white/80 mt-0.5">+91 76659 09909 · Usually replies in 15 min</p>
              </div>
            </a>

            {/* Other contacts */}
            {[
              { icon: Phone,  label: "Call us",       value: "+91 76659 09909",                href: "tel:+917665909909",                     sub: "Mon – Sun, 9 AM – 9 PM" },
              { icon: Mail,   label: "Email us",       value: "hashtaggiftsupport@gmail.com",    href: "mailto:hashtaggiftsupport@gmail.com",    sub: "We reply within 4 hours" },
              { icon: MapPin, label: "Visit our store", value: "Shop no. 83, Roop Vandana Complex, Raja Park, Jaipur", href: "https://maps.google.com/?q=Shop+no.+83,+Roop+Vandana+Complex,+Arya+Samaj+Rd,+Gurunanakpura,+Raja+Park,+Jaipur,+Rajasthan+302004", sub: "Open daily 10 AM – 8 PM" },
              { icon: Clock,  label: "Working hours",  value: "Monday – Sunday",                href: null,                                    sub: "9:00 AM – 9:00 PM IST" },
            ].map(({ icon: Icon, label, value, href, sub }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-[#c0555a]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#c0555a]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wider mb-0.5">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-[14px] font-semibold text-[#1a1a1a] hover:text-[#c0555a] transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">{value}</p>
                  )}
                  <p className="text-[12px] text-[#aaa] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: Contact form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-7">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={30} className="text-green-600" />
                  </div>
                  <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-2">Message sent!</h3>
                  <p className="text-[14px] text-[#888] mb-6 max-w-xs">
                    We'll get back to you within 4 hours. For urgent matters, WhatsApp us directly.
                  </p>
                  <a
                    href="https://wa.me/917665909909"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white text-[13px] font-bold rounded-full hover:bg-[#1da851] transition-colors"
                  >
                    <MessageCircle size={15} /> Chat on WhatsApp
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-5">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Your name *</label>
                        <input
                          required value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Priya Sharma"
                          className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Phone number</label>
                        <input
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Email address *</label>
                      <input
                        required type="email" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="priya@email.com"
                        className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Subject</label>
                      <ThemedSelect
                        variant="field" align="left" placeholder="Select a topic…"
                        value={form.subject}
                        onChange={v => setForm(p => ({ ...p, subject: v }))}
                        options={[
                          { value: "order", label: "Order query / tracking" },
                          { value: "custom", label: "Custom / bulk order" },
                          { value: "corporate", label: "Corporate gifting" },
                          { value: "return", label: "Return / refund" },
                          { value: "other", label: "Something else" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1.5">Message *</label>
                      <textarea
                        required value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        rows={5} placeholder="Tell us how we can help you…"
                        className="w-full border border-[#e8e0d5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#c0555a] transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c0555a] text-white text-[14px] font-bold rounded-full hover:bg-[#a84449] transition-all disabled:opacity-60"
                    >
                      {loading ? "Sending…" : <><Send size={15} /> Send message</>}
                    </button>
                    {error && <p role="alert" className="text-center text-[12px] text-red-600">{error}</p>}
                    <p className="text-center text-[11px] text-[#aaa]">
                      For urgent queries, WhatsApp us — we reply faster there.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick FAQs ── */}
        <div className="mb-10">
          <h2
            className="text-[24px] font-normal text-[#1a1a1a] mb-6 text-center"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Quick answers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-5">
                <p className="text-[14px] font-bold text-[#1a1a1a] mb-2">{q}</p>
                <p className="text-[13px] text-[#666] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <a href="/faqs" className="inline-flex items-center gap-1.5 text-[13px] text-[#c0555a] font-semibold hover:underline">
              View all FAQs <ArrowRight size={13} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}