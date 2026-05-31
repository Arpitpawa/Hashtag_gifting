import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // top-level only
      include: {
        children: {
          select: { id: true, name: true, slug: true, image: true },
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}