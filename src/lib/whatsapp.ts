// ── WhatsApp abandoned-cart messaging ──────────────────────────────────────
//
// No WhatsApp Business API provider is wired up yet (still comparing
// providers/pricing as of Sep 2026). Everything here works today WITHOUT
// one: the cron scan builds the message text and a free "click to chat"
// link (wa.me — works for any WhatsApp number, no API/account needed), and
// an admin can open that link and hit send by hand from the Abandoned Carts
// admin page. sendWhatsAppMessage() below is the ONE place to fill in once
// a real provider is picked — nothing else in the codebase needs to change.
//
// IMPORTANT — read before wiring up a real provider: WhatsApp's Business
// Platform only allows freeform text to someone who messaged your business
// number in the last 24 hours ("session window"). An abandoned-cart
// reminder is being sent to someone who has NOT just messaged you, so it
// must go out as a pre-approved "Marketing" or "Utility" message TEMPLATE
// (submitted to Meta for approval through whichever provider you pick —
// Gupshup, WATI, Interakt, AiSensy, Twilio, MSG91, etc. all have a template
// submission flow). You cannot just send the plain text from
// buildAbandonedCartMessage() as a raw message once an API is connected —
// that text is meant to become the approved template's body copy (with
// {{1}}, {{2}} etc. placeholders for the name/product/link), and the
// product image becomes the template's header image. Budget a few days for
// Meta's template review before this can go fully live and automatic.
//
// To wire up a real provider later:
//   1. Set WHATSAPP_API_PROVIDER (e.g. "gupshup"), plus whatever
//      auth/account env vars that provider needs.
//   2. Replace the body of sendWhatsAppMessage() below with that provider's
//      actual "send template message" API call, passing the same
//      name/product/link values buildAbandonedCartMessage() already
//      assembles as the template's variables.
//   3. Nothing in the cron route or the admin page needs to change.
//
// Optional discount hook — set ABANDONED_CART_COUPON_CODE in env to an
// existing, active coupon's code (created in Admin -> Coupons like any
// other) and the cron scan will look it up and fold its real discount into
// the message ("GET EXTRA 7% OFF — use code X"), matching the reference
// "Confetti"-style template Arpit shared. Leave it unset for a plain
// reminder with no discount.
//
// ── Opt-out (STOP) handling ─────────────────────────────────────────────
// Every abandoned-cart reminder ends with "Reply STOP if you wish to opt
// out" (standard WhatsApp marketing-template practice, and Meta requires
// honoring it). sendWhatsAppMessage() below takes a required `category`:
// "promotional" (abandoned-cart reminders) checks the WhatsAppOptOut table
// first and silently skips anyone who's opted out; "transactional" (order
// confirmed/shipped/out for delivery/delivered/cancelled) NEVER checks it —
// those are the customer's own order info, not marketing, and keep sending
// regardless, same as Amazon/Flipkart still SMS you delivery updates even
// if you've opted out of their promos.
//
// A number gets INTO that table two ways: (1) automatically, once a real
// WhatsApp provider is wired up and its inbound webhook points at
// /api/webhooks/whatsapp-inbound (already built — see that file), which
// catches a customer's STOP reply the moment it arrives; (2) right now,
// today, before any provider exists — an admin can manually mark a number
// opted out from the Abandoned Carts admin page (POST
// /api/admin/whatsapp-optout) if a customer asks to stop some other way
// (calls, replies on the admin's own WhatsApp when sending the free wa.me
// link by hand, etc). Either way, the abandoned-cart cron also skips
// creating an alert at all for an opted-out number, so it never even shows
// up for an admin to manually message again.

import prisma from "@/lib/prisma";

/**
 * Normalizes any phone input (with/without +91, spaces, dashes) down to a
 * bare 10-digit string — the convention every phone field in this codebase
 * already uses (User.phone, AbandonedCartAlert.phone, addressSnapshot.phone).
 * Used everywhere a phone is looked up or stored here so "+919876543210",
 * "9876543210" and "91 98765 43210" all match the same opt-out record.
 */
export function normalizePhone(phone: string): string {
  return (phone || "").replace(/\D/g, "").slice(-10);
}

/** True if this phone has opted out of PROMOTIONAL WhatsApp messages. */
export async function isOptedOutOfPromotions(phone: string): Promise<boolean> {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  const row = await prisma.whatsAppOptOut.findUnique({ where: { phone: normalized } });
  return !!row;
}

