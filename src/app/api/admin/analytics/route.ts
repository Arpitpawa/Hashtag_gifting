import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const cached = getCache<any>("admin:analytics");
  if (cached) return NextResponse.json(cached);

  try {
    const now   = new Date();
    const d30   = new Date(now.getTime() - 30 * 86400000);
    const d7    = new Date(now.getTime() - 7  * 86400000);
    const today = new Date(new Date().setHours(0,0,0,0));
    const yest  = new Date(today.getTime() - 86400000);

    const [revenueOrders30, todayAllCount, yesterdayAllCount, todayRevenueAgg, yesterdayRevenueAgg,
           topProducts, ordersByHour, categoryOrders, topCustomers] = await Promise.all([
      // "Revenue" = money actually confirmed or collected: paid online, OR
      // delivered (for Cash on Delivery — cash only actually changes hands
      // once the order is delivered, not at the moment it's placed).
      // Previously this only checked paymentStatus === "PAID", which meant
      // every COD order — sitting at PENDING for its entire lifecycle unless
      // an admin manually flips it — never counted as revenue at all.
      prisma.order.findMany({
        where: {
          OR: [{ paymentStatus: "PAID" }, { deliveryStatus: "DELIVERED" }],
          createdAt: { gte: d30 },
        },
        select: { totalAmount: true, createdAt: true }, orderBy: { createdAt: "asc" },
      }),
      // "Orders" = every order placed, regardless of payment status — this
      // is order *activity*, not revenue, so a COD order counts immediately.
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: yest, lt: today } } }),
      prisma.order.aggregate({
        where: {
          OR: [{ paymentStatus: "PAID" }, { deliveryStatus: "DELIVERED" }],
          createdAt: { gte: today },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          OR: [{ paymentStatus: "PAID" }, { deliveryStatus: "DELIVERED" }],
          createdAt: { gte: yest, lt: today },
        },
        _sum: { totalAmount: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            OR: [{ paymentStatus: "PAID" }, { deliveryStatus: "DELIVERED" }],
            createdAt: { gte: d30 },
          },
        },
        _sum: { quantity: true }, _count: { id: true },
        orderBy: { _count: { id: "desc" } }, take: 5,
      }),
      prisma.order.findMany({ where: { createdAt: { gte: d7 } }, select: { createdAt: true } }),
      prisma.orderItem.findMany({
        where: {
          order: {
            OR: [{ paymentStatus: "PAID" }, { deliveryStatus: "DELIVERED" }],
            createdAt: { gte: d30 },
          },
        },
        select: { quantity: true, product: { select: { category: { select: { name: true } } } } },
      }),
      prisma.order.groupBy({
        by: ["userId"],
        where: {
          OR: [{ paymentStatus: "PAID" }, { deliveryStatus: "DELIVERED" }],
          userId: { not: null },
        },
        _sum: { totalAmount: true }, _count: { id: true },
        orderBy: { _sum: { totalAmount: "desc" } }, take: 10,
      }),
    ]);

    // Revenue by day last 30
    const last30 = Array.from({ length:30 }, (_,i) => {
      const d = new Date(); d.setDate(d.getDate() - (29-i));
      return d.toISOString().split("T")[0];
    });
    const revenueByDay = last30.map(day => ({
      date: day,
      revenue: revenueOrders30.filter((o: any)=>o.createdAt.toISOString().split("T")[0]===day).reduce((s: any,o: any)=>s+o.totalAmount,0),
      orders:  revenueOrders30.filter((o: any)=>o.createdAt.toISOString().split("T")[0]===day).length,
    }));

    // Orders by hour
    const hourMap = Array(24).fill(0);
    ordersByHour.forEach((o: any) => { hourMap[new Date(o.createdAt).getHours()]++; });

    // Category breakdown
    const catMap: Record<string,number> = {};
    categoryOrders.forEach((i: any) => {
      const name = i.product?.category?.name || "Other";
      catMap[name] = (catMap[name]||0) + (i.quantity||1);
    });
    const byCategory = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=>({ name, count }));

    // Enrich top products
    const productDetails = await prisma.product.findMany({
      where:{ id:{ in: topProducts.map((p: any)=>p.productId) } },
      select:{ id:true, name:true, images:true, price:true },
    });
    const enrichedTop = topProducts.map((p: any) => ({ ...p, product: productDetails.find((pd: any)=>pd.id===p.productId) }));

    // Enrich top customers
    const userIds = topCustomers.map((c: any)=>c.userId).filter(Boolean) as number[];
    const userDetails = await prisma.user.findMany({
      where:{ id:{ in:userIds } }, select:{ id:true, name:true, email:true },
    });
    const enrichedCustomers = topCustomers.map((c: any) => ({ ...c, user: userDetails.find((u: any)=>u.id===c.userId) }));

    const todayRev  = todayRevenueAgg._sum.totalAmount || 0;
    const yesterRev = yesterdayRevenueAgg._sum.totalAmount || 0;

    const result = {
      today: {
        revenue: todayRev, orders: todayAllCount,
        revenueChange: yesterRev>0 ? Math.round(((todayRev-yesterRev)/yesterRev)*100) : 0,
        ordersChange:  yesterdayAllCount>0
          ? Math.round(((todayAllCount - yesterdayAllCount)/yesterdayAllCount)*100) : 0,
      },
      revenueByDay, byCategory, hourMap,
      topProducts: enrichedTop, topCustomers: enrichedCustomers,
      totalRevenue30: revenueOrders30.reduce((s: any,o: any)=>s+o.totalAmount,0),
    };

    setCache("admin:analytics", result, 60);
    return NextResponse.json(result);
  } catch (err) {
    console.error("ANALYTICS:", err);
    return NextResponse.json({ error:"Failed" }, { status:500 });
  }
}