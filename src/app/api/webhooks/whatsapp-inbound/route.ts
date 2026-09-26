import { NextRequest, NextResponse } from "next/server";
import { recordWhatsAppOptOut } from "@/lib/whatsapp";

// ── Inbound WhatsApp webhook — handles "STOP" opt-out replies ──────────────
//
// No WhatsApp API provider is wired up yet, so nothing calls this endpoint
// today. It's built ahead of time so wiring up a provider later is just
// pointing that provider's "inbound message webhook" URL setting here —
// nothing else in the codebase needs to change.
//
// OPT-OUT KEYWORDS: WhatsApp/Meta's own guidance (and the same convention
// SMS gateways have used for years) is "STOP" — also commonly "UNSUBSCRIBE",
// "CANCEL", "END", "QUIT". Any of these, received as the ENTIRE message body
// (trimmed, case-insensitive — "Stop" / "stop " / "STOP" all match), marks
// that phone number opted out of PROMOTIONAL WhatsApp messages via
// recordWhatsAppOptOut() — see src/lib/whatsapp.ts. sendWhatsAppMessage()
// checks that before sending anything tagged category:"promotional"
// (currently just the abandoned-cart reminder) and silently skips it.
//
// Transactional order-status messages (order confirmed / shipped / out for
// delivery / delivered / cancelled) are NEVER affected by this — those keep
// sending regardless, same as how Amazon/Flipkart still text you delivery
// updates even after you've opted out of their promotions.
//
// TODO once a provider is picked: every provider (Gupshup, WATI, Interakt,
// AiSensy, Twilio, MSG91, or Meta's own Cloud API directly) sends inbound
// messages in ITS OWN JSON shape — none of them match each other exactly.
// extractPhoneAndText() below tries Meta's Cloud API shape plus a few common
// simplified BSP shapes, and falls through to logging the raw body so you
// can see the real shape in the logs and adjust it in a couple of minutes
// once you're looking at real payloads from whichever provider you picked.
//
// Also add that provider's own webhook signature/secret verification here
// before relying on this in production — right now this endpoint has no
// auth at all, which is fine while nothing points at it, but not once it's
// a real public URL a stranger could POST arbitrary JSON to.

const OPT_OUT_KEYWORDS = ["stop", "unsubscribe", "cancel", "end", "quit"];

// Payload shape is whatever the eventually-chosen provider sends — genuinely
// unknown until then, same reasoning as the Razorpay webhook's own `event: any`
// a few files over.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPhoneAndText(body: any): { phone: string | null; text: string | null } {
  // Meta WhatsApp Cloud API shape (also what several BSPs pass through as-is)
  const metaMessage = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (metaMessage) {
    return {
      phone: metaMessage.from || null,
      text:  metaMessage.text?.body || null,
    };
  }

  // Common simplified shapes various BSP webhooks use — try the usual
  // field names; harmless if none of these exist on a given payload.
  const phone =
    body?.from ?? body?.sender ?? body?.phone ?? body?.mobile ??
    body?.payload?.sender?.phone ?? body?.contacts?.[0]?.wa_id ?? null;
  const text =
    body?.text ?? body?.message ?? body?.body ?? body?.payload?.payload?.text ?? null;

  return {
    phone: phone != null ? String(phone) : null,
    text:  text  != null ? String(text)  : null,
  };
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    // Don't fail a provider's delivery/retry over an unparsable body.
    return NextResponse.json({ received: true });
  }

  const { phone, text } = extractPhoneAndText(body);

  if (!phone || !text) {
    console.warn("WHATSAPP INBOUND: could not find phone/text in payload — adjust extractPhoneAndText() to this provider's shape. Raw body:", JSON.stringify(body));
    return NextResponse.json({ received: true });
  }

  if (OPT_OUT_KEYWORDS.includes(text.trim().toLowerCase())) {
    await recordWhatsAppOptOut(phone, "customer_reply");
    console.log(`WHATSAPP INBOUND: ${phone} opted out of promotional messages (replied "${text.trim()}")`);
  }

  // Always 200 — providers retry on non-2xx, same convention already used
  // for the Razorpay webhook in this codebase.
  return NextResponse.json({ received: true });
}

// Meta's own Cloud API (and providers that pass its webhook through
// directly) verifies a webhook URL with a GET request carrying
// hub.mode/hub.verify_token/hub.challenge before it'll send anything here.
// Only relevant once that kind of provider is chosen — set
// WHATSAPP_WEBHOOK_VERIFY_TOKEN in env then (a value you make up yourself
// and also enter in that provider's dashboard).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
