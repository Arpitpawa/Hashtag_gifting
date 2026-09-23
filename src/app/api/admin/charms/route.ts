import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET — list all charms
export async function GET() {
  try {
    const charms = await prisma.charm.findMany({
      orderBy: { number: "asc" },
    });
    return NextResponse.json(charms);
  } catch {
    return NextResponse.json({ error: "Failed to fetch charms" }, { status: 500 });
  }
}

// POST — create new charm
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { name, number, image } = await req.json();
    if (!name || !number || !image) {
      return NextResponse.json({ error: "Name, number and image are required" }, { status: 400 });
    }
    const charm = await prisma.charm.create({
      data: { name, number: Number(number), image },
    });
    return NextResponse.json({ success: true, charm });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Charm number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create charm" }, { status: 500 });
  }
}