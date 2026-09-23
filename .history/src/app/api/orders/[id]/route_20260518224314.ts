import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where:  { email: session!.user!.email! },
      select: { id: true, role: true },
    });

    const order = await prisma.order.findUnique({
      where:   { id: Number(id) },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true,
                images: true, customizable: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only owner or admin can view
    if (order.userId !== user?.id && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}