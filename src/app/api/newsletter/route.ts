import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { esc } from "@/lib/emailTemplates";

// Newsletter sign-up. There's no subscribers table yet, so each sign-up is
// emailed to the store (ADMIN_EMAIL) and logged. Swap for a real list
// (DB table / Mailchimp) when the client decides on a newsletter tool.
export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const limited = rateLimit(`newsletter:${ip}`, { maxRequests: 5, windowMs: 10 * 60_000 });
  if (!limited.success) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  let email = "";
  try { email = String((await req.json())?.email ?? "").trim().toLowerCase(); } catch {}
  if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  console.log("[newsletter] new subscriber:", email);
  const to = process.env.ADMIN_EMAIL;
  if (to) {
    await sendEmail({ to, subject: "New newsletter subscriber", html: `<p>New newsletter sign-up: <b>${esc(email)}</b></p>` });
  }
  return NextResponse.json({ ok: true });
}
