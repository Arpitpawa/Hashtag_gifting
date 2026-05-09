"use client";

const brands = [
  {
    name: "TATA",
    style: { fontSize: "22px", fontWeight: "800", letterSpacing: "4px", color: "#1a1a2e" },
  },
  {
    name: "Mahindra",
    style: { fontSize: "18px", fontWeight: "700", letterSpacing: "2px", color: "#d32f2f" },
  },
  {
    name: "HDFC Bank",
    style: { fontSize: "16px", fontWeight: "800", letterSpacing: "1px", color: "#004c8f" },
  },
  {
    name: "Infosys",
    style: { fontSize: "20px", fontWeight: "700", letterSpacing: "1px", color: "#007cc3" },
  },
  {
    name: "Wipro",
    style: { fontSize: "22px", fontWeight: "700", letterSpacing: "2px", color: "#341f6a" },
  },
  {
    name: "ICICI Bank",
    style: { fontSize: "15px", fontWeight: "800", letterSpacing: "1px", color: "#f47721" },
  },
  {
    name: "Reliance",
    style: { fontSize: "18px", fontWeight: "700", letterSpacing: "2px", color: "#003087" },
  },
  {
    name: "Apollo",
    style: { fontSize: "20px", fontWeight: "700", letterSpacing: "2px", color: "#0066b3" },
  },
  {
    name: "Bajaj",
    style: { fontSize: "22px", fontWeight: "800", letterSpacing: "3px", color: "#003087" },
  },
  {
    name: "HCL",
    style: { fontSize: "26px", fontWeight: "900", letterSpacing: "3px", color: "#0076ce" },
  },
  {
    name: "Tech\nMahindra",
    style: { fontSize: "15px", fontWeight: "800", letterSpacing: "1px", color: "#d32f2f", whiteSpace: "pre-line", textAlign: "center" as const },
  },
  {
    name: "Fortis",
    style: { fontSize: "22px", fontWeight: "700", letterSpacing: "2px", color: "#e31837" },
  },
];

const promptFont = { fontFamily: "var(--font-prompt)" };
const caveatFont = { fontFamily: "var(--font-caveat)" };

const allBrands = [...brands, ...brands, ...brands];

export default function BrandLogos() {
  return (
    <section className="py-16 md:py-20 bg-[#f3efe8] relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* HEADING */}
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-[#c4922a] text-sm uppercase tracking-[3px] font-medium mb-3"
            style={promptFont}
          >
            our happy clients
          </p>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight"
            style={caveatFont}
          >
            Trusted by Leading Brands
          </h2>
          <p
            className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto"
            style={promptFont}
          >
            We've proudly gifted for companies and organizations across India
          </p>
        </div>

        {/* MARQUEE */}
        <div className="relative">

          {/* Left fade */}
          <div
            className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #f3efe8, transparent)" }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #f3efe8, transparent)" }}
          />

          <div className="flex overflow-hidden py-3">
            <div className="flex animate-marquee-brands gap-4 items-center">
              {allBrands.map((brand, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[200px] h-[110px] bg-white rounded-2xl border border-[#e8e0d5] flex items-center justify-center px-6 shadow-sm hover:shadow-lg hover:scale-105 hover:border-[#ccc] transition-all duration-300 cursor-default"
                >
                  <span style={{ ...brand.style, fontFamily: "var(--font-prompt)" }}>
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-14 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { number: "500+", label: "Corporate Clients" },
            { number: "10,000+", label: "Bulk Orders Delivered" },
            { number: "50+", label: "Top Brands Gifted" },
            { number: "100%", label: "Custom Branded Packaging" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-4xl md:text-5xl font-bold text-[#2f3e7a]"
                style={caveatFont}
              >
                {stat.number}
              </span>
              <span
                className="text-[13px] md:text-[14px] text-[#6b6b6b] font-medium"
                style={promptFont}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes marquee-brands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-brands {
          animation: marquee-brands 28s linear infinite;
        }
        .animate-marquee-brands:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}