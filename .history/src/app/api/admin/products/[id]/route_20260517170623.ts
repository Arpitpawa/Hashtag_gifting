import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import slugify from "slugify";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// ── GET SINGLE PRODUCT BY ID ──
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(params.id) },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

// ── UPDATE PRODUCT ──
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = Number(params.id);

    const {
      name,
      description,
      price,
      comparePrice,
      images,
      categoryId,
      stock,
      badge,
      customizable,
      customizationFields,
      tags,
      status,
    } = body;

    // Regenerate slug if name changed
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name, { lower: true, strict: true });
      const slugExists = await prisma.product.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugExists) slug = `${slug}-${Date.now()}`;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name, slug }),
        ...(description !== undefined && { description }),
        ...(price && { price: Math.round(Number(price) * 100) }),
        ...(comparePrice !== undefined && {
          comparePrice: comparePrice ? Math.round(Number(comparePrice) * 100) : null,
        }),
        ...(images && { images }),
        ...(categoryId !== undefined && {
          categoryId: categoryId ? Number(categoryId) : null,
        }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(badge !== undefined && { badge: badge || null }),
        ...(customizable !== undefined && { customizable: Boolean(customizable) }),
        ...(customizationFields !== undefined && { customizationFields }),
        ...(tags && { tags }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, product: updated });

  } catch (err) {
    console.error("PRODUCT UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// ── DELETE PRODUCT ──
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has orders — soft delete instead
    const hasOrders = await prisma.orderItem.findFirst({ where: { productId: id } });

    if (hasOrders) {
      // Soft delete — just set to DRAFT
      await prisma.product.update({
        where: { id },
        data: { status: "DRAFT" },
      });
      return NextResponse.json({
        success: true,
        message: "Product has orders — moved to draft instead of deleting",
      });
    }

    // Hard delete — also clean up Cloudinary images
    try {
      for (const imageUrl of product.images) {
        await deleteFromCloudinary(imageUrl);
      }
    } catch (cloudErr) {
      console.warn("Cloudinary cleanup failed:", cloudErr);
      // Don't fail the delete if Cloudinary cleanup fails
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Product deleted" });

  } catch (err) {
    console.error("PRODUCT DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}