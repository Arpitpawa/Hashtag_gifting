import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import slugify from "slugify";

// ── ADMIN CHECK HELPER ──
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

// ── GET ALL PRODUCTS (admin — includes drafts) ──
export async function GET() {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { orderItems: true, reviews: true } },
      },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("ADMIN PRODUCTS GET ERROR:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

// ── CREATE PRODUCT ──
export async function POST(req: Request) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      name,
      description,
      price,          // send in rupees — we convert to paise
      comparePrice,
      images,         // array of Cloudinary URLs
      categoryId,
      stock,
      badge,
      customizable,
      customizationFields,
      tags,
      status,
    } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price:        Math.round(Number(price) * 100),        // rupees → paise
        comparePrice: comparePrice ? Math.round(Number(comparePrice) * 100) : null,
        images:       images || [],
        categoryId:   categoryId ? Number(categoryId) : null,
        stock:        Number(stock) || 0,
        badge:        badge || null,
        customizable: Boolean(customizable),
        customizationFields: customizationFields || null,
        tags:         tags || [],
        status:       status || "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (err) {
    console.error("PRODUCT CREATE ERROR:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}