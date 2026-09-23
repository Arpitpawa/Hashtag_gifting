export default function CorporateStats() {
  const stats = [
    { number: "5 lakh+", label: "Gifts delivered" },
    { number: "98%", label: "Client satisfaction" },
    { number: "2,000+", label: "Bulk orders" },
    { number: "50+", label: "Top brands served" },
    { number: "8+", label: "Years of experience" },
  ];

  return (
    <section className="py-10 bg-[#c0555a]">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-3xl md:text-4xl font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.number}
              </span>
              <span className="text-[12px] md:text-[13px] text-white/70 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}