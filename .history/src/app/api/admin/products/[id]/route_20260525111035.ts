import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import slugify from "slugify";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where:   { id: Number(id) },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id }  = await params;
    const body    = await req.json();

    const {
      name, description, price, comparePrice,
      images, categoryId, stock, badge,
      customizable, customizationFields,
      specifications,
      previewTemplate, previewZones,
      tags, status,
    } = body;

    const existing = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Regenerate slug if name changed
    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name, { lower: true, strict: true });
      const slugExists = await prisma.product.findFirst({
        where: { slug, NOT: { id: Number(id) } },
      });
      if (slugExists) slug = `${slug}-${Date.now()}`;
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name              && { name, slug }),
        ...(description       !== undefined && { description }),
        ...(price             && { price: Math.round(Number(price) * 100) }),
        ...(comparePrice      !== undefined && {
          comparePrice: comparePrice ? Math.round(Number(comparePrice) * 100) : null,
        }),
        ...(images            && { images }),
        ...(categoryId        !== undefined && {
          categoryId: categoryId ? Number(categoryId) : null,
        }),
        ...(stock             !== undefined && { stock: Number(stock) }),
        ...(badge             !== undefined && { badge: badge || null }),
        ...(customizable      !== undefined && { customizable: Boolean(customizable) }),
        ...(customizationFields !== undefined && { customizationFields }),
        ...(specifications    !== undefined && { specifications }),
        ...(previewTemplate   !== undefined && { previewTemplate: previewTemplate || null }),
        ...(previewZones      !== undefined && { previewZones }),
        ...(tags              && { tags }),
        ...(status            && { status }),
      },
    });

    return NextResponse.json({ success: true, product: updated });

  } catch (err) {
    console.error("PRODUCT UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // PATCH = same as PUT — just pass through
  return PUT(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft delete if has orders
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: Number(id) },
    });

    if (hasOrders) {
      await prisma.product.update({
        where: { id: Number(id) },
        data:  { status: "DRAFT" },
      });
      return NextResponse.json({
        success: true,
        message: "Product has orders — moved to draft",
      });
    }

    // Hard delete — clean Cloudinary
    try {
      for (const imageUrl of product.images) {
        await deleteFromCloudinary(imageUrl);
      }
    } catch (cloudErr) {
      console.warn("Cloudinary cleanup failed:", cloudErr);
    }

    await prisma.product.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true, message: "Product deleted" });

  } catch (err) {
    console.error("PRODUCT DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}