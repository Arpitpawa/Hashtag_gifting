import Image from "next/image";
import { CheckCircle } from "lucide-react";

const points = [
  { title: "Custom branding on everything", desc: "Logo, brand colors, custom messages on every product and packaging" },
  { title: "Dedicated account manager", desc: "A single point of contact for your entire bulk gifting journey" },
  { title: "No minimum order hassle", desc: "Start from just 25 pieces — scale up as you grow" },
  { title: "Quality guaranteed", desc: "Every product goes through quality check before dispatch" },
  { title: "Pan India delivery", desc: "We ship to all states — your team or clients, wherever they are" },
  { title: "Fast turnaround", desc: "5–7 working days for bulk custom orders, express available" },
];

export default function CorporateWhyUs() {
  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — image */}
          <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px]">
            <Image
              src="https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800"
              alt="What makes us unique"
              fill
              className="object-cover"
            />
            {/* Overlay card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-5">
              <p className="text-[13px] font-semibold text-[#1a1a1a] mb-1">Trusted by 50+ leading brands</p>
              <p className="text-[12px] text-[#6b6b6b]">Tata, Mahindra, Reliance, Fortis & more</p>
              <div className="flex gap-2 mt-3">
                {["T", "M", "R", "F", "J"].map((letter, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#c0555a]/10 border-2 border-white flex items-center justify-center text-[11px] font-bold text-[#c0555a]">
                    {letter}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                  50+
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — points */}
          <div>
            <span className="inline-block text-[#c4922a] text-lg italic mb-3 font-light" style={{ fontFamily: "var(--font-heading)" }}>
              Why choose us
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-8" style={{ fontFamily: "var(--font-heading)" }}>
              What makes us unique
            </h2>

            <div className="flex flex-col gap-5">
              {points.map((point, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <CheckCircle size={20} className="text-[#c0555a] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-[14px] font-semibold text-[#1a1a1a] mb-0.5">{point.title}</p>
                    <p className="text-[13px] text-[#6b6b6b]">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}