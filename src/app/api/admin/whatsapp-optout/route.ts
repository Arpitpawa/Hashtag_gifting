import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { normalizePhone, recordWhatsAppOptOut, removeWhatsAppOptOut } from "@/lib/whatsapp";

// Manual fallback for opting a number out of PROMOTIONAL WhatsApp messages
// (abandoned-cart reminders) — used today, before any WhatsApp API provider
// is wired up, since sends are currently a human clicking a wa.me link by
// hand. If a customer asks to stop some other way (a call, replying on the
// admin's own phone), an admin marks it here. Once a real provider's inbound
// webhook is pointed at /api/webhooks/whatsapp-inbound, a STOP reply records
// the same way automatically — this manual path keeps working alongside it.
// Never affects transactional order-status messages — see src/lib/whatsapp.ts.

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const optOuts = await prisma.whatsAppOptOut.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, optOuts });
  } catch (err) {
    console.error("WHATSAPP OPTOUT LIST ERROR:", err);
    return NextResponse.json({ error: "Failed to load opted-out numbers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { phone } = await req.json();
    const normalized = normalizePhone(String(phone || ""));
    if (!normalized || normalized.length !== 10) {
      return NextResponse.json({ error: "A valid 10-digit phone number is required" }, { status: 400 });
    }

    await recordWhatsAppOptOut(normalized, "manual");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WHATSAPP OPTOUT CREATE ERROR:", err);
    return NextResponse.json({ error: "Failed to opt out this number" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || "";
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json({ error: "phone query param is required" }, { status: 400 });
    }

    await removeWhatsAppOptOut(normalized);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WHATSAPP OPTOUT DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to un-mute this number" }, { status: 500 });
  }
}
