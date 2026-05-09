import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative">

      <div className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[82vh] overflow-hidden rounded-b-[30px]">

        {/* Image */}
        <Image
          src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8"
          alt="Gift Banner"
          fill
          priority
          className="object-cover"
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">

          <div className="container-custom">

            <div className="max-w-2xl space-y-6">

              <p className="text-2xl md:text-3xl italic text-[#f4d35e]">
                Celebrate Every Beautiful Moment
              </p>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-none text-white">
                GIFT
                <span className="block">
                  HAPPINESS
                </span>
              </h1>

              <p className="text-lg md:text-2xl text-white max-w-xl">
                Personalized gifts crafted with love
                for birthdays, anniversaries,
                weddings and special memories.
              </p>

              <button className="bg-[#d7b6df] hover:bg-[#caa2d4] transition text-white px-10 py-4 text-sm md:text-base font-medium">
                SHOP NOW
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}