/** Records an opt-out. Safe to call repeatedly — upserts, never duplicates. */
export async function recordWhatsAppOptOut(
  phone: string,
  reason: "customer_reply" | "manual" = "customer_reply"
): Promise<void> {
  const normalized = normalizePhone(phone);
  if (!normalized) return;
  await prisma.whatsAppOptOut.upsert({
    where:  { phone: normalized },
    update: {},
    create: { phone: normalized, reason },
  });
}

/** Removes an opt-out (admin "Unmute"). */
export async function removeWhatsAppOptOut(phone: string): Promise<void> {
  const normalized = normalizePhone(phone);
  if (!normalized) return;
  await prisma.whatsAppOptOut.deleteMany({ where: { phone: normalized } });
}

interface AbandonedCartCoupon {
  code:  string;
  type:  string; // "PERCENT" | "FIXED"
  value: number;
}

interface AbandonedCartMessageInput {
  customerName:     string;
  itemCount:        number;
  firstProductName: string;
  customizable:     boolean; // does the first item support personalization?
  fastDelivery:     boolean;
  cartUrl:          string;
  coupon?:          AbandonedCartCoupon | null;
}

/**
 * Plain-text version of the reminder — becomes a WhatsApp template's body
 * once one is approved. Modeled on the reference screenshot Arpit sent
 * (a "Confetti"-style cart-recovery template): discount hook up top,
 * a warm one-line reassurance, a couple of benefit bullets pulled from the
 * actual product's own flags (not hardcoded — a non-customizable product
 * won't falsely claim personalization), a CTA link, and the "Reply STOP"
 * opt-out line WhatsApp marketing templates are expected to carry.
 */
export function buildAbandonedCartMessage({
  customerName,
  itemCount,
  firstProductName,
  customizable,
  fastDelivery,
  cartUrl,
  coupon,
}: AbandonedCartMessageInput): string {
  const firstName = (customerName || "there").trim().split(/\s+/)[0];
  const itemPhrase =
    itemCount > 1 ? `${itemCount} items, including *${firstProductName}*` : `*${firstProductName}*`;

  const lines: string[] = [];

  if (coupon) {
    const discount = coupon.type === "PERCENT" ? `${coupon.value}%` : `Rs. ${coupon.value}`;
    lines.push(`🎁 *GET EXTRA ${discount} OFF* — use code *${coupon.code}*`, "");
  }

  lines.push(
    `Hi ${firstName}! The smallest gestures often mean the most 💛`,
    `You left ${itemPhrase} in your Hashtag Gifting cart — it's still saved and waiting for you.`,
    ""
  );

  const benefits: string[] = [];
  if (customizable) benefits.push("✨ Personalization available — make it yours");
  if (fastDelivery)  benefits.push("⚡ Fast delivery — there when it matters");
  if (benefits.length) {
    lines.push("Why you'll love it:", ...benefits, "");
  }

  lines.push(
    coupon
      ? `Apply *${coupon.code}* at checkout to complete your order: ${cartUrl}`
      : `Complete your order here: ${cartUrl}`,
    "",
    "Reply STOP if you wish to opt out."
  );

  return lines.join("\n");
}

/**
 * A free "click to chat" WhatsApp link — opens a chat with the given number
 * with the message pre-filled, ready for a human to review and hit send.
 * No WhatsApp Business API, account, or cost required. `phone` is a bare
 * 10-digit Indian number (the format stored on User.phone site-wide).
 */
export function buildWhatsAppClickToChatLink(phone: string, message: string): string {
  const digitsOnly = normalizePhone(phone);
  return `https://wa.me/91${digitsOnly}?text=${encodeURIComponent(message)}`;
}

// ── Order lifecycle messages ────────────────────────────────────────────
//
// The same "every ecom brand does this" flow customers expect by SMS/email
// already: placed, shipped, out for delivery, delivered, cancelled. These
// call sendWhatsAppMessage() the same non-blocking way sendEmail() is
// already called at each of these points in the codebase (orders/create,
// orders/verify, payment/webhook, admin/orders/[id]) — safe no-op until a
// provider is configured, same as everything else in this file.

function firstNameOf(name: string): string {
  return (name || "there").trim().split(/\s+/)[0];
}

