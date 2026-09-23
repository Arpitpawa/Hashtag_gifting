import { NextResponse }  from "next/server";
import type { NextRequest } from "next/server";
import prisma             from "@/lib/prisma";
import { requireAdmin }  from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since
    ? new Date(since)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const [newOrders, lowStock, pendingReviews, failedOrders] = await Promise.all([
      prisma.order.findMany({
        where:   { createdAt: { gte: sinceDate } },
        orderBy: { createdAt: "desc" },
        take:    20,
        select:  {
          id: true, totalAmount: true, paymentStatus: true, createdAt: true,
          addressSnapshot: true, user: { select: { name: true } },
        },
      }),
      prisma.product.findMany({
        where:   { stock: { lt: 5 }, status: "ACTIVE" },
        orderBy: { stock: "asc" },
        take:    10,
        select:  { id: true, name: true, stock: true },
      }),
      prisma.review.findMany({
        where:   { status: "PENDING", createdAt: { gte: sinceDate } },
        orderBy: { createdAt: "desc" },
        take:    10,
        select:  { id: true, name: true, rating: true, createdAt: true,
                   product: { select: { name: true } } },
      }),
      prisma.order.findMany({
        where:   { paymentStatus: "FAILED", updatedAt: { gte: sinceDate } },
        orderBy: { updatedAt: "desc" },
        take:    5,
        select:  { id: true, totalAmount: true, updatedAt: true, addressSnapshot: true },
      }),
    ]);

    const notifications: any[] = [];

    newOrders.forEach(o => {
      const snap = o.addressSnapshot as any;
      notifications.push({
        id: `order-${o.id}`, type: "new_order",
        title: `New order #${o.id}`,
        message: `${snap?.name || o.user?.name || "Guest"} — Rs. ${(o.totalAmount/100).toLocaleString("en-IN")}`,
        status: o.paymentStatus, href: `/admin/orders`,
        time: o.createdAt,
      });
    });

    lowStock.forEach(p => {
      notifications.push({
        id: `stock-${p.id}`, type: "low_stock",
        title: p.stock === 0 ? "Out of stock!" : "Low stock warning",
        message: `${p.name} — ${p.stock === 0 ? "completely out" : `only ${p.stock} left`}`,
        href: `/admin/products`, time: new Date().toISOString(),
      });
    });

    pendingReviews.forEach(r => {
      notifications.push({
        id: `review-${r.id}`, type: "review",
        title: "New review pending",
        message: `${r.name} rated ${r.product?.name} — ${r.rating}★`,
        href: `/admin/reviews`, time: r.createdAt,
      });
    });

    failedOrders.forEach(o => {
      const snap = o.addressSnapshot as any;
      notifications.push({
        id: `failed-${o.id}`, type: "failed_payment",
        title: `Payment failed — Order #${o.id}`,
        message: `${snap?.name || "Customer"} — Rs. ${(o.totalAmount/100).toLocaleString("en-IN")}`,
        href: `/admin/orders`, time: o.updatedAt,
      });
    });

    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({
      notifications: notifications.slice(0, 30),
      counts: {
        newOrders: newOrders.length, lowStock: lowStock.length,
        pendingReviews: pendingReviews.length, failedPayments: failedOrders.length,
        total: notifications.length,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("NOTIFICATIONS ERROR:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}