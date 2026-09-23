import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/sanitize";
import type { NextRequest } from "next/server";
import { issueEmailVerification, requireEmailVerification } from "@/lib/emailVerification";

export async function POST(req: NextRequest) {
  try {
    // Strict rate limit on register — 5 per hour per IP
    const ip    = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60 * 60_000 });

    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Sanitize all string inputs
    const name     = body.name     ? sanitizeString(body.name)  : null;
    const email    = body.email    ? sanitizeString(body.email).toLowerCase() : null;
    const password = body.password ? body.password : null; // don't sanitize password
    const phone    = body.phone    ? sanitizeString(body.phone) : null;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 8 || password.length > 100) {
      return NextResponse.json(
        { error: "Password must be 8–100 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where:  { email },
      select: { id: true }, // only fetch id — not full user
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // bcrypt cost factor 12 — good balance of security vs speed
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, role: "CUSTOMER" },
      select: { id: true, name: true, email: true, role: true },
    });

    // Verification email (non-blocking for the response). The phone number
    // typed here is NOT proof of ownership — it only becomes "verified" via OTP.
    try { await issueEmailVerification({ id: user.id, email: user.email, name: user.name }); }
    catch (e) { console.error("VERIFY EMAIL ISSUE ERROR:", e); }

    return NextResponse.json(
      { success: true, user, verificationRequired: requireEmailVerification() },
      { status: 201 }
    );

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}