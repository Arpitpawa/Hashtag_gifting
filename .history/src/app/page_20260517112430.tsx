import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrendingGifts from "@/components/home/TrendingGifts";

import Testimonials from "@/components/home/Testimonials";
import InstagramReels from "@/components/home/InstagramReels";
import BuildYourHamper from "@/components/home/BuildYourHamper";
import GiftsByRelationship from "@/components/home/GiftsByRelationship";
import ShopByBudget from "@/components/home/ShopByBudget";
export default function HomePage() {
  return (
    <main>
      <Hero />
      <div style={{ marginTop: "80px" }}>
        <GiftsByRelationship />
        <BestSellers />
      </div>
      <ShopByCategory />
      <TrendingGifts />
      <ShopByBudget />
      <BuildYourHamper />
      
      <Testimonials />
      <InstagramReels />
      
    </main>
  );
}
