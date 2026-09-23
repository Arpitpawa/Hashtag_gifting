"use client";

const brands = [
  { name: "Tata",               logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg" },
  { name: "Mahindra",           logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/Mahindra_Rise_New_Logo.svg" },
  { name: "HDFC Bank",          logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" },
  { name: "Infosys",            logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "Wipro",              logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
  { name: "ICICI Bank",         logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg" },
  { name: "Reliance Jio",       logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Reliance_Jio_Logo.svg" },
  { name: "Aditya Birla Group", logo: "https://upload.wikimedia.org/wikipedia/en/7/75/Aditya_Birla_Group_Logo.svg" },
];

const duplicatedBrands = [...brands, ...brands];

export default function BrandClients() {
  return (
    <section className="py-20 bg-[#f3efe8] overflow-hidden">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[#c0555a] uppercase tracking-[4px] text-sm font-semibold mb-4">
            Brands that trust our gifting solutions
          </p>
          <h2
            className="text-[42px] md:text-[66px] font-normal text-[#111827]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Trusted By Leading Brands
          </h2>
          <p className="text-gray-500 text-lg mt-4">
            We proudly work with India's top companies
          </p>
        </div>

        {/* Logo Slider */}
        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#f3efe8] to-transparent z-10" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#f3efe8] to-transparent z-10" />
          <div className="overflow-hidden">
            <div className="flex animate-brand-slider w-max">
              {duplicatedBrands.map((brand, index) => (
                <div key={index}
                  className="flex items-center justify-center min-w-[220px] px-10 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
                  <img src={brand.logo} alt={brand.name}
                    className="h-10 md:h-12 object-contain w-auto"
                    draggable={false}
                    onError={(e) => {
                      // A hotlinked Wikimedia file can get renamed/moved out
                      // from under us at any time (this is exactly what
                      // happened to the old Mahindra logo URL) — rather than
                      // showing a broken-image icon + alt text on the
                      // homepage, fall back to a clean text badge with the
                      // brand name so the slider never looks broken.
                      const img = e.currentTarget;
                      img.style.display = "none";
                      const fallback = img.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <span
                    className="hidden items-center justify-center h-10 md:h-12 px-4 text-[15px] md:text-[17px] font-semibold text-[#555] whitespace-nowrap"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes brandSlider {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-brand-slider {
          animation: brandSlider 25s linear infinite;
        }
        .animate-brand-slider:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}