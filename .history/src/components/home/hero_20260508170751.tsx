return (
  <section className="relative w-full overflow-hidden bg-[#f6f1eb] pb-24 md:pb-32">
    
    {/* HERO AREA */}
    <div className="relative h-[92vh] lg:h-[88vh] overflow-hidden">
      
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              current === index
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
          >
            
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                
                <div className="max-w-2xl text-white">
                  
                  {/* Subtitle */}
                  <p
                    className="
                      text-[#f4d35e]
                      text-xl
                      md:text-3xl
                      italic
                      mb-4
                      font-light
                    "
                    style={{
                      fontFamily: "cursive",
                    }}
                  >
                    {slide.subtitle}
                  </p>

                  {/* Heading */}
                  <h1
                    className="
                      text-5xl
                      sm:text-6xl
                      md:text-7xl
                      leading-[0.92]
                      font-light
                      whitespace-pre-line
                      tracking-tight
                    "
                    style={{
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {slide.title}
                  </h1>

                  {/* Line */}
                  <div className="mt-4 mb-6">
                    <svg
                      width="160"
                      height="18"
                      viewBox="0 0 180 20"
                      fill="none"
                    >
                      <path
                        d="M2 10C20 2 40 18 58 10C76 2 96 18 114 10C132 2 152 18 178 10"
                        stroke="#f4d35e"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Description */}
                  <p
                    className="
                      text-base
                      md:text-xl
                      leading-relaxed
                      text-white/90
                      max-w-xl
                      font-light
                    "
                  >
                    {slide.description}
                  </p>

                  {/* Button */}
                  <button
                    className="
                      mt-8
                      bg-white
                      text-[#3d4fa3]
                      px-8
                      py-4
                      text-sm
                      tracking-[2px]
                      font-semibold
                      hover:bg-[#f4d35e]
                      hover:text-black
                      transition-all
                      duration-300
                    "
                  >
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`
              transition-all duration-300 rounded-full
              ${
                current === index
                  ? "w-10 h-[3px] bg-[#f4d35e]"
                  : "w-5 h-[3px] bg-white/60"
              }
            `}
          />
        ))}
      </div>
    </div>
  </section>
);