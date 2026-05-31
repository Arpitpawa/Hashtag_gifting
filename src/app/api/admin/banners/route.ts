import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { title, image, linkUrl, position, isActive, sortOrder } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title:     title     || null,
        image,               // Cloudinary URL
        linkUrl:   linkUrl   || null,
        position:  position  || "hero",
        isActive:  isActive  !== false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}