import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { esc } from "@/lib/emailTemplates";

/**
 * Email verification is ENFORCED at login only when
 * REQUIRE_EMAIL_VERIFICATION=true in .env. Leave it off until email sending
 * (Resend) is configured, otherwise nobody could log in. The pre-hijack
 * protection (Google sign-in taking over an unverified password account)
 * is always on.
 */
export const requireEmailVerification = () => process.env.REQUIRE_EMAIL_VERIFICATION === "true";

export const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

/** Creates a fresh 24h verification token for the user and emails the link. */
export async function issueEmailVerification(user: { id: number; email: string | null; name: string | null }) {
  if (!user.email) return;
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken:     hashToken(token),
      emailVerifyExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    } as any,
  });

  const base = process.env.NEXTAUTH_URL || "";
  const url  = `${base}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to:      user.email,
    subject: "Verify your email — Hashtag Gifting",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a;margin-bottom:8px">Confirm your email</h2>
        <p style="color:#555;margin-bottom:24px">Hi ${esc(user.name || "there")},</p>
        <p style="color:#555;margin-bottom:24px">
          Thanks for joining Hashtag Gifting. Please confirm this is your email address.
          This link is valid for 24 hours.
        </p>
        <a href="${url}"
          style="display:inline-block;background:#c0555a;color:white;text-decoration:none;padding:14px 28px;border-radius:100px;font-weight:bold;font-size:14px">
          Verify my email
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">If you didn't create an account, you can ignore this email.</p>
      </div>`,
  });
}
