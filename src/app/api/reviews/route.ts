import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/sanitize";

// GET reviews for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page      = parseInt(searchParams.get("page") || "1");
    const limit     = 10;
    const skip      = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where:   { productId: Number(productId), status: "APPROVED" },
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
        select: {
          id:        true,
          name:      true,
          rating:    true,
          comment:   true,
          images:    true,
          createdAt: true,
        },
      }),
      prisma.review.count({
        where: { productId: Number(productId), status: "APPROVED" },
      }),
    ]);

    // Average rating
    const avgResult = await prisma.review.aggregate({
      where:   { productId: Number(productId), status: "APPROVED" },
      _avg:    { rating: true },
      _count:  true,
    });

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      avgRating:  Math.round((avgResult._avg.rating || 0) * 10) / 10,
      totalCount: avgResult._count,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

// POST add review (must be logged in)
export async function POST(req: NextRequest) {
  try {
    // ── RATE LIMIT — 5 reviews per hour ──
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`review:${ip}`, { maxRequests: 5, windowMs: 60 * 60_000 });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many review submissions" }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Login required to submit a review" }, { status: 401 });
    }

    const body      = await req.json();
    const productId = Number(body.productId);
    const rating    = Number(body.rating);
    const comment   = sanitizeString(body.comment || "");
    const name      = sanitizeString(body.name    || "");
    const images    = Array.isArray(body.images) ? body.images.slice(0, 5) : [];

    // ── VALIDATE ──
    if (!productId || !rating || !comment || !name) {
      return NextResponse.json(
        { error: "Product, rating, name and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }

    if (comment.length < 10 || comment.length > 1000) {
      return NextResponse.json(
        { error: "Review must be 10–1000 characters" },
        { status: 400 }
      );
    }

    // ── CHECK PRODUCT EXISTS ──
    const product = await prisma.product.findUnique({
      where:  { id: productId, status: "ACTIVE" },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // ── GET USER ──
    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true },
    });

    // ── CHECK: user must have ordered this product ──
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId:        user?.id,
          paymentStatus: "PAID",
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You can only review products you have purchased" },
        { status: 403 }
      );
    }

    // ── CHECK: no duplicate review ──
    const existing = await prisma.review.findFirst({
      where: { productId, userId: user?.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // ── CREATE REVIEW ──
    const review = await prisma.review.create({
      data: {
        productId,
        userId:  user?.id || null,
        name,
        rating,
        comment,
        images,
        status: "PENDING", // Admin must approve
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted! It will appear after approval.",
      review,
    }, { status: 201 });

  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}