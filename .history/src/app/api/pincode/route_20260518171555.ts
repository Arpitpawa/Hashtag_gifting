import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { isValidPincode } from "@/lib/helpers";

// Jaipur pincodes — expand this list
const SERVICEABLE_PINCODES: Record<string, {
  area:          string;
  expressDelivery: boolean;  // 3-hour delivery
  standardDays:  number;
}> = {
  // Central Jaipur
  "302001": { area: "Jaipur City Centre",    expressDelivery: true,  standardDays: 1 },
  "302002": { area: "Jaipur City",           expressDelivery: true,  standardDays: 1 },
  "302003": { area: "Jaipur",                expressDelivery: true,  standardDays: 1 },
  "302004": { area: "Jaipur",                expressDelivery: true,  standardDays: 1 },
  "302005": { area: "Jaipur",                expressDelivery: true,  standardDays: 1 },
  "302006": { area: "Jaipur",                expressDelivery: true,  standardDays: 1 },
  "302011": { area: "Sanganer",              expressDelivery: true,  standardDays: 1 },
  "302012": { area: "Mansarovar",            expressDelivery: true,  standardDays: 1 },
  "302013": { area: "Vaishali Nagar",        expressDelivery: true,  standardDays: 1 },
  "302015": { area: "Malviya Nagar",         expressDelivery: true,  standardDays: 1 },
  "302016": { area: "Pratap Nagar",          expressDelivery: true,  standardDays: 1 },
  "302017": { area: "Sodala",                expressDelivery: true,  standardDays: 1 },
  "302018": { area: "Shyam Nagar",           expressDelivery: true,  standardDays: 1 },
  "302019": { area: "Kartarpura",            expressDelivery: true,  standardDays: 1 },
  "302020": { area: "Jhotwara",              expressDelivery: true,  standardDays: 1 },
  "302021": { area: "Muhana",                expressDelivery: false, standardDays: 1 },
  "302022": { area: "Sitapura",              expressDelivery: true,  standardDays: 1 },
  "302023": { area: "Jagatpura",             expressDelivery: true,  standardDays: 1 },
  "302025": { area: "Hawa Sadak",            expressDelivery: true,  standardDays: 1 },
  "302026": { area: "Ambabari",              expressDelivery: true,  standardDays: 1 },
  "302027": { area: "Raja Park",             expressDelivery: true,  standardDays: 1 },
  "302028": { area: "Tilak Nagar",           expressDelivery: true,  standardDays: 1 },
  "302029": { area: "Nirman Nagar",          expressDelivery: true,  standardDays: 1 },
  "302031": { area: "Vidhyadhar Nagar",      expressDelivery: true,  standardDays: 1 },
  "302033": { area: "Niwaru",                expressDelivery: false, standardDays: 2 },
  "302034": { area: "Amer",                  expressDelivery: false, standardDays: 2 },
  "302039": { area: "Goner",                 expressDelivery: false, standardDays: 2 },
  "303119": { area: "Shahpura",              expressDelivery: false, standardDays: 2 },
};

// All Rajasthan pincodes starting with 30 — standard delivery
const RAJASTHAN_PREFIX = "30";

// Pan India — all deliverable, 3-7 days
const PAN_INDIA_EXCLUDED: string[] = []; // add non-serviceable pincodes here

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

    // ── VALIDATE ──
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
        expressDelivery: false,
        estimatedDays:   null,
      });
    }

    // ── CHECK JAIPUR (express delivery) ──
    const jaipurInfo = SERVICEABLE_PINCODES[pincode];
    if (jaipurInfo) {
      return NextResponse.json({
        success:         true,
        deliverable:     true,
        area:            jaipurInfo.area,
        expressDelivery: jaipurInfo.expressDelivery,
        estimatedDays:   jaipurInfo.standardDays,
        message:         jaipurInfo.expressDelivery
          ? `✓ 3-hour express delivery available in ${jaipurInfo.area}`
          : `✓ Same day delivery available in ${jaipurInfo.area}`,
      });
    }

    // ── RAJASTHAN — standard 2-3 days ──
    if (pincode.startsWith(RAJASTHAN_PREFIX)) {
      return NextResponse.json({
        success:         true,
        deliverable:     true,
        area:            "Rajasthan",
        expressDelivery: false,
        estimatedDays:   3,
        message:         "✓ Delivery available in 2–3 business days",
      });
    }

    // ── PAN INDIA — 5-7 days ──
    return NextResponse.json({
      success:         true,
      deliverable:     true,
      area:            "Pan India",
      expressDelivery: false,
      estimatedDays:   7,
      message:         "✓ Delivery available in 5–7 business days",
    });

  } catch (err) {
    console.error("PINCODE CHECK ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to check delivery. Please try again." },
      { status: 500 }
    );
  }
}