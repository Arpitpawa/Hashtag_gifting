import CorporateHero from "@/components/corporate/CorporateHero";
import CorporateStats from "@/components/corporate/CorporateStats";
import CorporateCategories from "@/components/corporate/CorporateCategories";
import HowItWorks from "@/components/corporate/HowItWorks";
import CorporateProducts from "@/components/corporate/CorporateProducts";
import BrandLogos from "@/components/home/BrandLogos";
import CorporateTestimonials from "@/components/corporate/CorporateTestimonials";
import InquiryForm from "@/components/corporate/InquiryForm";
import CorporateFAQ from "@/components/corporate/CorporateFAQ";

export const metadata = {
  title: "Corporate gifting — Hashtag Gifting",
  description: "Premium corporate gifting solutions for businesses across India. Employee gifts, branded hampers, bulk orders with custom packaging.",
};

export default function CorporatePage() {
  return (
    <main>
      <CorporateHero />
      <CorporateStats />
      <CorporateCategories />
      <HowItWorks />
      <CorporateProducts />
      <BrandLogos />
      <CorporateTestimonials />
      <InquiryForm />
      <CorporateFAQ />
    </main>
  );
}