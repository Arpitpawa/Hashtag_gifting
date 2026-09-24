import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import slugify from "slugify";
import { invalidateCache } from "@/lib/cache";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// ── GET ALL PRODUCTS ── (?trash=1 lists only trashed items)
export async function GET(req: Request) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const trash = searchParams.get("trash") === "1";

    const products = await prisma.product.findMany({
      where:   trash ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: trash ? { deletedAt: "desc" } : { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        productCategories: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { orderItems: true, reviews: true } },
        variants: {
          where:   { groupName: { equals: "Color", mode: "insensitive" } },
          orderBy: { sortOrder: "asc" },
          select:  { id: true, optionName: true, images: true, stock: true, price: true, comparePrice: true },
        },
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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const {
      name, sku, description, detailsDescription, price, comparePrice,
      images, categoryId, categoryIds,   // categoryIds = array for multi-cat
      stock, badge, customizable, fastDelivery,
      customizationFields, specifications,
      previewTemplate, previewZones, availableFonts,
      tags, status, variants,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    // Primary category: first of categoryIds, or legacy categoryId
    const allCatIds: number[] = categoryIds?.length
      ? categoryIds.map(Number)
      : categoryId ? [Number(categoryId)] : [];

    const primaryCatId = allCatIds[0] ?? null;

    const product = await prisma.product.create({
      data: {
        name, slug,
        sku:                 sku?.trim() || null,
        description:         description || null,
        detailsDescription:  detailsDescription || null,
        price:               Math.round(Number(price) * 100),
        comparePrice:        comparePrice ? Math.round(Number(comparePrice) * 100) : null,
        images:              images || [],
        categoryId:          primaryCatId,
        stock:               Number(stock) || 0,
        badge:               badge || null,
        customizable:        Boolean(customizable),
        fastDelivery:        Boolean(fastDelivery),
        customizationFields: customizationFields || null,
        specifications:      specifications || null,
        previewTemplate:     previewTemplate || null,
        previewZones:        previewZones || null,
        availableFonts:      availableFonts || [],
        tags:                tags || [],
        status:              status || "ACTIVE",
        // Create all multi-category join rows
        productCategories: allCatIds.length > 0 ? {
          create: allCatIds.map((cid) => ({ categoryId: cid })),
        } : undefined,
        // Create variants defined at product-creation time — previously this
        // was silently dropped since only the edit/PUT route persisted them.
        variants: Array.isArray(variants) && variants.length > 0 ? {
          create: variants.map((v: any, i: number) => ({
            groupName:    v.groupName,
            optionName:   v.optionName,
            price:        v.price != null ? Math.round(Number(v.price) * 100) : null,
            comparePrice: v.comparePrice ? Math.round(Number(v.comparePrice) * 100) : null,
            stock:        Number(v.stock) || 0,
            images:       Array.isArray(v.images) ? v.images : [],
            sku:          v.sku || null,
            sortOrder:    i,
            isDefault:    v.isDefault || false,
          })),
        } : undefined,
      },
    });

    if (allCatIds.length > 0) invalidateCache("categories"); // new product's categories should reflect in counts right away

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (err: any) {
    console.error("PRODUCT CREATE ERROR:", err);
    if (err?.code === "P2002" && err?.meta?.target?.includes?.("sku")) {
      return NextResponse.json({ error: "That SKU is already used by another product" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}