import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const order = await prisma.order.update({
    where: { id: parseInt(params.id) },
    data:  body,
  });
  return NextResponse.json({ order });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const order = await prisma.order.findUnique({
    where:   { id: parseInt(params.id) },
    include: {
      user:  { select: { id: true, name: true, email: true } },
      items: { include: { product: { select: { name: true, images: true, price: true } } } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}