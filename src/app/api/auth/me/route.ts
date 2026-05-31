import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id:        true,
        name:      true,
        email:     true,
        phone:     true,
        image:     true,
        role:      true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: "desc" },
        },
        _count: {
          select: {
            orders:   true,
            wishlist: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("ME ERROR:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}