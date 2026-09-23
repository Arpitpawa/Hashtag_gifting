import { esc } from "@/lib/emailTemplates";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 5 requests per hour per IP — generous for a real person who fat-fingered
    // their email, tight enough to stop inbox-bombing or Resend-quota abuse.
    const ip    = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`forgot-password:${ip}`, { maxRequests: 5, windowMs: 60 * 60_000 });
    if (!limit.success) {
      return NextResponse.json(
        { message: "If this email exists, a reset link has been sent." },
        { status: 200 } // same response shape as success — don't reveal rate-limit state to a scripted caller
      );
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
    }

    // Generate token
    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken:          crypto.createHash("sha256").update(token).digest("hex"), // only the hash is stored
        resetTokenExpiresAt: expiresAt,
      } as any,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await sendEmail({
      to:      user.email!,
      subject: "Reset your Hashtag Gifting password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#1a1a1a;margin-bottom:8px">Reset your password</h2>
          <p style="color:#555;margin-bottom:24px">Hi ${esc(user.name || "there")},</p>
          <p style="color:#555;margin-bottom:24px">
            We received a request to reset the password for your Hashtag Gifting account.
            Click the button below to reset it. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#c0555a;color:white;text-decoration:none;padding:14px 28px;border-radius:100px;font-weight:bold;font-size:14px">
            Reset my password
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:24px">
            If you did not request this, you can safely ignore this email. Your password will not change.
          </p>
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0">
          <p style="color:#aaa;font-size:11px">Hashtag Gifting · Jaipur, Rajasthan</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
  }
}