import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET(req: Request) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const deliveryStatus = searchParams.get("deliveryStatus");
    const paymentStatus  = searchParams.get("paymentStatus");
    const search         = searchParams.get("search");
    const page           = parseInt(searchParams.get("page") || "1");
    const limit          = parseInt(searchParams.get("limit") || "20");
    const skip           = (page - 1) * limit;

    const where: any = {};

    if (deliveryStatus && deliveryStatus !== "all") {
      where.deliveryStatus = deliveryStatus;
    }
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }
    if (search) {
      const numId = Number(search);
      where.OR = [
        !isNaN(numId) ? { id: numId } : null,
        { user: { name:  { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ].filter(Boolean);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
        include: {
          user:  { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("ADMIN ORDERS ERROR:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}