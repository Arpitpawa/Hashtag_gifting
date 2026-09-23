"use client";

const brands = [
  {
    name: "Flipkart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Flipkart_logo.png",
  },
  {
    name: "Livspace",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Livspace_Logo.png",
  },
  {
    name: "Siemens",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens-logo.svg",
  },
  {
    name: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg",
  },
  {
    name: "BigBasket",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0b/BigBasket_Logo.png",
  },
  {
    name: "NetApp",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/NetApp_logo.svg",
  },
  {
    name: "Lamborghini",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Lamborghini_Logo.svg",
  },
  {
    name: "Vedantu",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Vedantu_logo.svg",
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
        </div>

        {/* Brands Grid */}
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