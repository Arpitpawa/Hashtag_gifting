import { notFound } from "next/navigation";
import ProductClient from "@/components/product/ProductClient";
import prisma from "@/lib/prisma";

interface Props {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    // Queries the DB directly rather than self-fetching our own /api route
    // over HTTP (the page body below still does that, for the full product
    // shape it needs -- see that route for why). generateMetadata only
    // needs 4 fields, and a self-fetch here means an extra serverless
    // round-trip -- plus its own cold start -- purely to build <head> tags.
    // WhatsApp/Facebook's link-preview crawler has a short timeout before it
    // gives up and caches a blank preview for that URL, often for a long
    // time; a slow self-fetch was a real, avoidable way to trip that.
    const product = await prisma.product.findUnique({
      where:  { slug, status: "ACTIVE" },
      select: { name: true, description: true, images: true, tags: true },
    });

    if (!product) {
      return { title: "Product not found" };
    }

    const description = product.description || `Buy ${product.name} from Hashtag Gifting.`;
    const image = product.images[0];
    const url = `${process.env.NEXTAUTH_URL || ""}/product/${slug}`;

    return {
      title:       product.name,
      description,
      keywords:    product.tags.join(", ") || undefined,
      openGraph: {
        type:        "website",
        url,
        siteName:    "Hashtag Gifting",
        title:       product.name,
        description,
        images:      image ? [{ url: image, alt: product.name }] : undefined,
      },
      // Without this, Next.js falls through to the root layout's generic
      // site-wide twitter:image (which points at a domain that isn't live
      // yet) for every single product page -- this makes X/Twitter card
      // previews use the actual product photo instead.
      twitter: {
        card:        "summary_large_image",
        title:       product.name,
        description,
        images:      image ? [image] : undefined,
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