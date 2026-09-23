import Link from "next/link";

const cards = [
  {
    title: "Ready to ship",
    desc: "We offer a wide range of ready-to-ship corporate gift options. From employee onboarding to client appreciation — premium bulk gifting solutions and unique gift ideas for office employees & clients.",
    image: "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=800",
    link: "/corporate/ready-to-ship",
  },
  {
    title: "Semi-customized",
    desc: "Do you see a hamper that you like on our website? We can have your branding on the products you see in a hamper and make it feel like your very own.",
    image: "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=800",
    link: "/corporate/semi-customized",
  },
  {
    title: "Custom curated",
    desc: "Our products stylist will help you curate truly one-of-a-kind hampers for the most important people in your life — be it family, friends, clients, or your employees.",
    image: "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=800",
    link: "/corporate/custom-curated",
  },
];

export default function CorporateWhyUs() {
  return (
    <section className="pt-0 pb-16 md:pb-20">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">

        {/* ── HEADING ── */}
        <div className="text-center mb-10 md:mb-12">
          <h2
            className="text-3xl md:text-4xl font-semibold text-[#c4922a] mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            What makes us unique?
          </h2>
          <p className="text-[black]/70 text-[14px] md:text-[15px] font-medium">
            We help companies send thoughtful, well branded gifts with a streamlined and stress-free process!
          </p>
        </div>

        {/* ── 3 CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <Link
              key={i}
              href={card.link}
              className="group relative overflow-hidden rounded-2xl block"
            >
              {/* IMAGE */}
              <div className="relative h-[420px] md:h-[480px] overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  draggable={false}
                />

                {/* GRADIENT — bottom heavy like reference */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* HOVER RED TINT */}
                <div className="absolute inset-0 bg-[#c0555a]/0 group-hover:bg-[#c0555a]/10 transition-all duration-500" />

                {/* CONTENT — bottom left */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3
                    className="text-white text-2xl md:text-3xl font-bold mb-3 leading-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-white/75 text-[13px] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}