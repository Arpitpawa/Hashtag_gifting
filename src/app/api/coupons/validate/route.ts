import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`coupon:${ip}`, { maxRequests: 20, windowMs: 60_000 });

    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();

    const code       = body.code     ? sanitizeString(body.code).toUpperCase().trim() : null;
    const subtotal   = body.subtotal ? Number(body.subtotal) : null; // in paise
    // Cart items for product/category restriction checks
    // Expected: [{ productId: number, categoryId: number | null, price: number }]
    const cartItems: { productId: number; categoryId?: number | null }[] =
      body.cartItems ?? [];

    if (!code || code.length === 0) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }
    if (code.length > 30) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }
    if (!subtotal || isNaN(subtotal) || subtotal <= 0) {
      return NextResponse.json({ error: "Valid cart subtotal is required" }, { status: 400 });
    }

    // ── Fetch coupon with restrictions ──
    const coupon = await prisma.coupon.findUnique({
      where:  { code },
      include: {
        products:   { select: { productId: true } },
        categories: { select: { categoryId: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }
    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    // ── Date checks ──
    const now = new Date();
    const validFrom = coupon.validFrom;
    const validTo   = coupon.validTo ?? coupon.expiresAt; // support both fields

    if (validFrom && now < validFrom) {
      return NextResponse.json({
        error: `This coupon is not active yet. Available from ${validFrom.toLocaleDateString("en-IN")}`,
      }, { status: 400 });
    }
    if (validTo && now > validTo) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // ── Usage limit ──
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // ── Product / Category restriction check ──────────────────────────────────
    let eligibleSubtotal = subtotal; // amount eligible for discount
    let restrictionMsg   = "";

    if (coupon.applyTo === "SPECIFIC_PRODUCTS" && coupon.products.length > 0) {
      const allowedProductIds = new Set(coupon.products.map((p: any) => p.productId));

      if (cartItems.length > 0) {
        // Check if ANY cart item matches
        const hasEligible = cartItems.some((item) => allowedProductIds.has(item.productId));
        if (!hasEligible) {
          // Fetch product names for a helpful error message
          const productNames = await prisma.product.findMany({
            where:  { id: { in: [...allowedProductIds] } },
            select: { name: true },
          });
          const names = productNames.map((p: any) => p.name).join(", ");
          return NextResponse.json({
            error: `This coupon is only valid for: ${names}`,
          }, { status: 400 });
        }
        restrictionMsg = " (applied to eligible items only)";
      }
    }

    if (coupon.applyTo === "SPECIFIC_CATEGORIES" && coupon.categories.length > 0) {
      const allowedCategoryIds = new Set(coupon.categories.map((c: any) => c.categoryId));

      if (cartItems.length > 0) {
        const hasEligible = cartItems.some(
          (item) => item.categoryId && allowedCategoryIds.has(item.categoryId)
        );
        if (!hasEligible) {
          const catNames = await prisma.category.findMany({
            where:  { id: { in: [...allowedCategoryIds] } },
            select: { name: true },
          });
          const names = catNames.map((c: any) => c.name).join(", ");
          return NextResponse.json({
            error: `This coupon is only valid for products in: ${names}`,
          }, { status: 400 });
        }
        restrictionMsg = " (applied to eligible items only)";
      }
    }

    // ── Minimum order amount ──
    const minAmountPaise = (coupon.minAmount || 0) * 100;
    if (subtotal < minAmountPaise) {
      const shortBy = (minAmountPaise - subtotal) / 100;
      return NextResponse.json({
        error: `Minimum order of Rs. ${coupon.minAmount.toLocaleString("en-IN")} required. Add Rs. ${shortBy.toFixed(0)} more.`,
      }, { status: 400 });
    }

    // ── Calculate discount ──
    let discount = 0;

    if (coupon.type === "PERCENT") {
      discount = Math.round((eligibleSubtotal * coupon.value) / 100);
      discount = Math.min(discount, eligibleSubtotal);
    } else if (coupon.type === "FLAT") {
      discount = coupon.value * 100;
      discount = Math.min(discount, eligibleSubtotal);
    } else {
      return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
    }

    const finalAmount = Math.max(0, subtotal - discount);
    const savingsText = coupon.type === "PERCENT" ? `${coupon.value}% off` : `Rs. ${coupon.value} off`;
    const message     = `${savingsText} applied! You save Rs. ${(discount / 100).toLocaleString("en-IN")}${restrictionMsg}`;

    return NextResponse.json({
      success:     true,
      valid:       true,
      couponId:    coupon.id,
      code:        coupon.code,
      type:        coupon.type,
      value:       coupon.value,
      applyTo:     coupon.applyTo,
      discount,
      finalAmount,
      message,
      display: {
        discount:    `Rs. ${(discount / 100).toLocaleString("en-IN")}`,
        finalAmount: `Rs. ${(finalAmount / 100).toLocaleString("en-IN")}`,
        savings:     savingsText,
      },
    });

  } catch (err) {
    console.error("COUPON VALIDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to validate coupon. Please try again." }, { status: 500 });
  }
}