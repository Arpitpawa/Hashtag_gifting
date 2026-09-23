import { notFound } from "next/navigation";
import ProductClient from "@/components/product/ProductClient";

interface Props {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const res     = await fetch(
      `${process.env.NEXTAUTH_URL}/api/products/${slug}`,
      { next: { revalidate: 60 } }
    );
    const product = await res.json();

    if (!product || product.error) {
      return { title: "Product not found" };
    }

    return {
      title:       product.name,
      description: product.description || `Buy ${product.name} from Hashtag Gifting.`,
      keywords:    (product.tags || []).join(", ") || undefined,
      openGraph: {
        title:       product.name,
        description: product.description || `Buy ${product.name} from Hashtag Gifting.`,
        images:      [{ url: product.images[0] }],
      },
    };
  } catch {
    return { title: "Personalised Gifts" };
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  // Came from a color-swatch dot on the shop/category/search grid — preselect that color.
  const initialColor = typeof sp.color === "string" ? sp.color : undefined;

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/products/${slug}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) notFound();

    const product = await res.json();
    if (!product || product.error) notFound();

    const base = process.env.NEXTAUTH_URL || "";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: (product.images || []).slice(0, 4),
      description: product.description || `Buy ${product.name} from Hashtag Gifting.`,
      keywords: (product.tags || []).join(", ") || undefined,
      brand: { "@type": "Brand", name: "Hashtag Gifting" },
      offers: {
        "@type": "Offer",
        url: `${base}/product/${slug}`,
        priceCurrency: "INR",
        price: (Number(product.price) / 100).toFixed(2),
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <ProductClient product={product} initialColor={initialColor} />
      </>
    );

  } catch {
    notFound();
  }
}