import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, phone, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name)  updateData.name  = name;
    if (phone) {
      updateData.phone = phone;
      // A changed number is unverified until it's proven again by OTP.
      if (phone !== user.phone) updateData.phoneVerifiedAt = null;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { error: "Cannot set password for Google accounts" },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true, image: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}