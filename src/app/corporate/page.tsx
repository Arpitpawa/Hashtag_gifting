import CorporateHero from "@/components/corporate/CorporateHero";
import WoodenCorporateGifting from "@/components/corporate/WoodenCorporateGifting";
import CorporateProducts from "@/components/corporate/CorporateProducts";

import BrandLogos from "@/components/home/BrandLogos";
import CorporateOccasions from "@/components/corporate/CorporateOccasions";
import CorporatePromotional from "@/components/corporate/CorporatePromotional";
import CorporateWhyUs from "@/components/corporate/CorporateWhyUs";
import CorporateTestimonials from "@/components/corporate/CorporateTestimonials";
import InquiryForm from "@/components/corporate/InquiryForm";
import CorporateFAQ from "@/components/corporate/CorporateFAQ";

export const metadata = {
  title: "Corporate gifting — Hashtag Gifting",
  description: "Premium corporate gifting solutions for businesses across India.",
};

export default function CorporatePage() {
  return (
    <main>
      <CorporateHero />
    
      <CorporateProducts />
      
      <BrandLogos />
      <CorporateOccasions />
      <CorporatePromotional />
      <CorporateWhyUs />
      <CorporateTestimonials />
      
      <CorporateFAQ />
      <InquiryForm />
    </main>
  );
}