import crypto from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit — this endpoint takes a token as the only "auth", worth
    // throttling brute-force guesses even though tokens are 32 random bytes.
    const ip    = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`reset-password:${ip}`, { maxRequests: 10, windowMs: 60_000 });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid or missing reset link" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8 || password.length > 100) {
      return NextResponse.json({ error: "Password must be 8-100 characters" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { resetToken: crypto.createHash("sha256").update(String(token)).digest("hex") } });

    // Same message whether the token is unknown or expired — don't help an
    // attacker distinguish "wrong token" from "right token, too late".
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:            hashedPassword,
        // Clear the token immediately so it can't be reused — a reset link
        // is one-time-use, not valid for the full hour on repeat.
        resetToken:          null,
        resetTokenExpiresAt: null,
        // Signs every existing login (other phones/browsers) out.
        passwordChangedAt:   new Date(),
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}