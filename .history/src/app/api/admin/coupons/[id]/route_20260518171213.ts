import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const coupon = await prisma.coupon.findUnique({
    where:   { id: Number(params.id) },
    include: { _count: { select: { orders: true } } },
  });

  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  return NextResponse.json(coupon);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      code, type, value, minAmount,
      isActive, validFrom, validTo, usageLimit,
    } = body;

    const updated = await prisma.coupon.update({
      where: { id: Number(params.id) },
      data: {
        ...(code      && { code: code.toUpperCase().trim() }),
        ...(type      && { type }),
        ...(value     !== undefined && { value: Number(value) }),
        ...(minAmount !== undefined && { minAmount: Number(minAmount) }),
        ...(isActive  !== undefined && { isActive: Boolean(isActive) }),
        ...(validFrom !== undefined && { validFrom: validFrom ? new Date(validFrom) : null }),
        ...(validTo   !== undefined && { validTo:   validTo   ? new Date(validTo)   : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? Number(usageLimit) : null }),
      },
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const id = Number(params.id);

    // Check if coupon is used in orders
    const usedInOrders = await prisma.order.findFirst({ where: { couponId: id } });
    if (usedInOrders) {
      // Soft delete — just deactivate
      await prisma.coupon.update({
        where: { id },
        data:  { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Coupon deactivated (has associated orders)",
      });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}