import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";
import { getActiveProductCount, roundDownForMarketing } from "@/lib/productCount";

export async function generateMetadata() {
  let productCount = 0;
  try {
    productCount = roundDownForMarketing(await getActiveProductCount());
  } catch (err) {
    console.error("SHOP PAGE: failed to load product count:", err);
  }

  return {
    title: "Shop",
    description: productCount > 0
      ? `Browse ${productCount}+ personalized gifts for every occasion and relationship.`
      : "Browse personalized gifts for every occasion and relationship.",
  };
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopClient />
    </Suspense>
  );
}

function ShopSkeleton() {
  return (
    <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl aspect-square mb-3" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}