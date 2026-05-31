import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Razorpay from "razorpay";
import { sendEmail } from "@/lib/email";
import { orderConfirmedTemplate } from "@/lib/emailTemplates";

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body    = await req.json();

    const {
      items,           // [{ productId, quantity, price (paise), customization }]
      totalAmount,     // in paise
      paymentMethod,   // "online" | "cod"
      addressId,       // saved address id
      addressSnapshot, // { name, phone, street, city, state, pincode }
      couponCode,
      couponId,
      couponDiscount,
      cartId,          // to clear after order
    } = body;

    // ── VALIDATE ──
    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!addressSnapshot?.name || !addressSnapshot?.phone) {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }

    // ── GET USER ──
    const user = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    // ── VALIDATE STOCK FOR ALL ITEMS ──
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: Number(item.productId) },
        select: { stock: true, name: true, status: true },
      });

      if (!product || product.status !== "ACTIVE") {
        return NextResponse.json(
          { error: `Product not available` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Only ${product.stock} units of "${product.name}" available` },
          { status: 400 }
        );
      }
    }

    // ── CREATE ORDER IN DB ──
    const order = await prisma.order.create({
      data: {
        userId:          user?.id ?? null,
        totalAmount:     Number(totalAmount),
        paymentMethod:   paymentMethod || "cod",
        paymentStatus:   "PENDING",
        deliveryStatus:  "PROCESSING",
        addressId:       addressId ? Number(addressId) : null,
        addressSnapshot: addressSnapshot,
        couponCode:      couponCode || null,
        couponId:        couponId   ? Number(couponId) : null,
        couponDiscount:  couponDiscount ? Number(couponDiscount) : null,

        items: {
          create: items.map((item: any) => ({
            productId:     Number(item.productId),
            quantity:      Number(item.quantity),
            price:         Number(item.price), // paise at time of order
            customization: item.customization || null,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // ── DEDUCT STOCK ──
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      });
    }

    // ── INCREMENT COUPON USAGE ──
    if (couponId) {
      await prisma.coupon.update({
        where: { id: Number(couponId) },
        data:  { usedCount: { increment: 1 } },
      });
    }

    // ── CLEAR CART ──
    if (cartId) {
      await prisma.cartItem.deleteMany({
        where: { cartId: Number(cartId) },
      });
    }

    // ── ONLINE PAYMENT — CREATE RAZORPAY ORDER ──
    if (paymentMethod === "online") {
      const rpOrder = await razorpay.orders.create({
        amount:          Number(totalAmount),
        currency:        "INR",
        receipt:         `receipt_${order.id}`,
        payment_capture: true,
      } as any);

      await prisma.order.update({
        where: { id: order.id },
        data:  { razorpayOrderId: rpOrder.id },
      });

      return NextResponse.json({
        success:  true,
        orderId:  order.id,
        razorpay: {
          orderId:  rpOrder.id,
          amount:   rpOrder.amount,
          currency: rpOrder.currency,
          key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          name:     addressSnapshot.name,
          email:    user?.email || "",
          phone:    addressSnapshot.phone,
        },
      });
    }

    // ── COD — SEND CONFIRMATION EMAIL ──
    if (user?.email) {
      await sendEmail({
        to:      user.email,
        subject: `Order Confirmed #${order.id} — Hashtag Gifting`,
        html:    orderConfirmedTemplate(
          addressSnapshot.name,
          order.id,
          order.items.map((i) => ({
            name:     i.product.name,
            quantity: i.quantity,
            price:    i.price,
          })),
          Number(totalAmount),
          `${addressSnapshot.street}, ${addressSnapshot.city}`
        ),
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });

  } catch (err: any) {
    console.error("ORDER CREATE ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}