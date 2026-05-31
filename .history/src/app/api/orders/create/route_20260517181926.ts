import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Razorpay from "razorpay";
import { sendEmail } from "@/lib/email";
import { orderConfirmedTemplate } from "@/lib/emailTemplates";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeObject } from "@/lib/sanitize";
import { isValidPhone, isValidPincode } from "@/lib/helpers";

// ── RAZORPAY INSTANCE ──
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // ── RATE LIMIT ──
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`order:${ip}`, {
      maxRequests: 10,
      windowMs:    60_000,
    });

    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before placing another order." },
        { status: 429 }
      );
    }

    // ── GET SESSION ──
    const session = await getServerSession(authOptions);

    // ── PARSE BODY ──
    const rawBody = await req.json();
    const body    = sanitizeObject(rawBody);

    const {
      items,           // [{ productId, quantity, price (paise), customization }]
      totalAmount,     // paise
      paymentMethod,   // "online" | "cod"
      addressSnapshot, // { name, phone, street, city, state, pincode }
      addressId,       // saved address id (optional)
      couponCode,
      couponId,
      couponDiscount,
      cartId,
    } = body;

    // ── VALIDATE ITEMS ──
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: "Too many items in cart" },
        { status: 400 }
      );
    }

    // ── VALIDATE ADDRESS ──
    if (
      !addressSnapshot ||
      !addressSnapshot.name?.trim() ||
      !addressSnapshot.phone?.trim() ||
      !addressSnapshot.street?.trim() ||
      !addressSnapshot.city?.trim() ||
      !addressSnapshot.state?.trim() ||
      !addressSnapshot.pincode?.trim()
    ) {
      return NextResponse.json(
        { error: "Complete delivery address is required" },
        { status: 400 }
      );
    }

    if (!isValidPhone(addressSnapshot.phone)) {
      return NextResponse.json(
        { error: "Invalid delivery phone number" },
        { status: 400 }
      );
    }

    if (!isValidPincode(addressSnapshot.pincode)) {
      return NextResponse.json(
        { error: "Invalid pincode — must be 6 digits" },
        { status: 400 }
      );
    }

    // ── VALIDATE PAYMENT METHOD ──
    if (!["online", "cod"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // ── VALIDATE TOTAL AMOUNT ──
    const total = Number(totalAmount);
    if (isNaN(total) || total <= 0) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }

    // ── GET USER ──
    const user = session?.user?.email
      ? await prisma.user.findUnique({
          where:  { email: session.user.email },
          select: { id: true, email: true, name: true },
        })
      : null;

    // ── VALIDATE + FETCH ALL PRODUCTS FIRST ──
    // Batch fetch all products in ONE query — avoid N+1
    const productIds = items.map((i: any) => Number(i.productId));
    const products   = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: {
        id:                  true,
        name:                true,
        price:               true,
        stock:               true,
        customizable:        true,
        customizationFields: true,
      },
    });

    // Check all products exist
    if (products.length !== productIds.length) {
      const foundIds   = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Some products are no longer available (IDs: ${missingIds.join(", ")})` },
        { status: 400 }
      );
    }

    // Build product map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // ── PRE-VALIDATE STOCK (without lock — fast UX check) ──
    for (const item of items) {
      const product  = productMap.get(Number(item.productId));
      const quantity = Number(item.quantity);

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (quantity <= 0 || quantity > 100) {
        return NextResponse.json(
          { error: `Invalid quantity for "${product.name}"` },
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            error: product.stock === 0
              ? `"${product.name}" is out of stock`
              : `Only ${product.stock} unit(s) of "${product.name}" available`,
            stockIssue: {
              productId: product.id,
              name:      product.name,
              requested: quantity,
              available: product.stock,
            },
          },
          { status: 400 }
        );
      }

      // ── VALIDATE CUSTOMIZATION FIELDS ──
      if (item.customization) {
        if (!product.customizable) {
          return NextResponse.json(
            { error: `"${product.name}" does not support customization` },
            { status: 400 }
          );
        }

        const fields = (product.customizationFields as any[]) || [];
        for (const field of fields) {
          const value = item.customization[field.type];

          if (field.required && (!value || String(value).trim() === "")) {
            return NextResponse.json(
              { error: `"${field.label}" is required for "${product.name}"` },
              { status: 400 }
            );
          }

          if (value && field.maxLength && String(value).length > field.maxLength) {
            return NextResponse.json(
              {
                error: `"${field.label}" for "${product.name}" exceeds ${field.maxLength} characters`,
              },
              { status: 400 }
            );
          }

          // Validate photo URL if provided
          if (field.type === "image" && value) {
            const isCloudinaryUrl = String(value).includes("cloudinary.com") ||
                                    String(value).includes("res.cloudinary.com");
            if (!isCloudinaryUrl) {
              return NextResponse.json(
                { error: "Invalid photo URL. Please upload the photo again." },
                { status: 400 }
              );
            }
          }
        }
      }

      // ── VALIDATE PRICE INTEGRITY ──
      // Ensure price sent from frontend matches DB price (prevent price manipulation)
      const sentPrice = Number(item.price);
      if (Math.abs(sentPrice - product.price) > 100) {
        // Allow ±1 rupee tolerance for rounding
        return NextResponse.json(
          { error: `Price mismatch for "${product.name}". Please refresh and try again.` },
          { status: 400 }
        );
      }
    }

    // ── VALIDATE COUPON (if provided) ──
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where:  { id: Number(couponId) },
        select: {
          id:         true,
          isActive:   true,
          validFrom:  true,
          validTo:    true,
          usageLimit: true,
          usedCount:  true,
        },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: "Coupon is no longer valid" }, { status: 400 });
      }

      const now = new Date();
      if (coupon.validFrom && now < coupon.validFrom) {
        return NextResponse.json({ error: "Coupon is not active yet" }, { status: 400 });
      }
      if (coupon.validTo && now > coupon.validTo) {
        return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
      }
    }

    // ════════════════════════════════════════════════════════
    // ── ATOMIC TRANSACTION — CREATE ORDER + DEDUCT STOCK ──
    // Serializable isolation prevents race conditions
    // SELECT FOR UPDATE locks rows during stock check
    // ════════════════════════════════════════════════════════
    let order: any;

    try {
      order = await prisma.$transaction(
        async (tx) => {
          // ── STEP 1: CREATE ORDER RECORD ──
          const newOrder = await tx.order.create({
            data: {
              userId:         user?.id ?? null,
              totalAmount:    total,
              paymentMethod:  paymentMethod,
              paymentStatus:  "PENDING",
              deliveryStatus: "PROCESSING",
              addressId:      addressId ? Number(addressId) : null,
              addressSnapshot: {
                name:    addressSnapshot.name,
                phone:   addressSnapshot.phone,
                street:  addressSnapshot.street,
                city:    addressSnapshot.city,
                state:   addressSnapshot.state,
                pincode: addressSnapshot.pincode,
              },
              couponCode:     couponCode     || null,
              couponId:       couponId       ? Number(couponId) : null,
              couponDiscount: couponDiscount ? Number(couponDiscount) : null,

              items: {
                create: items.map((item: any) => ({
                  productId: Number(item.productId),
                  quantity:  Number(item.quantity),
                  price:     Number(item.price), // price at time of order in paise
                  customization: item.customization
                    ? {
                        name:     item.customization.name     || null,
                        message:  item.customization.message  || null,
                        photoUrl: item.customization.photoUrl || null,
                      }
                    : null,
                })),
              },
            },
            include: {
              items: {
                include: {
                  product: {
                    select: { id: true, name: true, images: true },
                  },
                },
              },
            },
          });

          // ── STEP 2: LOCK ROWS + DEDUCT STOCK ATOMICALLY ──
          // SELECT FOR UPDATE prevents another transaction from
          // reading stale stock while we're deducting
          for (const item of newOrder.items) {
            const locked = await tx.$queryRaw<Array<{ stock: number; name: string }>>`
              SELECT stock, name
              FROM "Product"
              WHERE id = ${item.productId}
              FOR UPDATE
            `;

            const lockedProduct = locked[0];

            if (!lockedProduct) {
              throw new Error(`Product ${item.productId} not found`);
            }

            if (lockedProduct.stock < item.quantity) {
              // This rolls back the ENTIRE transaction automatically
              throw new Error(
                lockedProduct.stock === 0
                  ? `"${lockedProduct.name}" just went out of stock. Please remove it from your cart.`
                  : `Only ${lockedProduct.stock} unit(s) of "${lockedProduct.name}" remaining. Please update quantity.`
              );
            }

            // Safe to deduct — row is locked
            await tx.product.update({
              where: { id: item.productId },
              data:  { stock: { decrement: item.quantity } },
            });
          }

          // ── STEP 3: INCREMENT COUPON USAGE ──
          if (couponId) {
            await tx.coupon.update({
              where: { id: Number(couponId) },
              data:  { usedCount: { increment: 1 } },
            });
          }

          return newOrder;
        },
        {
          isolationLevel: "Serializable", // Highest isolation — prevents phantom reads
          timeout:        15_000,         // 15 second timeout
        }
      );

    } catch (txErr: any) {
      console.error("ORDER TRANSACTION ERROR:", txErr);

      // 409 Conflict — stock issue
      return NextResponse.json(
        { error: txErr?.message || "Order could not be placed. Please try again." },
        { status: 409 }
      );
    }

    // ── CLEAR CART (non-critical — don't fail order if this fails) ──
    if (cartId) {
      try {
        await prisma.cartItem.deleteMany({
          where: { cartId: Number(cartId) },
        });
      } catch (cartErr) {
        console.warn("Cart clear failed (non-critical):", cartErr);
      }
    }

    // ══════════════════════════════════
    // ── ONLINE PAYMENT — RAZORPAY ──
    // ══════════════════════════════════
    if (paymentMethod === "online") {
      try {
        const rpOrder = await razorpay.orders.create({
          amount:   total,           // already in paise
          currency: "INR",
          receipt:  `receipt_${order.id}`,
          notes: {
            orderId:      String(order.id),
            customerName: addressSnapshot.name,
            customerPhone: addressSnapshot.phone,
          },
        } as any);

        // Save Razorpay order ID
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
              name:    addressSnapshot.name,
              email:   user?.email   || "",
              contact: addressSnapshot.phone,
            },
            theme: { color: "#c0555a" },
          },
        });

      } catch (rpErr: any) {
        console.error("RAZORPAY ERROR:", rpErr);

        // ── ROLLBACK: Cancel order + restore stock ──
        try {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus:  "FAILED",
                deliveryStatus: "CANCELLED",
              },
            });

            // Restore stock for all items
            for (const item of order.items) {
              await tx.product.update({
                where: { id: item.productId },
                data:  { stock: { increment: item.quantity } },
              });
            }

            // Rollback coupon usage
            if (couponId) {
              await tx.coupon.update({
                where: { id: Number(couponId) },
                data:  { usedCount: { decrement: 1 } },
              });
            }
          });
        } catch (rollbackErr) {
          console.error("ROLLBACK FAILED:", rollbackErr);
        }

        return NextResponse.json(
          { error: "Payment gateway error. Please try again." },
          { status: 500 }
        );
      }
    }

    // ══════════════════════════════════
    // ── COD FLOW ──
    // ══════════════════════════════════

    // ── SEND CONFIRMATION EMAIL (non-critical) ──
    const emailTo = user?.email;
    if (emailTo) {
      try {
        await sendEmail({
          to:      emailTo,
          subject: `Order Confirmed #${order.id} — Hashtag Gifting`,
          html:    orderConfirmedTemplate(
            addressSnapshot.name,
            order.id,
            order.items.map((i: any) => ({
              name:     i.product.name,
              quantity: i.quantity,
              price:    i.price,
            })),
            total,
            `${addressSnapshot.street}, ${addressSnapshot.city}, ${addressSnapshot.state} - ${addressSnapshot.pincode}`
          ),
        });
      } catch (emailErr) {
        // Don't fail the order if email fails
        console.warn("Order confirmation email failed (non-critical):", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order placed successfully",
    });

  } catch (err: any) {
    console.error("ORDER CREATE ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}