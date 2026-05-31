import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    // ── RATE LIMIT — prevent brute force coupon guessing ──
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`coupon:${ip}`, {
      maxRequests: 20,
      windowMs:    60_000, // 20 attempts per minute
    });

    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment." },
        {
          status:  429,
          headers: {
            "Retry-After": String(
              Math.ceil((limited.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // ── PARSE BODY ──
    const body = await req.json();

    const code     = body.code     ? sanitizeString(body.code).toUpperCase().trim() : null;
    const subtotal = body.subtotal ? Number(body.subtotal) : null; // in paise

    // ── VALIDATE INPUT ──
    if (!code || code.length === 0) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (code.length > 30) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    if (!subtotal || isNaN(subtotal) || subtotal <= 0) {
      return NextResponse.json(
        { error: "Valid cart subtotal is required" },
        { status: 400 }
      );
    }

    // ── FETCH COUPON ──
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      select: {
        id:         true,
        code:       true,
        type:       true,   // "PERCENT" | "FLAT"
        value:      true,   // percent value OR flat rupee value
        minAmount:  true,   // minimum cart amount in rupees
        isActive:   true,
        validFrom:  true,
        validTo:    true,
        usageLimit: true,
        usedCount:  true,
      },
    });

    // ── COUPON NOT FOUND ──
    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // ── COUPON INACTIVE ──
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // ── DATE VALIDATION ──
    const now = new Date();

    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json(
        {
          error: `This coupon is not active yet. Available from ${coupon.validFrom.toLocaleDateString("en-IN")}`,
        },
        { status: 400 }
      );
    }

    if (coupon.validTo && now > coupon.validTo) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      );
    }

    // ── USAGE LIMIT ──
    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // ── MINIMUM ORDER AMOUNT ──
    // minAmount stored in rupees → convert to paise for comparison
    const minAmountPaise = (coupon.minAmount || 0) * 100;

    if (subtotal < minAmountPaise) {
      const minAmountRupees = coupon.minAmount || 0;
      const shortBy         = (minAmountPaise - subtotal) / 100;

      return NextResponse.json(
        {
          error: `Minimum order amount of Rs. ${minAmountRupees.toLocaleString("en-IN")} required. Add Rs. ${shortBy.toFixed(0)} more to use this coupon.`,
        },
        { status: 400 }
      );
    }

    // ── CALCULATE DISCOUNT ──
    let discount = 0; // in paise

    if (coupon.type === "PERCENT") {
      // Percentage discount
      discount = Math.round((subtotal * coupon.value) / 100);

      // Cap percentage discount at subtotal
      discount = Math.min(discount, subtotal);

    } else if (coupon.type === "FLAT") {
      // Flat discount — value stored in rupees → convert to paise
      discount = coupon.value * 100;

      // Flat discount cannot exceed subtotal
      discount = Math.min(discount, subtotal);

    } else {
      return NextResponse.json(
        { error: "Invalid coupon type" },
        { status: 400 }
      );
    }

    // ── CALCULATE FINAL AMOUNTS ──
    const finalAmount = Math.max(0, subtotal - discount);

    // ── BUILD SUCCESS MESSAGE ──
    const savingsText =
      coupon.type === "PERCENT"
        ? `${coupon.value}% off`
        : `Rs. ${coupon.value} off`;

    const message = `${savingsText} applied! You save Rs. ${(discount / 100).toLocaleString("en-IN")}`;

    // ── RETURN SUCCESS ──
    return NextResponse.json({
      success:     true,
      couponId:    coupon.id,
      code:        coupon.code,
      type:        coupon.type,
      value:       coupon.value,
      discount,              // paise — use this in order creation
      finalAmount,           // paise — new total after discount
      message,
      // Human-readable amounts for frontend display
      display: {
        discount:    `Rs. ${(discount / 100).toLocaleString("en-IN")}`,
        finalAmount: `Rs. ${(finalAmount / 100).toLocaleString("en-IN")}`,
        savings:     savingsText,
      },
    });

  } catch (err: any) {
    console.error("COUPON VALIDATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to validate coupon. Please try again." },
      { status: 500 }
    );
  }
}