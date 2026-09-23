import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = "https://www.hashtaggifting.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,             lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/shop`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/corporate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
  ];

  // All categories
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url:             `${BASE_URL}/category/${cat.slug}`,
    lastModified:    cat.updatedAt,
    changeFrequency: "weekly",
    priority:        0.8,
  }));

  // All active products
  const products = await prisma.product.findMany({
    where:  { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${BASE_URL}/product/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "weekly",
    priority:        0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}