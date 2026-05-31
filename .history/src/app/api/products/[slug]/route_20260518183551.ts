import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          where:   { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take:    10,
          select: {
            id: true, name: true, rating: true,
            comment: true, images: true, createdAt: true,
          },
        },
        _count: {
          select: {
            reviews: { where: { status: "APPROVED" } },
          },
        },
      },
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    // Related products
    const related = product.categoryId
      ? await prisma.product.findMany({
          where: {
            categoryId: product.categoryId,
            status:     "ACTIVE",
            NOT:        { id: product.id },
          },
          take:   6,
          select: {
            id: true, name: true, slug: true,
            price: true, comparePrice: true,
            images: true, badge: true,
          },
        })
      : [];

    return NextResponse.json({
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      related,
    });

  } catch (err) {
    console.error("PRODUCT SLUG ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 }
    );
  }
}