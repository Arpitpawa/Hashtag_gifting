import CategoryCard from "./CategoryCard";
import { categories } from "@/data/categories";

export default function Categories() {
  return (
    <section className="py-20">

      <div className="container-custom">

        {/* Heading */}
        <div className="flex items-end justify-between gap-6 mb-10">

          <div>
            <p className="uppercase tracking-[5px] text-sm text-[var(--muted)] mb-3">
              Categories
            </p>

            <h2 className="text-3xl md:text-5xl font-bold">
              Shop By Category
            </h2>
          </div>

          <button className="hidden md:block text-sm underline underline-offset-4">
            View All
          </button>

        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              image={category.image}
            />
          ))}

        </div>

      </div>
    </section>
  );
}