export function buildOrderConfirmedMessage(params: {
  customerName: string;
  orderId: number;
  itemCount: number;
  total: string; // pre-formatted, e.g. "Rs. 1,278"
  paymentMethod: string; // "cod" | "online"
  orderUrl: string;
}): string {
  const { customerName, orderId, itemCount, total, paymentMethod, orderUrl } = params;
  const paidLine = paymentMethod === "cod"
    ? "Pay cash when it arrives."
    : "Payment received — thank you!";
  return [
    `✅ *Order Confirmed* — Hashtag Gifting`,
    `Hi ${firstNameOf(customerName)}! Your order #${orderId} (${itemCount} item${itemCount > 1 ? "s" : ""}, ${total}) is confirmed. ${paidLine}`,
    "",
    `Track it here: ${orderUrl}`,
  ].join("\n");
}

export function buildOrderShippedMessage(params: {
  customerName: string;
  orderId: number;
  trackingId: string;
  orderUrl: string;
}): string {
  const { customerName, orderId, trackingId, orderUrl } = params;
  return [
    `📦 *Your order has shipped!*`,
    `Hi ${firstNameOf(customerName)}! Order #${orderId} is on its way. Tracking ID: *${trackingId}*.`,
    "",
    `Track it here: ${orderUrl}`,
  ].join("\n");
}

export function buildOrderOutForDeliveryMessage(params: {
  customerName: string;
  orderId: number;
  orderUrl: string;
}): string {
  const { customerName, orderId, orderUrl } = params;
  return [
    `🚚 *Out for delivery*`,
    `Hi ${firstNameOf(customerName)}! Order #${orderId} is out for delivery and should reach you today.`,
    "",
    `Track it here: ${orderUrl}`,
  ].join("\n");
}

export function buildOrderDeliveredMessage(params: {
  customerName: string;
  orderId: number;
  orderUrl: string;
}): string {
  const { customerName, orderId, orderUrl } = params;
  return [
    `🎁 *Delivered!*`,
    `Hi ${firstNameOf(customerName)}! Order #${orderId} has been delivered. We hope they loved it 💛`,
    "",
    `Need help with anything? ${orderUrl}`,
  ].join("\n");
}

export function buildOrderCancelledMessage(params: {
  customerName: string;
  orderId: number;
  orderUrl: string;
}): string {
  const { customerName, orderId, orderUrl } = params;
  return [
    `Order #${orderId} has been cancelled.`,
    `Hi ${firstNameOf(customerName)}, your order has been cancelled. Any payment made will be refunded within a few business days.`,
    "",
    `Questions? ${orderUrl}`,
  ].join("\n");
}

interface SendWhatsAppParams {
  to:       string; // bare 10-digit Indian number
  message:  string;
  imageUrl?: string;
  /**
   * "transactional" — order confirmed/shipped/out for delivery/delivered/
   * cancelled. Always sends, never checks the opt-out list.
   * "promotional" — abandoned-cart reminders (and any future marketing
   * message). Checked against WhatsAppOptOut first; silently skipped for
   * anyone who's opted out.
   * Required deliberately — every call site has to pick one on purpose
   * rather than accidentally defaulting to whichever behavior is less safe.
   */
  category: "transactional" | "promotional";
}

/**
 * Safe no-op until a provider is configured (same pattern as sendEmail()
 * before RESEND_API_KEY / Sentry before its DSN) — never throws, so the
 * cron scan can always run and log alerts as READY even with nothing
 * wired up yet.
 */
export async function sendWhatsAppMessage({
  to,
  message,
  category,
}: SendWhatsAppParams): Promise<{ sent: boolean; reason?: string }> {
  if (category === "promotional" && (await isOptedOutOfPromotions(to))) {
    console.warn(`WhatsApp send skipped (opted out of promotional messages) — would have messaged +91${to}`);
    return { sent: false, reason: "opted_out" };
  }

  if (!process.env.WHATSAPP_API_PROVIDER) {
    console.warn(`WhatsApp send skipped (no provider configured) — would message +91${to}: "${message}"`);
    return { sent: false, reason: "no_provider_configured" };
  }

  // TODO: once a provider is chosen, replace this with its real API call.
  console.warn("WHATSAPP_API_PROVIDER is set but sendWhatsAppMessage() has no implementation yet.");
  return { sent: false, reason: "not_implemented" };
}
