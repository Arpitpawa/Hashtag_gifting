import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <div className="mt-16 md:mt-24">
        <BestSellers />
      </div>
    </main>
  );
}