"use client";

import { useEffect, useRef } from "react";

const brands = [
  {
    name: "Tata",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/200px-Tata_logo.svg.png",
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
    name: "Fortis",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Fortis_Healthcare_logo.svg/200px-Fortis_Healthcare_logo.svg.png",
  },
  {
    name: "Max",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Max_logo.svg/200px-Max_logo.svg.png",
  },
  {
    name: "HDFC Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/200px-HDFC_Bank_Logo.svg.png",
  },
  {
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/200px-Infosys_logo.svg.png",
  },
  {
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/200px-Wipro_Primary_Logo_Color_RGB.svg.png",
  },
  {
    name: "Maruti Suzuki",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Maruti_Suzuki_Logo.svg/200px-Maruti_Suzuki_Logo.svg.png",
  },
  {
    name: "Mahindra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Mahindra_Logo.svg/200px-Mahindra_Logo.svg.png",
  },
];

const caveatFont = { fontFamily: "var(--font-caveat)" };

export default function BrandLogos() {
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

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

        {/* ── MARQUEE TRACK ── */}
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

          {/* TRACK */}
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee-brands gap-16 md:gap-24 items-center whitespace-nowrap">
              {[...brands, ...brands].map((brand, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center justify-center group"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-8 md:h-10 w-auto object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    draggable={false}
                    onError={(e) => {
                      // fallback to text if image fails
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span style="font-family:var(--font-prompt);font-size:18px;font-weight:700;color:#999;letter-spacing:1px;">${brand.name}</span>`;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
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

      {/* ── CSS ANIMATION ── */}
      <style>{`
        @keyframes marquee-brands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
