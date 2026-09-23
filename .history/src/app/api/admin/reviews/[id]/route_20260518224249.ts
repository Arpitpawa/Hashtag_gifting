import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id }   = await params;
    const { status } = await req.json();

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id: Number(id) },
      data:  { status },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    await prisma.review.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}