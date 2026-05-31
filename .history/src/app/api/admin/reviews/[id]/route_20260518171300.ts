import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// PATCH — approve or reject
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { status } = await req.json();

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id: Number(params.id) },
      data:  { status },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE — remove review
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await prisma.review.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}