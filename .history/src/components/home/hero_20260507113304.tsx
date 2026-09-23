import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative">

      <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">

        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc"
          alt="Hero Banner"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">

          <div className="container-custom">

            <div className="max-w-2xl text-white space-y-5">

              <p className="text-2xl italic text-[#f3d57a]">
                Your gifting story begins here
              </p>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl leading-none font-light uppercase">
                MAKE EVERY
                <span className="block">
                  MOMENT SPECIAL
                </span>
              </h1>

              <p className="text-lg md:text-2xl max-w-xl text-gray-100">
                Personalized gifts crafted
                beautifully for birthdays,
                anniversaries, weddings,
                and unforgettable memories.
              </p>

              <button className="bg-white text-[#2f3e7a] px-8 py-4 text-sm tracking-wide hover:bg-[#2f3e7a] hover:text-white transition">
                SHOP COLLECTION
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}