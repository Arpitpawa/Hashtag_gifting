"use client";

const brands = [
  {
    name: "Tata Motors",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/120px-Tata_logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Apollo Hospitals",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Apollo_Hospitals_Logo.svg/200px-Apollo_Hospitals_Logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Mahindra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mahindra_Rise_Logo.svg/200px-Mahindra_Rise_Logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Fortis Hospitals",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Fortis_Healthcare_logo.svg/200px-Fortis_Healthcare_logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Jio",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Jio_logo.svg/200px-Jio_logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Reliance",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Reliance_Industries_Logo.svg/200px-Reliance_Industries_Logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "HDFC Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/200px-HDFC_Bank_Logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/200px-Infosys_logo.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/200px-Wipro_Primary_Logo_Color_RGB.svg.png",
    bg: "#ffffff",
  },
  {
    name: "Bajaj",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bajaj_Auto_Logo.svg/200px-Bajaj_Auto_Logo.svg.png",
    bg: "#ffffff",
  },
];

const caveatFont = { fontFamily: "var(--font-caveat)" };

// Duplicate for seamless loop
const allBrands = [...brands, ...brands, ...brands];

export default function BrandLogos() {
  return (
    <section className="py-16 md:py-20 bg-[#f7f4ef] relative overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        {/* HEADING */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#c4922a] text-sm uppercase tracking-[3px] font-medium mb-3">
            our happy clients
          </p>
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

        {/* MARQUEE */}
        <div className="relative">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, #f7f4ef, transparent)",
            }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, #f7f4ef, transparent)",
            }}
          />

          <div className="flex overflow-hidden py-4">
            <div className="flex animate-marquee-brands gap-5 items-center">
              {allBrands.map((brand, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[160px] h-[100px] bg-white rounded-2xl border border-[#e8e0d5] flex items-center justify-center px-6 shadow-sm hover:shadow-md hover:border-[#ccc] transition-all duration-300 group cursor-default"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 w-auto max-w-[110px] object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    draggable={false}
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span style="font-family:var(--font-prompt);font-size:14px;font-weight:700;color:#aaa;letter-spacing:1px;text-align:center;">${brand.name}</span>`;
                      }
                    }}
                  />
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
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-brands {
          animation: marquee-brands 25s linear infinite;
        }
        .animate-marquee-brands:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
