"use client";

const brands = [
  {
    name: "Tata Motors",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/120px-Tata_logo.svg.png",
  },
  {
    name: "Apollo Hospitals",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Apollo_Hospitals_Logo.svg/200px-Apollo_Hospitals_Logo.svg.png",
  },
  {
    name: "Mahindra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mahindra_Rise_Logo.svg/200px-Mahindra_Rise_Logo.svg.png",
  },
  {
    name: "Fortis Hospitals",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Fortis_Healthcare_logo.svg/200px-Fortis_Healthcare_logo.svg.png",
  },
  {
    name: "Jio",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Jio_logo.svg/200px-Jio_logo.svg.png",
  },
  {
    name: "Reliance",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Reliance_Industries_Logo.svg/200px-Reliance_Industries_Logo.svg.png",
  },
  {
    name: "Max",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Max_Healthcare_logo.svg/200px-Max_Healthcare_logo.svg.png",
  },
];

const caveatFont = { fontFamily: "var(--font-caveat)" };

// Duplicate 4x for seamless infinite loop
const allBrands = [...brands, ...brands, ...brands, ...brands];

export default function BrandLogos() {
  return (
    <section className="pt-0 pb-16 md:pb-20 relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        {/* ── HEADING ── */}
        <div className="text-center mb-12 md:mb-14">
          <span
            className="inline-block text-[#c4922a] text-lg md:text-xl italic mb-3 font-light"
            style={caveatFont}
          >
            our happy clients
          </span>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight"
            style={caveatFont}
          >
            Trusted by Leading Brands
          </h2>
          <p className="text-[#6b6b6b] text-base md:text-lg mt-4 max-w-md mx-auto">
            We've proudly gifted for companies and organizations across India
          </p>
        </div>

        {/* ── MARQUEE ── */}
        <div className="relative">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, var(--background), transparent)",
            }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, var(--background), transparent)",
            }}
          />

          <div className="flex overflow-hidden py-4">
            <div className="flex animate-marquee-brands gap-16 md:gap-28 items-center">
              {allBrands.map((brand, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center justify-center group cursor-default"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 md:h-14 w-auto max-w-[120px] md:max-w-[150px] object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    draggable={false}
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span style="font-family:var(--font-prompt);font-size:16px;font-weight:700;color:#aaa;letter-spacing:1px;white-space:nowrap;">${brand.name}</span>`;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
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
              <span className="text-[13px] md:text-[14px] text-[#6b6b6b] font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-brands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-brands {
          animation: marquee-brands 20s linear infinite;
        }
        .animate-marquee-brands:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
