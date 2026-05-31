"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function InquiryForm() {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "",
    quantity: "", budget: "", occasion: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="inquiry" className="pt-0 pb-16 md:pb-20 bg-[#1a1a1a]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-16">

        {/* HEADING */}
        <div className="mb-10">
          <span className="inline-block text-[#c4922a] text-lg italic mb-2 font-light" style={{ fontFamily: "var(--font-heading)" }}>
            Let's talk gifting
          </span>
          <h2 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Corporate gifting inquiry
          </h2>
          <p className="text-white/50 text-[14px]">
            Fill in your details and we'll get back within 2 hours
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#c0555a] flex items-center justify-center mb-4">
              <Send size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Inquiry received!
            </h3>
            <p className="text-white/50 text-[14px]">
              Our team will contact you within 2 hours on WhatsApp or email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name *"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors"
              />
              <input
                type="text"
                placeholder="Company name *"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email address *"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors"
              />
              <input
                type="tel"
                placeholder="Phone number *"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="bg-white/5 border border-white/10 text-white/70 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors"
              >
                <option value="" disabled>Quantity required *</option>
                <option value="25-50">25 – 50 pieces</option>
                <option value="50-100">50 – 100 pieces</option>
                <option value="100-500">100 – 500 pieces</option>
                <option value="500-1000">500 – 1000 pieces</option>
                <option value="1000+">1000+ pieces</option>
              </select>
              <select
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="bg-white/5 border border-white/10 text-white/70 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors"
              >
                <option value="" disabled>Budget per piece</option>
                <option value="under-500">Under Rs. 500</option>
                <option value="500-1000">Rs. 500 – 1000</option>
                <option value="1000-2000">Rs. 1000 – 2000</option>
                <option value="2000+">Rs. 2000+</option>
              </select>
            </div>

            <select
              value={form.occasion}
              onChange={(e) => setForm({ ...form, occasion: e.target.value })}
              className="bg-white/5 border border-white/10 text-white/70 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors"
            >
              <option value="" disabled>Occasion / purpose</option>
              <option>Employee onboarding</option>
              <option>Festival gifting (Diwali, etc)</option>
              <option>Client appreciation</option>
              <option>Work anniversary</option>
              <option>Team celebration</option>
              <option>Conference / event</option>
              <option>Other</option>
            </select>

            <textarea
              rows={4}
              placeholder="Tell us more about your requirements (optional)"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-[14px] px-4 py-3.5 rounded-xl outline-none focus:border-[#c0555a] transition-colors resize-none"
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#c0555a] text-white text-[14px] font-semibold rounded-xl hover:bg-[#a84449] transition-colors duration-300"
            >
              <Send size={16} />
              Submit inquiry
            </button>

            <p className="text-white/30 text-[11px] text-center">
              We'll respond within 2 hours during business hours (9am – 8pm)
            </p>
          </form>
        )}
      </div>
    </section>
  );
}