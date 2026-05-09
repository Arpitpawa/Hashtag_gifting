import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      <div className="container-custom min-h-[90vh] grid lg:grid-cols-2 gap-14 items-center py-10">

        {/* Left Content */}
        <div className="space-y-8">

          <div className="space-y-4">
            <p className="uppercase tracking-[6px] text-sm text-[var(--muted)]">
              Personalized Gifting Store
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
              Make Every
              <span className="block">
                Gift Feel
              </span>
              Special
            </h1>

            <p className="text-[var(--muted)] text-base md:text-lg max-w-xl leading-relaxed">
              Discover premium personalized gifts crafted
              for birthdays, anniversaries, weddings,
              and every unforgettable moment.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            <button className="bg-black text-white px-8 py-4 rounded-full text-sm font-medium hover:opacity-90 transition">
              Shop Now
            </button>

            <button className="border border-black px-8 py-4 rounded-full text-sm font-medium hover:bg-black hover:text-white transition">
              Customize Gifts
            </button>

          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-6 pt-4">

            <div>
              <h3 className="font-bold text-xl">
                500+
              </h3>

              <p className="text-sm text-[var(--muted)]">
                Unique Products
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl">
                10k+
              </h3>

              <p className="text-sm text-[var(--muted)]">
                Happy Customers
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl">
                4.9★
              </h3>

              <p className="text-sm text-[var(--muted)]">
                Customer Rating
              </p>
            </div>

          </div>
        </div>

        {/* Right Image */}
        <div className="relative h-[450px] sm:h-[550px] lg:h-[750px] rounded-[40px] overflow-hidden">

          <Image
            src="https://images.unsplash.com/photo-1512909006721-3d6018887383"
            alt="Gift Banner"
            fill
            priority
            className="object-cover"
          />

        </div>

      </div>
    </section>
  );
}