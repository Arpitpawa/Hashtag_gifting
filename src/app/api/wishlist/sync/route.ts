import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { items } = await req.json(); // array of productIds
    const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Sync all guest wishlist items
    for (const productId of items) {
      try {
        await prisma.wishlist.upsert({
          where:  { userId_productId: { userId: user.id, productId: Number(productId) } },
          create: { userId: user.id, productId: Number(productId) },
          update: {},
        });
      } catch {
        // Skip invalid productIds silently
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to sync wishlist" }, { status: 500 });
  }
}