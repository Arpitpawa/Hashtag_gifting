import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const page   = parseInt(searchParams.get("page") || "1");
    const limit  = 20;
    const skip   = (page - 1) * limit;

    const where: any = {};
    if (status !== "all") where.status = status;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, images: true, slug: true } },
          user:    { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}