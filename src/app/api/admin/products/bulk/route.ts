import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// Bulk product actions in ONE request instead of N round-trips — this is
// what makes multi-select delete/restore fast. Body: { ids: number[], action }
// action = "trash" | "restore" | "purge" | "activate" | "draft" | "charm" (with body.hasCharm) | "stock" (with body.stock) | "prices" (with body.updates)
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const ids: number[] = Array.isArray(body.ids) ? body.ids.map(Number).filter(Boolean) : [];
    const action: string = body.action;

    if (ids.length === 0) {
      return NextResponse.json({ error: "No product ids given" }, { status: 400 });
    }

    // ── Move to Trash — one query for any number of products ──
    if (action === "trash") {
      const result = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data:  { deletedAt: new Date(), status: "DRAFT" },
      });
      return NextResponse.json({ success: true, trashed: result.count });
    }

    // ── Restore from Trash — one query ──
    if (action === "restore") {
      const result = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data:  { deletedAt: null },
      });
      return NextResponse.json({ success: true, restored: result.count });
    }

    // ── Bulk status flip — Active view multi-select, one query ──
    if (action === "activate" || action === "draft") {
      const result = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data:  { status: action === "activate" ? "ACTIVE" : "DRAFT" },
      });
      return NextResponse.json({ success: true, updated: result.count });
    }

    // ── Bulk stock — set the same stock quantity on many products ──
    if (action === "charm") {
      const result = await prisma.product.updateMany({ where: { id: { in: ids } }, data: { hasCharm: Boolean(body.hasCharm) } });
      return NextResponse.json({ success: true, updated: result.count });
    }

    if (action === "stock") {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
        return NextResponse.json({ error: "Stock must be a whole number between 0 and 100000" }, { status: 400 });
      }
      const result = await prisma.product.updateMany({ where: { id: { in: ids } }, data: { stock } });
      return NextResponse.json({ success: true, updated: result.count });
    }

    // ── Bulk prices — body.updates = [{ id, price, comparePrice }] (paise) ──
    if (action === "prices") {
      const updates = Array.isArray(body.updates) ? body.updates : [];
      const clean = updates
        .map((u: any) => ({ id: Number(u.id), price: Number(u.price), comparePrice: u.comparePrice == null ? null : Number(u.comparePrice) }))
        .filter((u: any) => u.id && Number.isInteger(u.price) && u.price > 0 && (u.comparePrice === null || (Number.isInteger(u.comparePrice) && u.comparePrice > u.price)));
      if (clean.length === 0) return NextResponse.json({ error: "No valid price updates" }, { status: 400 });
      await prisma.$transaction(clean.map((u: any) => prisma.product.update({ where: { id: u.id }, data: { price: u.price, comparePrice: u.comparePrice } })));
      return NextResponse.json({ success: true, updated: clean.length });
    }

    // ── Permanent purge — per-product cleanup (images, related rows), run
    // in parallel across products rather than one-request-per-product. ──
    if (action === "purge") {
      const products = await prisma.product.findMany({ where: { id: { in: ids } } });

      let purged = 0, blocked = 0, failed = 0;

      await Promise.all(products.map(async (product) => {
        try {
          const hasOrders = await prisma.orderItem.findFirst({ where: { productId: product.id } });
          if (hasOrders) { blocked++; return; }

          try {
            await Promise.all(product.images.map((url) => deleteFromCloudinary(url)));
          } catch {}

          await prisma.$transaction([
            prisma.review.deleteMany({ where: { productId: product.id } }),
            prisma.cartItem.deleteMany({ where: { productId: product.id } }),
            prisma.wishlist.deleteMany({ where: { productId: product.id } }),
            prisma.product.delete({ where: { id: product.id } }),
          ]);
          purged++;
        } catch {
          failed++;
        }
      }));

      return NextResponse.json({ success: true, purged, blocked, failed });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (err) {
    console.error("BULK PRODUCT ACTION ERROR:", err);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
