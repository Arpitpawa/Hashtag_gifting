import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`track:${ip}`, { maxRequests: 15, windowMs: 60_000 });
    if (!limited.success) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body  = await req.json();
    const { orderId, phone } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Phone verification is mandatory — this is the only thing standing
    // between "here's your order" and anyone who can guess a sequential ID
    // seeing every customer's name and delivery address.
    if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Phone number is required to track this order" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your order ID." },
        { status: 404 }
      );
    }

    // Verify phone against addressSnapshot — fails closed. If the order has
    // no phone on file for some reason, that's treated as "can't verify",
    // not "let it through".
    const addr        = order.addressSnapshot as any;
    const cleanInput  = phone.replace(/\D/g, "").slice(-10);
    const cleanStored = addr?.phone ? String(addr.phone).replace(/\D/g, "").slice(-10) : null;

    if (!cleanStored || cleanInput !== cleanStored) {
      return NextResponse.json(
        { error: "Phone number doesn't match this order." },
        { status: 400 }
      );
    }

    // Strip sensitive info before sending to client
    return NextResponse.json({
      id:             order.id,
      createdAt:      order.createdAt,
      updatedAt:      order.updatedAt,
      deliveryStatus: order.deliveryStatus,
      paymentStatus:  order.paymentStatus,
      paymentMethod:  order.paymentMethod,
      totalAmount:    order.totalAmount,
      couponDiscount: order.couponDiscount,
      trackingId:     order.trackingId,
      shippedAt:      order.shippedAt,
      deliveredAt:    order.deliveredAt,
      addressSnapshot: addr
        ? {
            name:    addr.name,
            street:  addr.street,
            city:    addr.city,
            state:   addr.state,
            pincode: addr.pincode,
            // Mask phone: show only last 3 digits
            phone: addr.phone
              ? `XXXXXXX${String(addr.phone).slice(-3)}`
              : null,
          }
        : null,
      items: order.items.map((item: any) => ({
        id:           item.id,
        quantity:     item.quantity,
        price:        item.price,
        customization: item.customization,
        product: {
          id:     item.product.id,
          name:   item.product.name,
          slug:   item.product.slug,
          image:  item.product.images?.[0] ?? null,
        },
      })),
    });
  } catch (err) {
    console.error("TRACK ORDER ERROR:", err);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}