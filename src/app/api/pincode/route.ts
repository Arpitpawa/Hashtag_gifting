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
async function lookupIndiaPost(pincode: string): Promise<{ area: string; district: string; state: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: controller.signal,
      next:   { revalidate: 60 * 60 * 24 }, // pincode data barely changes — cache a day
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const data  = await res.json();
    const entry = Array.isArray(data) ? data[0] : null;
    const po    = entry?.PostOffice?.[0];
    if (entry?.Status !== "Success" || !po) return null;

    return {
      area:     po.Name     as string,
      district: po.District as string,
      state:    po.State    as string,
    };
  } catch (e) {
    console.error("INDIA POST LOOKUP ERROR:", e);
    return null;
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
    const postOffice = await lookupIndiaPost(pincode);

    if (!postOffice) {
      return NextResponse.json({
        success:         false,
        deliverable:     false,
        message:         "That doesn't look like a valid Indian pincode. Please double-check and try again.",
        area:            null,
        expressDelivery: false,
        estimatedDays:   null,
      });
    }

    const { area, district, state } = postOffice;
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
