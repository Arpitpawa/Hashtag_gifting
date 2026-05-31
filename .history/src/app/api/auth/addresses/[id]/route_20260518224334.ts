import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where:  { email: session!.user!.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, phone, street, city, state, pincode, isDefault } = await req.json();

    // Verify ownership
    const address = await prisma.address.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Unset other defaults if setting this as default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data:  { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: Number(id) },
      data: {
        name, phone, street, city, state, pincode,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, address: updated });

  } catch (err) {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where:  { email: session!.user!.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const address = await prisma.address.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true, message: "Address deleted" });

  } catch (err) {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}