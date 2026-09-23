import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const orders = await prisma.order.findMany({
    select: { addressSnapshot: true, totalAmount: true },
  });

  const cityMap: Record<string, { orders: number; revenue: number }> = {};
  orders.forEach(o => {
    const snap = o.addressSnapshot as any;
    const city = snap?.city?.trim();
    if (!city) return;
    const key = city.toLowerCase();
    if (!cityMap[key]) cityMap[key] = { orders: 0, revenue: 0 };
    cityMap[key].orders++;
    cityMap[key].revenue += o.totalAmount;
  });

  const result = Object.entries(cityMap)
    .map(([key, v]) => ({ city: key.charAt(0).toUpperCase() + key.slice(1), ...v }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 50);

  return NextResponse.json({ cities: result });
}