import Link from "next/link";

const categories = [
  {
    title: "Drinkware",
    desc: "From stylish mugs to sleek water bottles and tumblers — perfect for everyday use and brand recall.",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/drinkware",
  },
  {
    title: "Electronics",
    desc: "Branded speakers, headphones and tech accessories combining practicality with luxury.",
    image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    link: "/corporate/electronics",
  },
  {
    title: "Travel",
    desc: "Make your brand travel far and wide with travel-friendly items designed for comfort and visibility.",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/travel",
  },
  {
    title: "Desk essentials",
    desc: "Equip your team with branded desk essentials that enhance productivity and reinforce your brand.",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/desk-essentials",
  },
  {
    title: "Journals",
    desc: "Inspire creativity with branded journals — a timeless gift that offers lasting utility.",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/journals",
  },
];

function CategoryCard({
  item,
  className = "",
}: {
  item: (typeof categories)[0];
  className?: string;
}) {
  return (
    <Link
      href={item.link}
      className={`relative overflow-hidden rounded-2xl block group ${className}`}
    >
      {/* IMAGE */}
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        draggable={false}
      />

      {/* GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {/* HOVER RED TINT */}
      <div className="absolute inset-0 bg-[#c0555a]/0 group-hover:bg-[#c0555a]/15 transition-all duration-500" />

      {/* CONTENT */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <h3
          className="text-white text-2xl md:text-3xl font-normal mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {item.title}
        </h3>
        <p className="text-white/75 text-[13px] leading-relaxed max-w-xs">
          {item.desc}
        </p>
      </div>
    </Link>
  );
}

export default function CorporatePromotional() {
  return (
    <section className="pt-20 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-10 md:mb-12">
          <h2
            className="text-[42px] md:text-[66px] font-normal text-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.02em", lineHeight: "1.15" }}
          >
            Best-Selling Promotional Products
          </h2>
          <p className="text-[black]/70 text-[14px] md:text-[15px]">
            Promote your brand with our custom promotional gifts
          </p>
        </div>

        {/* ── EXACT LAYOUT LIKE REFERENCE ── */}
        <div className="flex flex-col gap-4">

          
          <div className="flex flex-col md:flex-row gap-4">

            {/* Drinkware — 2/3 width */}
            <div className="w-full md:w-2/3">
              <CategoryCard
                item={categories[0]}
                className="h-[280px] md:h-[380px] w-full"
              />
            </div>

            {/* Electronics — 1/3 width */}
            <div className="w-full md:w-1/3">
              <CategoryCard
                item={categories[1]}
                className="h-[280px] md:h-[380px] w-full"
              />
            </div>
          </div>

          {/* ── ROW 2 — Travel (large left) + Desk Essentials + Journals stacked right ── */}
          <div className="flex flex-col md:flex-row gap-4">

            {/* Travel — 1/3 width, full height of row */}
            <div className="w-full md:w-1/3">
              <CategoryCard
                item={categories[2]}
                className="h-[280px] md:h-[400px] w-full"
              />
            </div>

            {/* Right side — Desk Essentials + Journals stacked */}
            <div className="w-full md:w-2/3 flex flex-col gap-4">

              {/* Desk Essentials — top half */}
              <CategoryCard
                item={categories[3]}
                className="h-[180px] md:h-[190px] w-full"
              />

              {/* Journals — bottom half */}
              <CategoryCard
                item={categories[4]}
                className="h-[180px] md:h-[190px] w-full"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}