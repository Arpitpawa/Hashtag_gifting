import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrendingGifts from "@/components/home/TrendingGifts";
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