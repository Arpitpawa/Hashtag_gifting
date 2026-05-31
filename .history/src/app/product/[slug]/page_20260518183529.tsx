import { notFound } from "next/navigation";
import ProductClient from "@/components/product/ProductClient";

interface Props {
  params: Promise<{ slug: string }>;
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
      return { title: "Product not found — Hashtag Gifting" };
    }

    return {
      title:       `${product.name} — Hashtag Gifting`,
      description: product.description || `Buy ${product.name} from Hashtag Gifting.`,
      openGraph: {
        title:  product.name,
        images: [{ url: product.images[0] }],
      },
    };
  } catch {
    return { title: "Hashtag Gifting" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/products/${slug}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) notFound();

    const product = await res.json();
    if (!product || product.error) notFound();

    return <ProductClient product={product} />;


  } catch {
    notFound();
  }
}