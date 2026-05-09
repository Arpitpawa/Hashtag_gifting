import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrendingGifts from "@/components/home/TrendingGifts";
import BrandLogos from "@/components/home/BrandLogos";
import Testimonials from "@/components/home/Testimonials";
import InstagramReels from "@/components/home/InstagramReels";
import BuildYourHamper from "@/components/home/BuildYourHamper";
export default function HomePage() {
  return (
    <main>
      <Hero />
      <div style={{ marginTop: "80px" }}>
        <BestSellers />
      </div>
      <ShopByCategory />
      <TrendingGifts />
      <BrandLogos />
      <Testimonials />
     
    </main>
  );
}