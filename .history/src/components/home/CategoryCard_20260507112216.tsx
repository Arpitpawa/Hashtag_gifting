import Image from "next/image";

interface Props {
  title: string;
  image: string;
}

export default function CategoryCard({
  title,
  image,
}: Props) {
  return (
    <div className="group cursor-pointer">

      {/* Image */}
      <div className="relative h-[240px] sm:h-[300px] rounded-[28px] overflow-hidden">

        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition duration-500"
        />

      </div>

      {/* Content */}
      <div className="pt-4 flex items-center justify-between">

        <h3 className="text-lg md:text-xl font-semibold">
          {title}
        </h3>

        <button className="text-sm underline underline-offset-4">
          Explore
        </button>

      </div>
    </div>
  );
}