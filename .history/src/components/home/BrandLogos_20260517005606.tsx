"use client";

const brands = [
  {
    name: "Tata",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Tata_logo.svg",
  },
  {
    name: "Mahindra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Mahindra_Rise_Logo.svg",
  },
  {
    name: "HDFC Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
  },
  {
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
  },
  {
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
  },
  {
    name: "ICICI Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg",
  },
  {
    name: "Reliance",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Reliance_Industries_Logo.svg",
  },
  {
    name: "Aditya Birla Group",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Aditya_Birla_Group_Logo.svg",
  },
];

export default function BrandClients() {
  return (
    <section className="py-20 bg-[#f3efe8] overflow-hidden">
      <div className="container-custom">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[#c0555a] uppercase tracking-[4px] text-sm font-semibold mb-4">
            Brands that trust our gifting solutions
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-[#111827] leading-tight">
            Trusted by leading brands
          </h2>

          <p className="text-gray-500 text-lg mt-4">
            We proudly work with India’s top companies
          </p>
        </div>

        {/* Brands */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-14 gap-x-10 items-center">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-10 md:h-12 object-contain w-auto"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Bottom Indicator */}
        <div className="flex items-center justify-center gap-4 mt-16">
          <div className="w-10 h-[2px] bg-[#c0555a]" />
          <div className="w-10 h-[2px] bg-gray-300" />
          <div className="w-10 h-[2px] bg-gray-300" />
        </div>

      </div>
    </section>
  );
}