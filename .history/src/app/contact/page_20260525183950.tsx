import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
export const metadata: Metadata = { title: "Contact Us — Hashtag Gifting" };
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="bg-white border-b border-[#e8e0d5] py-12 text-center px-4">
        <h1 className="text-[36px] font-bold text-[#1a1a1a] mb-3">
          Contact us
        </h1>
        <p className="text-[15px] text-[#888]">
          We would love to hear from you
        </p>
      </div>
      <div className="max-w-[800px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {[
            {
              icon: <Phone size={20} className="text-[#c0555a]" />,
              title: "Call / WhatsApp",
              value: "+91 86400 30112",
              href: "tel:+917665909909",
            },
            {
              icon: <Mail size={20} className="text-[#c0555a]" />,
              title: "Email us",
              value: "hashtaggiftsupport@gmail.com",
              href: "mailto:hashtaggiftsupport@gmail.com",
            },
            {
              icon: <MapPin size={20} className="text-[#c0555a]" />,
              title: "Visit us",
              value: "Jaipur, Rajasthan, India",
              href: "https://maps.google.com/?q=Jaipur+Rajasthan",
            },
            {
              icon: <Clock size={20} className="text-[#c0555a]" />,
              title: "Working hours",
              value: "Mon – Sun, 9 AM – 9 PM",
              href: null,
            },
          ].map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#e8e0d5] p-6 flex items-start gap-4"
            >
              <div className="w-11 h-11 bg-[#c0555a]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                {c.icon}
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#aaa] uppercase tracking-wider mb-1">
                  {c.title}
                </p>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    className="text-[15px] font-semibold text-[#1a1a1a] hover:text-[#c0555a] transition-colors"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="text-[15px] font-semibold text-[#1a1a1a]">
                    {c.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#25D366] rounded-2xl p-8 text-center text-white">
          <MessageCircle size={32} className="mx-auto mb-3" />
          <h2 className="text-[20px] font-bold mb-2">
            Fastest response on WhatsApp
          </h2>
          <p className="text-white/80 text-[14px] mb-5">
            We typically reply within 15 minutes during working hours
          </p>
          <a
            href="https://wa.me/917665909909?text=Hi! I have a question about Hashtag Gifting."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#25D366] font-bold rounded-full hover:bg-[#f0fff0] transition-colors"
          >
            Chat now on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
