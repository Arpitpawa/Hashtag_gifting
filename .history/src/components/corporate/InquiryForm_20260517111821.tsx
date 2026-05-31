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

    const message = `
🎁 *New Corporate Gifting Inquiry*
━━━━━━━━━━━━━━━━━━
👤 *Name:* ${form.name}
📞 *Phone:* ${form.phone}
🏢 *Company:* ${form.company}
📧 *Email:* ${form.email}
💰 *Budget per hamper:* ${form.budget}
📦 *No. of gifts:* ${form.quantity}
💬 *Message:* ${form.message || "No message"}
━━━━━━━━━━━━━━━━━━
    `.trim();

    const whatsappUrl = `https://wa.me/917665909909?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setSubmitted(true);
  };

  return (
    <section id="inquiry" className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* ── LEFT — stats cards ── */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`border border-[#e0d8ce] rounded-2xl p-6 md:p-8 flex flex-col justify-between bg-white ${
                  i === 1 || i === 3 ? "mt-8" : ""
                }`}
                style={{ minHeight: "160px" }}
              >
                <span
                  className="text-4xl md:text-5xl font-light text-[#1a1a1a] leading-none"
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

          {/* ── RIGHT — form ── */}
          <div>
            <h2
              className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] mb-8 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Corporate gifting inquiry
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#c0555a] flex items-center justify-center mb-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold text-[#1a1a1a] mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Inquiry sent!
                </h3>
                <p className="text-[#6b6b6b] text-[14px] mb-6">
                  WhatsApp has opened with your details. Our team will respond
                  within 2 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      name: "",
                      phone: "",
                      company: "",
                      email: "",
                      budget: "",
                      quantity: "",
                      message: "",
                    });
                  }}
                  className="px-6 py-3 border-2 border-[#c0555a] text-[#c0555a] text-[13px] font-semibold rounded-full hover:bg-[#c0555a] hover:text-white transition-all duration-300"
                >
                  Submit another inquiry
                </button>
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
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c0555a] transition-colors bg-white placeholder:text-[#ccc]"
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
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c0555a] transition-colors bg-white placeholder:text-[#ccc]"
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
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c0555a] transition-colors bg-white placeholder:text-[#ccc]"
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
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c0555a] transition-colors bg-white placeholder:text-[#ccc]"
                    />
                  </div>
                </div>

                {/* ROW 3 — Budget + Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Approx. budget (per hamper){" "}
                      <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rs. 500 – 1000"
                      value={form.budget}
                      onChange={(e) =>
                        setForm({ ...form, budget: e.target.value })
                      }
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c0555a] transition-colors bg-white placeholder:text-[#bbb]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                      Approx. no. of gifts{" "}
                      <span className="text-[#c0555a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c0555a] transition-colors bg-white placeholder:text-[#bbb]"
                    />
                  </div>
                </div>

                {/* ROW 4 — Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about your requirements..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="border border-[#e0d8ce] rounded-lg px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#c0555a] transition-colors bg-white placeholder:text-[#bbb] resize-none"
                  />
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="w-full py-4 bg-[#c0555a] text-white text-[14px] font-semibold tracking-wider hover:bg-[#a84449] transition-colors duration-300 rounded-lg flex items-center justify-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Send inquiry on WhatsApp
                </button>

                <p className="text-[11px] text-[#aaa] text-center">
                  Clicking submit will open WhatsApp with your details
                  pre-filled. We'll respond within 2 hours (9am – 8pm).
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
