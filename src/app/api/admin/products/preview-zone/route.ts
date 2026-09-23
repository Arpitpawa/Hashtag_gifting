import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { productId, previewTemplate, previewZones } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: Number(productId) },
      data: {
        previewTemplate: previewTemplate || null,
        previewZones:    previewZones    || null,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save preview config" }, { status: 500 });
  }
}