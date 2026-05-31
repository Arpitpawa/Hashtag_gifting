import Link from "next/link";

const categories = [
  {
    title: "Drinkware",
    desc: "From stylish mugs to sleek water bottles and tumblers — perfect for everyday use and brand recall.",
    image: "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=800",
    link: "/corporate/drinkware",
    size: "large", // col-span-2
  },
  {
    title: "Electronics",
    desc: "Branded speakers, headphones and tech accessories combining practicality with luxury.",
    image: "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=800",
    link: "/corporate/electronics",
    size: "small",
  },
  {
    title: "Travel",
    desc: "Make your brand travel far and wide with travel-friendly items designed for comfort and visibility.",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/travel",
    size: "small",
  },
  {
    title: "Desk essentials",
    desc: "Equip your team with branded desk essentials that enhance productivity and reinforce your brand.",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/desk-essentials",
    size: "small",
  },
  {
    title: "Journals",
    desc: "Inspire creativity with branded journals — a timeless gift that offers lasting utility.",
    image: "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=800",
    link: "/corporate/journals",
    size: "small",
  },
];

export default function CorporatePromotional() {
  return (
    <section className="pt-20 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-10 md:mb-12">
          <h2
            className="text-3xl md:text-4xl font-semibold text-[black] mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Best-selling promotional products
          </h2>
          <p className="text-[black]/70 text-[14px] md:text-[15px]">
            Promote your brand with our custom promotional gifts
          </p>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ROW 1 — large + small */}
          <div className="md:col-span-2">
            <CategoryCard item={categories[0]} height="h-[280px] md:h-[340px]" />
          </div>
          <div>
            <CategoryCard item={categories[1]} height="h-[280px] md:h-[340px]" />
          </div>

          {/* ROW 2 — small + small + small */}
          <div>
            <CategoryCard item={categories[2]} height="h-[260px] md:h-[300px]" />
          </div>
          <div>
            <CategoryCard item={categories[3]} height="h-[260px] md:h-[300px]" />
          </div>
          <div>
            <CategoryCard item={categories[4]} height="h-[260px] md:h-[300px]" />
          </div>

        </div>
      </div>
    </section>
  );
}

function CategoryCard({ item, height }: { item: typeof categories[0]; height: string }) {
  return (
    <Link
      href={item.link}
      className={`relative overflow-hidden rounded-2xl block group ${height} w-full`}
    >
      {/* IMAGE */}
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        draggable={false}
      />

      {/* GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* HOVER OVERLAY */}
      <div className="absolute inset-0 bg-[#c0555a]/0 group-hover:bg-[#c0555a]/15 transition-all duration-500" />

      {/* CONTENT — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <h3
          className="text-white text-2xl md:text-3xl font-bold mb-2 leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {item.title}
        </h3>
        <p className="text-white/70 text-[13px] leading-relaxed max-w-sm opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          {item.desc}
        </p>
      </div>

      {/* TOP RIGHT — arrow on hover */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-white/0 group-hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0555a" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}