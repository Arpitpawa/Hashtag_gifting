import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Razorpay from "razorpay";
import { sendEmail } from "@/lib/email";
import { orderConfirmedTemplate } from "@/lib/emailTemplates";
import { deductStockSafely, checkStockAvailability } from "@/lib/stockManager";

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body    = await req.json();

    const {
      items,           // [{ productId, quantity, price, customization }]
      totalAmount,     // paise
      paymentMethod,   // "online" | "cod"
      addressSnapshot, // { name, phone, street, city, state, pincode }
      addressId,
      couponCode,
      couponId,
      couponDiscount,
      cartId,
    } = body;

    // ── VALIDATE ──
    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!addressSnapshot?.name || !addressSnapshot?.phone || !addressSnapshot?.street) {
      return NextResponse.json({ error: "Complete delivery address is required" }, { status: 400 });
    }

    // ── GET USER ──
    const user = session?.user?.email
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    // ── PRE-CHECK STOCK (without lock — fast check for UX) ──
    const stockCheck = await checkStockAvailability(
      items.map((i: any) => ({
        productId: Number(i.productId),
        quantity:  Number(i.quantity),
      }))
    );

    if (!stockCheck.available) {
      const issue = stockCheck.issues[0];
      return NextResponse.json(
        {
          error: issue.available === 0
            ? `"${issue.name}" is out of stock`
            : `Only ${issue.available} unit(s) of "${issue.name}" available`,
          stockIssues: stockCheck.issues,
        },
        { status: 400 }
      );
    }

    // ── VALIDATE CUSTOMIZATIONS ──
    for (const item of items) {
      if (item.customization) {
        const product = await prisma.product.findUnique({
          where:  { id: Number(item.productId) },
          select: { customizable: true, customizationFields: true, name: true },
        });

        if (!product?.customizable && item.customization) {
          return NextResponse.json(
            { error: `"${product?.name}" does not support customization` },
            { status: 400 }
          );
        }

        // Validate required customization fields
        const fields = product?.customizationFields as any[] || [];
        for (const field of fields) {
          if (field.required && !item.customization[field.type]) {
            return NextResponse.json(
              { error: `"${field.label}" is required for "${product?.name}"` },
              { status: 400 }
            );
          }
        }
      }
    }

    // ── CREATE ORDER + DEDUCT STOCK ATOMICALLY ──
    // Use a transaction so order creation and stock deduction are atomic
    let order: any;

    try {
      order = await prisma.$transaction(async (tx) => {

        // STEP 1: Create the order
        const newOrder = await tx.order.create({
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
                price:         Number(item.price),
                customization: item.customization
                  ? {
                      name:     item.customization.name     || null,
                      message:  item.customization.message  || null,
                      photoUrl: item.customization.photoUrl || null,
                      extra:    item.customization.extra    || null,
                    }
                  : null,
              })),
            },
          },
          include: {
            items: { include: { product: true } },
          },
        });

        // STEP 2: Lock rows + deduct stock atomically
        for (const item of newOrder.items) {
          // Row-level lock with SELECT FOR UPDATE
          const locked = await tx.$queryRaw<Array<{ stock: number }>>`
            SELECT stock FROM "Product"
            WHERE id = ${item.productId}
            FOR UPDATE
          `;

          if (!locked[0] || locked[0].stock < item.quantity) {
            // This will rollback the entire transaction
            throw new Error(
              `"${item.product.name}" ran out of stock. Please try again.`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data:  { stock: { decrement: item.quantity } },
          });
        }

        // STEP 3: Increment coupon usage
        if (couponId) {
          await tx.coupon.update({
            where: { id: Number(couponId) },
            data:  { usedCount: { increment: 1 } },
          });
        }

        return newOrder;
      }, {
        isolationLevel: "Serializable",
        timeout:        15000,
      });

    } catch (txErr: any) {
      // Transaction failed — stock conflict or other error
      console.error("ORDER TRANSACTION ERROR:", txErr);
      return NextResponse.json(
        { error: txErr?.message || "Order could not be placed. Please try again." },
        { status: 409 } // 409 Conflict — perfect for stock issues
      );
    }

    // ── CLEAR CART ──
    if (cartId) {
      try {
        await prisma.cartItem.deleteMany({
          where: { cartId: Number(cartId) },
        });
      } catch {
        // Don't fail order if cart clear fails
      }
    }

    // ── ONLINE PAYMENT — RAZORPAY ORDER ──
    if (paymentMethod === "online") {
      try {
        const rpOrder = await razorpay.orders.create({
          amount:          Number(totalAmount),
          currency:        "INR",
          receipt:         `receipt_${order.id}`,
          payment_capture: true,
          notes: {
            orderId:     String(order.id),
            customerName: addressSnapshot.name,
          },
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
            prefill: {
              name:  addressSnapshot.name,
              email: user?.email  || "",
              contact: addressSnapshot.phone,
            },
          },
        });

      } catch (rpErr: any) {
        // Razorpay failed — cancel the order we just created
        await prisma.order.update({
          where: { id: order.id },
          data:  { paymentStatus: "FAILED", deliveryStatus: "CANCELLED" },
        });

        // Restore stock
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data:  { stock: { increment: item.quantity } },
          });
        }

        return NextResponse.json(
          { error: "Payment gateway error. Please try again." },
          { status: 500 }
        );
      }
    }

    // ── COD — SEND EMAIL ──
    if (user?.email) {
      await sendEmail({
        to:      user.email,
        subject: `Order Confirmed #${order.id} — Hashtag Gifting`,
        html:    orderConfirmedTemplate(
          addressSnapshot.name,
          order.id,
          order.items.map((i: any) => ({
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
      { error: err?.message || "Failed to place order" },
      { status: 500 }
    );
  }
}