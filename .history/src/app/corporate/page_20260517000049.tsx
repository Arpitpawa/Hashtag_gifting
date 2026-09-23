import CorporateHero from "@/components/corporate/CorporateHero";
import CorporateHampersProducts from "@/components/corporate/CorporateHampersProducts";
import CorporateProducts from "@/components/corporate/CorporateProducts";
import BrandLogos from "@/components/home/BrandLogos";
import CorporateOccasions from "@/components/corporate/CorporateOccasions";
import CorporateWhyUs from "@/components/corporate/CorporateWhyUs";
import CorporateTestimonials from "@/components/corporate/CorporateTestimonials";
import InquiryForm from "@/components/corporate/InquiryForm";
import CorporateFAQ from "@/components/corporate/CorporateFAQ";

export const metadata = {
  title: "Corporate gifting — Hashtag Gifting",
  description: "Premium corporate gifting for businesses across India.",
};

export default function CorporatePage() {
  return (
    <main>
      <CorporateHero />

      <CorporateProducts />
      <Corporate  HampersProducts />
      <BrandLogos />
      <CorporateOccasions />
      <CorporateWhyUs />
      <CorporateTestimonials />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <InquiryForm />
        <CorporateFAQ />
      </div>
    </main>
  );
}