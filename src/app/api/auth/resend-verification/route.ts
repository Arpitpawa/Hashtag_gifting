import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { issueEmailVerification } from "@/lib/emailVerification";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { email } = await req.json().catch(() => ({}));
  const clean = typeof email === "string" ? email.toLowerCase().trim() : "";

  // 3 per hour per email and 10 per hour per IP.
  const a = rateLimit(`resend-verify:${clean}`, { maxRequests: 3, windowMs: 60 * 60_000 });
  const b = rateLimit(`resend-verify-ip:${ip}`, { maxRequests: 10, windowMs: 60 * 60_000 });
  if (!a.success || !b.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // Same answer whether or not the account exists / is already verified.
  const generic = NextResponse.json({ message: "If that account needs verification, we've sent a new link." });
  if (!clean) return generic;

  const user: any = await prisma.user.findUnique({ where: { email: clean } });
  if (!user || !user.password || user.emailVerifiedAt) return generic;

  await issueEmailVerification(user);
  return generic;
}
