import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";
import { getCache, setCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  // ── AUTH CHECK ──
  const { error } = await requireAdmin();
  if (error) return error;

  // ── RATE LIMIT ──
  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`admin-dashboard:${ip}`, {
    maxRequests: 30,
    windowMs:    60_000,
  });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // ── CACHE (30s) — dashboard is expensive ──
  const cached = getCache<any>("admin:dashboard");
  if (cached) {
    return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalCustomers,
      pendingReviews,
      lowStockProducts,
      paidOrders,
      recentOrders,
      todayOrders,
      monthOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.order.count({ where: { deliveryStatus: "PROCESSING" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.review.count({ where: { status: "PENDING" } }),

      // Low stock — less than 5 units
      prisma.product.findMany({
        where:   { stock: { lt: 5 }, status: "ACTIVE" },
        select:  { id: true, name: true, stock: true, images: true },
        orderBy: { stock: "asc" },
        take:    10,
      }),

      // Revenue from paid orders
      prisma.order.findMany({
        where:  { paymentStatus: "PAID" },
        select: { totalAmount: true, createdAt: true },
      }),

      // Recent 5 orders
      prisma.order.findMany({
        take:    5,
        orderBy: { createdAt: "desc" },
        select: {
          id:             true,
          totalAmount:    true,
          paymentStatus:  true,
          deliveryStatus: true,
          createdAt:      true,
          addressSnapshot: true,
          user: { select: { name: true, email: true } },
          items: {
            take:    1,
            select: { product: { select: { name: true, images: true } } },
          },
        },
      }),

      // Today's orders count
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // This month's orders
      prisma.order.findMany({
        where:  { createdAt: { gte: thirtyDaysAgo }, paymentStatus: "PAID" },
        select: { totalAmount: true, createdAt: true },
      }),
    ]);

    // ── CALCULATE REVENUE ──
    const totalRevenue  = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthRevenue  = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // ── REVENUE CHART (last 7 days) ──
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const revenueByDay = last7Days.map((day) => {
      const dayOrders = paidOrders.filter(
        (o) => o.createdAt.toISOString().split("T")[0] === day
      );
      return {
        date:    day,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        orders:  dayOrders.length,
      };
    });

    const response = {
      summary: {
        totalRevenue,          // paise
        monthRevenue,          // paise
        totalOrders,
        pendingOrders,
        todayOrders,
        totalCustomers,
        totalProducts,
        activeProducts,
        pendingReviews,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      lowStockProducts,
      revenueByDay,
    };

    // Cache for 30 seconds
    setCache("admin:dashboard", response, 30);

    return NextResponse.json(response);

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}