import type { Metadata } from "next";
import Script from "next/script";
import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";
import TrendingGifts from "@/components/home/TrendingGifts";
import Testimonials from "@/components/home/Testimonials";
import InstagramReels from "@/components/home/InstagramReels";
import BuildYourHamper from "@/components/home/BuildYourHamper";
import { HAMPER_ENABLED } from "@/lib/features";
import GiftsByRelationship from "@/components/home/GiftsByRelationship";
import ShopByBudget from "@/components/home/ShopByBudget";
import { getActiveProductCount, roundDownForMarketing } from "@/lib/productCount";

const BASE_URL = "https://www.hashtaggifting.com";

export const metadata: Metadata = {
  alternates: { canonical: BASE_URL },
};

function HomeJsonLd({ productCount }: { productCount: number }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hashtag Gifting",
    url: BASE_URL,
    description:
      productCount > 0
        ? `Shop ${productCount}+ handcrafted personalised gifts — wallets, passport covers, diaries, pens, gift combos & more.`
        : "Shop handcrafted personalised gifts — wallets, passport covers, diaries, pens, gift combos & more.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hashtag Gifting",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-7665909909",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: ["https://www.instagram.com/hashtagifting/"],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Hashtag Gifting",
    image: `${BASE_URL}/og-image.jpg`,
    url: BASE_URL,
    telephone: "+91-7665909909",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop no. 83, Roop Vandana Complex, Arya Samaj Rd, Gurunanakpura, Raja Park",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      postalCode: "302004",
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: 26.9124, longitude: 75.7873 },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    priceRange: "Rs. 299 - Rs. 5000",
  };

  return (
    <>
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Script
        id="org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  );
}

export default async function HomePage() {
  let productCount = 0;
  try {
    productCount = roundDownForMarketing(await getActiveProductCount());
  } catch (err) {
    console.error("HOME PAGE: failed to load product count:", err);
  }

  return (
    <main>
      <HomeJsonLd productCount={productCount} />
      <h1 className="sr-only">Personalised Gifts Delivered Across India — Hashtag Gifting</h1>
      <Hero />
      <div className="mt-10 sm:mt-14 md:mt-20">
        <GiftsByRelationship />
        <BestSellers />
      </div>
      <ShopByCategory />
      <TrendingGifts />
      <ShopByBudget />
      {HAMPER_ENABLED && <BuildYourHamper productCount={productCount} />}
      <Testimonials />
      <InstagramReels />
    </main>
  );
}
