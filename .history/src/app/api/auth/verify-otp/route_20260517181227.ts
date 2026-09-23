import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyOtp } from "@/lib/otpManager";
import { rateLimit } from "@/lib/rateLimit";
import { isValidPhone } from "@/lib/helpers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // ── RATE LIMIT ──
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`verify-otp:${ip}`, {
      maxRequests: 10,
      windowMs:    10 * 60_000,
    });

    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait." },
        { status: 429 }
      );
    }

    const { phone, otp } = await req.json();

    // ── VALIDATE INPUT ──
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
    }

    // ── VERIFY OTP ──
    const result = await verifyOtp(phone, otp);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // ── FIND OR CREATE USER ──
    let user = await prisma.user.findFirst({
      where: { phone },
      select: {
        id:    true,
        name:  true,
        email: true,
        phone: true,
        role:  true,
        image: true,
      },
    });

    if (!user) {
      // New user — create account
      user = await prisma.user.create({
        data: {
          phone,
          role:     "CUSTOMER",
          password: "", // Phone users have no password
        },
        select: {
          id:    true,
          name:  true,
          email: true,
          phone: true,
          role:  true,
          image: true,
        },
      });
    }

    // ── RETURN USER DATA FOR NEXTAUTH SIGN IN ──
    // Frontend uses this to call signIn("credentials", { phone, otp })
    return NextResponse.json({
      success: true,
      user,
      message: "Phone verified successfully",
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}