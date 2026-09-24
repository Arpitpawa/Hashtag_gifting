import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { isValidPincode } from "@/lib/helpers";

// Pincodes we know are real (verified via India Post below) but can't
// currently deliver to — add specific pincodes here if that ever comes up.
const PAN_INDIA_EXCLUDED: string[] = [];

// Look up a pincode against India Post's official public directory
// (https://api.postalpincode.in) to confirm it's a real, allocated Indian
// PIN code and find out exactly where it is — no hardcoded pincode list,
// this covers every pincode in the country the same way.
type LookupResult =
  | { ok: true; area: string; district: string; state: string }
  // "not_found" -> India Post answered and this pincode genuinely isn't
  // allocated. "unreachable" -> we couldn't get an answer at all (timeout,
  // network error, bad response) -- this is NOT the same as an invalid
  // pincode and must never be shown to the customer as one. Matters most
  // right after a cold start on serverless: the function spinning up plus
  // the external round-trip can blow past a tight timeout on the very
  // first request after any idle period.
  | { ok: false; reason: "not_found" | "unreachable" };

async function lookupIndiaPost(pincode: string): Promise<LookupResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: controller.signal,
      next:   { revalidate: 60 * 60 * 24 }, // pincode data barely changes — cache a day
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, reason: "unreachable" };

    const data  = await res.json();
    const entry = Array.isArray(data) ? data[0] : null;
    const po    = entry?.PostOffice?.[0];
    if (entry?.Status !== "Success" || !po) return { ok: false, reason: "not_found" };

    return {
      ok:       true,
      area:     po.Name     as string,
      district: po.District as string,
      state:    po.State    as string,
    };
  } catch (e) {
    console.error("INDIA POST LOOKUP ERROR:", e);
    return { ok: false, reason: "unreachable" };
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── RATE LIMIT ──
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`pincode:${ip}`, { maxRequests: 30, windowMs: 60_000 });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body    = await req.json();
    const pincode = body?.pincode?.toString().trim();

    // ── VALIDATE FORMAT ──
    if (!pincode || !isValidPincode(pincode)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 6-digit pincode" },
        { status: 400 }
      );
    }

    // ── CHECK EXCLUDED ──
    if (PAN_INDIA_EXCLUDED.includes(pincode)) {
      return NextResponse.json({
        success:         false,
        deliverable:     false,
        message:         "Delivery not available at this pincode",
        area:            null,
        expressDelivery: false,
        estimatedDays:   null,
      });
    }

    // ── VERIFY IT'S A REAL, ALLOCATED INDIAN PINCODE ──
    // Everything below is decided from what India Post actually returns —
    // no hardcoded list of specific pincodes or prefixes to maintain.
    const lookup = await lookupIndiaPost(pincode);

    if (!lookup.ok) {
      const unreachable = lookup.reason === "unreachable";
      return NextResponse.json({
        success:         false,
        deliverable:     false,
        message:         unreachable
          ? "Couldn't verify delivery for this pincode right now -- please try again in a moment."
          : "That doesn't look like a valid Indian pincode. Please double-check and try again.",
        area:            null,
        expressDelivery: false,
        estimatedDays:   null,
      }, { status: unreachable ? 503 : 200 });
    }

    const { area, district, state } = lookup;
    const isJaipur    = /jaipur/i.test(district);
    const isRajasthan = /rajasthan/i.test(state);

    const expressDelivery = isJaipur;
    const estimatedDays   = isJaipur ? 1 : isRajasthan ? 3 : 7;
    const areaLabel        = isJaipur ? `${area}, Jaipur, Rajasthan` : `${district}, ${state}`;
    const message           = isJaipur
      ? `✓ Same-day delivery available in ${area}`
      : isRajasthan
        ? "✓ Delivery available in 2–3 business days"
        : "✓ Delivery available in 5–7 business days";

    return NextResponse.json({
      success:         true,
      deliverable:     true,
      area:            areaLabel,
      expressDelivery,
      estimatedDays,
      message,
    });

  } catch (err) {
    console.error("PINCODE CHECK ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to check delivery. Please try again." },
      { status: 500 }
    );
  }
}
