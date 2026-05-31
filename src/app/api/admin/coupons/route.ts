import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });
    return NextResponse.json(coupons);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`admin-coupon:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!limited.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const {
      code, type, value,
      minAmount  = 0,
      validFrom,
      validTo,
      isActive   = true,
      usageLimit,
    } = body;

    if (!code || !type || !value) {
      return NextResponse.json(
        { error: "Code, type and value are required" },
        { status: 400 }
      );
    }

    if (!["PERCENT", "FLAT"].includes(type)) {
      return NextResponse.json({ error: "Type must be PERCENT or FLAT" }, { status: 400 });
    }

    if (type === "PERCENT" && (Number(value) < 1 || Number(value) > 100)) {
      return NextResponse.json(
        { error: "Percent value must be between 1 and 100" },
        { status: 400 }
      );
    }

    const cleanCode = sanitizeString(code).toUpperCase().replace(/\s/g, "");

    // Check duplicate
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code:       cleanCode,
        type,
        value:      Number(value),
        minAmount:  Number(minAmount) || 0,
        isActive:   Boolean(isActive),
        validFrom:  validFrom ? new Date(validFrom) : null,
        validTo:    validTo   ? new Date(validTo)   : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}