import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <div style={{ marginTop: "80px" }}>
        <BestSellers />
      </div>
      <ShopByCategory />
    </main>
  );
}