"use client";

import { useState } from "react";

const stats = [
  { number: "5 lakh+", label: "Gifts delivered" },
  { number: "98%", label: "Client satisfaction rate" },
  { number: "2k+", label: "Corporate partnerships" },
  { number: "8+", label: "Years of experience" },
];

export default function InquiryForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    company: "",
    email: "",
    budget: "",
    quantity: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="inquiry" className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── LEFT — stats cards like reference ── */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`border border-[#e0d8ce] rounded-2xl p-6 md:p-8 flex flex-col justify-between ${
                  i === 1 || i === 3 ? "mt-8" : ""
                }`}
                style={{ minHeight: "160px" }}
              >
                <span
                  className="text-4xl md:text-5xl font-light text-[#c4922a] leading-none"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.number}
                </span>
                <p className="text-[13px] md:text-[14px] font-semibold text-[#555] mt-4 tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── RIGHT — inquiry form ── */}
          <div>
            {/* HEADING */}
            <h2
              className="text-4xl md:text-5xl font-semibold text-[#c4922a] mb-8 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Corporate gifting inquiry
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#c0555a] flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold text-[#1a1a1a] mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Inquiry received!
                </h3>
                <p className="text-[#6b6b6b] text-[14px]">
                  Our team will contact you within 2 hours on WhatsApp or email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* ROW 1 — Name + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Name <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c4922a] transition-colors bg-white placeholder:text-[#ccc]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Phone number <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c4922a] transition-colors bg-white placeholder:text-[#ccc]"
                    />
                  </div>
                </div>

                {/* ROW 2 — Company + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Company name <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c4922a] transition-colors bg-white placeholder:text-[#ccc]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Email ID <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c4922a] transition-colors bg-white placeholder:text-[#ccc]"
                    />
                  </div>
                </div>

                {/* ROW 3 — Budget + Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Approx. budget (per hamper) <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rs. 500 – 1000"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c4922a] transition-colors bg-white placeholder:text-[#bbb]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Approx. no. of gifts <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c4922a] transition-colors bg-white placeholder:text-[#bbb]"
                    />
                  </div>
                </div>

                {/* ROW 4 — Message full width */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about your requirements..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c4922a] transition-colors bg-white placeholder:text-[#bbb] resize-none"
                  />
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="w-full py-4 bg-[#c4922a] text-white text-[14px] font-semibold tracking-wider hover:bg-[#b07d22] transition-colors duration-300 rounded-lg"
                >
                  Submit
                </button>

                <p className="text-[11px] text-[#aaa] text-center">
                  We'll respond within 2 hours during business hours (9am – 8pm)
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}