import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, images: true,
              },
            },
          },
        },
      },
    });

    // Never send Razorpay payment secrets/IDs to the browser.
    const safe = orders.map(({ razorpaySignature, razorpayPaymentId, ...rest }: any) => rest);
    return NextResponse.json(safe);
  } catch (err) {
    console.error("MY ORDERS ERROR:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}