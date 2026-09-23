import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // ── AUTH REQUIRED ──
  const { error, session } = await requireAuth();
  if (error) return error;

  // ── RATE LIMIT ──
  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`reorder:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { orderId } = await req.json();

    // ── VERIFY OWNERSHIP ──
    const user = await prisma.user.findUnique({
      where:  { id: Number(session!.user!.id) },
      select: { id: true },
    });

    const order = await prisma.order.findUnique({
      where:   { id: Number(orderId) },
      include: { items: { include: { product: { select: { id: true, stock: true, status: true } } } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow owner to reorder
    if (order.userId !== user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // ── FILTER: Only add items that are still available ──
    const availableItems = order.items.filter(
      (item: any) => item.product.status === "ACTIVE" && item.product.stock > 0
    );

    if (availableItems.length === 0) {
      return NextResponse.json(
        { error: "None of the products from this order are currently available" },
        { status: 400 }
      );
    }

    // ── CREATE NEW CART ──
    const cart = await prisma.cart.create({
      data: {
        userId: user!.id,
        items: {
          create: availableItems.map((item: any) => ({
            productId:     item.productId,
            quantity:      Math.min(item.quantity, item.product.stock), // cap at current stock
            customization: item.customization || null,
          })),
        },
      },
      include: { items: true },
    });

    const skippedCount = order.items.length - availableItems.length;

    return NextResponse.json({
      success:   true,
      cartId:    cart.id,
      itemCount: availableItems.length,
      message:   skippedCount > 0
        ? `${availableItems.length} item(s) added to cart. ${skippedCount} item(s) are no longer available.`
        : "All items added to cart",
    });

  } catch (err) {
    console.error("REORDER ERROR:", err);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}