import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { notifyBackInStock } from "@/lib/stockNotify";
import { invalidateCache } from "@/lib/cache";
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
      include: {
        category: { select: { id: true, name: true, slug: true } },
        productCategories: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
        variants: {
          orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }],
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      categoryIds: product.productCategories.map((pc: any) => pc.categoryId),
    });
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
    const { id } = await params;
    const body   = await req.json();

    const {
      name, sku, description, detailsDescription, price, comparePrice,
      images, categoryId, categoryIds,
      stock, badge, customizable, fastDelivery, hasCharm,
      customizationFields, specifications,
      previewTemplate, previewZones, availableFonts,
      tags, status, deletedAt,
      variants, // ← NEW: array of variant objects
    } = body;

    const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name, { lower: true, strict: true });
      const slugExists = await prisma.product.findFirst({
        where: { slug, NOT: { id: Number(id) } },
      });
      if (slugExists) slug = `${slug}-${Date.now()}`;
    }

    const allCatIds: number[] = categoryIds?.length
      ? categoryIds.map(Number)
      : categoryId !== undefined ? (categoryId ? [Number(categoryId)] : []) : [];

    const primaryCatId = allCatIds[0] ?? null;

    const updated = await prisma.$transaction(async (tx: any) => {
      // Update product
      const p = await tx.product.update({
        where: { id: Number(id) },
        data: {
          ...(name              && { name, slug }),
          ...(sku               !== undefined && { sku: sku?.trim() || null }),
          ...(description       !== undefined && { description }),
          ...(detailsDescription !== undefined && { detailsDescription }),
          ...(price             && { price: Math.round(Number(price) * 100) }),
          ...(comparePrice      !== undefined && {
            comparePrice: comparePrice ? Math.round(Number(comparePrice) * 100) : null,
          }),
          ...(images            && { images }),
          ...(allCatIds.length > 0 && { categoryId: primaryCatId }),
          ...(stock             !== undefined && { stock: Number(stock) }),
          ...(badge             !== undefined && { badge: badge || null }),
          ...(customizable      !== undefined && { customizable: Boolean(customizable) }),
          ...(fastDelivery      !== undefined && { fastDelivery: Boolean(fastDelivery) }),
          ...(hasCharm         !== undefined && { hasCharm: Boolean(hasCharm) }),
          ...(customizationFields !== undefined && { customizationFields }),
          ...(specifications    !== undefined && { specifications }),
          ...(previewTemplate   !== undefined && { previewTemplate: previewTemplate || null }),
          ...(previewZones      !== undefined && { previewZones }),
          ...(availableFonts    !== undefined && { availableFonts }),
          ...(tags              && { tags }),
          ...(status            && { status }),
          ...(deletedAt         !== undefined && { deletedAt }), // restore: pass null
        },
      });

      // Sync categories
      if (allCatIds.length > 0) {
        await tx.productCategory.deleteMany({ where: { productId: Number(id) } });
        await tx.productCategory.createMany({
          data: allCatIds.map((cid) => ({ productId: Number(id), categoryId: cid })),
          skipDuplicates: true,
        });
        // A product's categories changed — the public nav/shop category
        // counts (cached in getNavCategories) need to reflect that right
        // away, same as editing a category directly already does.
        invalidateCache("categories");
      }

      // ── Sync variants ──
      // Strategy: delete all existing, re-create from payload
      // This is simplest and safe — variants don't have their own orders
      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: Number(id) } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: any, i: number) => ({
              productId:    Number(id),
              groupName:    v.groupName,
              optionName:   v.optionName,
              price:        v.price != null ? Math.round(Number(v.price) * 100) : null,
              comparePrice: v.comparePrice ? Math.round(Number(v.comparePrice) * 100) : null,
              stock:        Number(v.stock) || 0,
              images:       Array.isArray(v.images) ? v.images : [],
              sku:          v.sku   || null,
              sortOrder:    i,
              isDefault:    v.isDefault || false,
            })),
          });
        }
      }

      return p;
    });

    // ── Auto-notify waitlisted customers if this update just restocked it ──
    // Fires no matter which admin screen changed the stock (Edit product
    // page, Inventory's inline editor, etc.) since it lives here at the
    // one shared update route rather than in each individual UI.
    let notified = 0;
    if (stock !== undefined && existing.stock === 0 && Number(stock) > 0) {
      try {
        const result = await notifyBackInStock(Number(id));
        notified = result.sent;
      } catch (e) {
        console.error("Auto restock-notify failed:", e);
      }
    }

    return NextResponse.json({ success: true, product: updated, notified });

  } catch (err: any) {
    console.error("PRODUCT UPDATE ERROR:", err);
    if (err?.code === "P2002" && err?.meta?.target?.includes?.("sku")) {
      return NextResponse.json({ error: "That SKU is already used by another product" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

// Default behavior: move to Trash (fast — a single update, fully
// reversible via the restore endpoint). Pass ?permanent=1 to actually
// purge it forever (used from the Trash view only).
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "1";

    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!permanent) {
      // ── Move to Trash — one fast update, nothing else touched. ──
      await prisma.product.update({
        where: { id: Number(id) },
        data:  { deletedAt: new Date(), status: "DRAFT" },
      });
      return NextResponse.json({ success: true, trashed: true, message: "Moved to Trash" });
    }

    // ── Permanent purge ──
    const hasOrders = await prisma.orderItem.findFirst({ where: { productId: Number(id) } });
    if (hasOrders) {
      return NextResponse.json({
        error: "This product has past orders, so it can't be permanently deleted — that would break order history. It can stay in Trash indefinitely instead.",
      }, { status: 409 });
    }

    try {
      for (const imageUrl of product.images) await deleteFromCloudinary(imageUrl);
    } catch {}

    // Reviews, cart items and wishlist entries don't cascade-delete at the
    // DB level, so a product with any of those left over would fail to
    // delete with a raw foreign-key error. Clean those up first.
    await prisma.$transaction([
      prisma.review.deleteMany({ where: { productId: Number(id) } }),
      prisma.cartItem.deleteMany({ where: { productId: Number(id) } }),
      prisma.wishlist.deleteMany({ where: { productId: Number(id) } }),
      prisma.product.delete({ where: { id: Number(id) } }),
    ]);

    return NextResponse.json({ success: true, message: "Product permanently deleted" });

  } catch (err) {
    console.error("PRODUCT DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
