import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json(); // subtotal in paise

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: "Coupon code and subtotal required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // Date checks
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json({ error: "Coupon is not active yet" }, { status: 400 });
    }
    if (coupon.validTo && now > coupon.validTo) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Min amount check (paise)
    if (coupon.minAmount && Number(subtotal) < coupon.minAmount * 100) {
      return NextResponse.json(
        { error: `Minimum order Rs. ${coupon.minAmount} required` },
        { status: 400 }
      );
    }

    // Usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Calculate discount in paise
    let discount = 0;
    if (coupon.type === "PERCENT") {
      discount = Math.round((Number(subtotal) * coupon.value) / 100);
    } else {
      discount = coupon.value * 100; // FLAT discount stored in rupees
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, Number(subtotal));

    return NextResponse.json({
      success:   true,
      couponId:  coupon.id,
      code:      coupon.code,
      type:      coupon.type,
      value:     coupon.value,
      discount,  // paise
      message:   coupon.type === "PERCENT"
        ? `${coupon.value}% off applied!`
        : `Rs. ${coupon.value} off applied!`,
    });

  } catch (err) {
    console.error("COUPON VALIDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}