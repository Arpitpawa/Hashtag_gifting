import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { esc } from "@/lib/emailTemplates";

// Contact-page messages are emailed to the store (ADMIN_EMAIL).
export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const limited = rateLimit(`contact:${ip}`, { maxRequests: 5, windowMs: 10 * 60_000 });
  if (!limited.success) return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });

  let b: any = {};
  try { b = await req.json(); } catch {}
  const name = String(b.name ?? "").trim().slice(0, 100);
  const email = String(b.email ?? "").trim().slice(0, 254);
  const phone = String(b.phone ?? "").trim().slice(0, 20);
  const subject = String(b.subject ?? "").trim().slice(0, 40);
  const message = String(b.message ?? "").trim().slice(0, 3000);

  if (!name || !message) return NextResponse.json({ error: "Name and message are required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    console.error("[contact] ADMIN_EMAIL not set — message from", email, "not delivered");
    return NextResponse.json({ error: "Messaging is temporarily unavailable. Please WhatsApp us." }, { status: 503 });
  }
  await sendEmail({
    to,
    subject: `Website enquiry${subject ? ` (${esc(subject)})` : ""} — ${esc(name)}`,
    html: `<p><b>Name:</b> ${esc(name)}</p><p><b>Email:</b> ${esc(email)}</p><p><b>Phone:</b> ${esc(phone) || "—"}</p><p><b>Topic:</b> ${esc(subject) || "—"}</p><p><b>Message:</b><br>${esc(message).replace(/\n/g, "<br>")}</p>`,
  });
  return NextResponse.json({ ok: true });
}
