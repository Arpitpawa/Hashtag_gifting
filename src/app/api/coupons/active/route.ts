import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

// ── Public: list coupons that are currently valid for someone to use ────────
// Used by the AvailableCoupons widget on cart/checkout/account pages.
// Never exposes internal fields (usageLimit, usedCount, product/category ids —
// just enough for a customer to decide whether to apply one).
export async function GET(req: NextRequest) {
  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`coupons-active:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    // Optional — if the caller knows the current cart subtotal (paise), we can
    // flag which coupons are actually usable right now vs need a bigger cart.
    const subtotalParam = searchParams.get("subtotal");
    const subtotal       = subtotalParam ? Number(subtotalParam) : null;

    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        AND: [
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      },
      select: {
        code:       true,
        type:       true,
        value:      true,
        minAmount:  true,
        applyTo:    true,
        usageLimit: true,
        usedCount:  true,
        createdAt:  true,
      },
      orderBy: { createdAt: "desc" },
    });

    const visible = coupons
      // Usage-limit-reached coupons are pointless to show
      .filter((c: any) => !c.usageLimit || c.usedCount < c.usageLimit)
      .map((c: any) => {
        const minAmountPaise = c.minAmount * 100;
        const eligible = subtotal === null ? null : subtotal >= minAmountPaise;

        const discountLabel = c.type === "PERCENT" ? `${c.value}% off` : `Rs. ${c.value} off`;
        const scopeNote =
          c.applyTo === "SPECIFIC_PRODUCTS"   ? " · Selected products only" :
          c.applyTo === "SPECIFIC_CATEGORIES" ? " · Selected categories only" : "";
        const description = (c.minAmount > 0
          ? `On orders above Rs. ${c.minAmount.toLocaleString("en-IN")}`
          : "No minimum order") + scopeNote;

        return {
          code:         c.code,
          type:         c.type,
          value:        c.value,
          minAmount:    c.minAmount,
          applyTo:      c.applyTo,
          discountLabel,
          description,
          eligible, // true/false if subtotal was given, null if unknown
        };
      });

    return NextResponse.json({ coupons: visible });
  } catch (err) {
    console.error("ACTIVE COUPONS ERROR:", err);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}