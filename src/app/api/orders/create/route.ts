import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Razorpay from "razorpay";
import { sendEmail } from "@/lib/email";
import { orderConfirmedTemplate } from "@/lib/emailTemplates";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeObject, sanitizeCustomizationObject } from "@/lib/sanitize";
import { isValidPhone, isValidPincode } from "@/lib/helpers";
import { ownsCart } from "@/lib/cartAuth";

// Razorpay is instantiated inside the handler to avoid crash on missing keys

export async function POST(req: NextRequest) {
  // ── TOP-LEVEL SAFETY — always return JSON, never HTML ──
  let rawBody: any;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

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

    // Guest checkout removed per Arpit — every order needs a real account
    // now (fixes: guest orders had no email on file for confirmations, no
    // order history, and could never leave a review afterward). The
    // checkout PAGE already redirects logged-out visitors to /login before
    // they ever reach this form, but that's a client-side/page-level
    // redirect — this is the actual enforcement, since nothing stops a
    // direct POST to this endpoint bypassing the UI entirely.
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in to place an order." },
        { status: 401 }
      );
    }

    // ── PARSE BODY ──
    const body = sanitizeObject(rawBody);

    const {
      items:  sanitizedItems, // [{ productId, quantity, price (paise), customization }]
      totalAmount,     // paise
      paymentMethod,   // "online" | "cod"
      addressSnapshot, // { name, phone, street, city, state, pincode }
      addressId,       // saved address id (optional)
      couponCode,
      couponId,
      // couponDiscount is intentionally NOT read from the client — it's
      // recomputed server-side from the coupon's real type/value below.
      cartId,
    } = body;

    // sanitizeObject() strips any "data:" substring and truncates strings at
    // 10,000 chars — both fatal to base64 photo uploads / the generated
    // live-preview PNG stored in item.customization. Re-derive each item's
    // customization from the raw (pre-generic-sanitize) body using a
    // sanitizer that preserves image data URIs while still stripping
    // HTML/script from plain text values (name, message, chosen font, etc).
    const items = Array.isArray(sanitizedItems) && Array.isArray(rawBody?.items)
      ? sanitizedItems.map((item: any, i: number) => ({
          ...item,
          customization: rawBody.items[i]?.customization
            ? sanitizeCustomizationObject(rawBody.items[i].customization)
            : null,
        }))
      : sanitizedItems;

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
    // Session existing was already checked above, but confirm the account
    // it points to is still real (e.g. wasn't deleted after the cookie was
    // issued) — guest orders are no longer allowed at all, so there's no
    // valid "fall through to null" case here anymore.
    const user = await prisma.user.findUnique({
      where:  { id: Number(session.user.id) },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Your account could not be found. Please log in again." },
        { status: 401 }
      );
    }

    // ── VALIDATE + FETCH ALL PRODUCTS FIRST ──
    // Batch fetch all products in ONE query — avoid N+1
    // Deduplicate so same product ordered twice doesn't cause false 'not found' error
    const productIds = [...new Set(items.map((i: any) => Number(i.productId)))];
    const products   = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: {
        id:                  true,
        name:                true,
        price:               true,
        stock:               true,
        customizable:        true,
        customizationFields: true,
        categoryId:          true, // needed to check SPECIFIC_CATEGORIES coupon restrictions below
      },
    });

    // Check all products exist
    if (products.length !== productIds.length) {
      const foundIds   = products.map((p: any) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Some products are no longer available (IDs: ${missingIds.join(", ")})` },
        { status: 400 }
      );
    }

    // Build product map for quick lookup
    const productMap = new Map<number, (typeof products)[number]>(
      products.map((p: any) => [p.id, p])
    );

    // ── VALIDATE + FETCH VARIANTS (if any items reference one) ──
    // A selected variant's OWN stock/price are what actually govern that
    // item — previously nothing here ever looked at ProductVariant at all,
    // so a product's variants (different designs/colours, each with their
    // own stock) could be oversold as long as the unrelated parent
    // Product.stock number happened to still be positive, and a variant
    // with its own price would get silently charged at the base product's
    // price instead.
    const variantIds = [...new Set(
      items.map((i: any) => i.variantId ? Number(i.variantId) : null).filter(Boolean)
    )] as number[];

    const variants = variantIds.length > 0
      ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
      : [];

    const variantMap = new Map<number, (typeof variants)[number]>(
      variants.map((v: any) => [v.id, v])
    );

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

      // Resolve the variant this item refers to, if any, and confirm it
      // actually belongs to the product being ordered (not just any valid
      // variant id from somewhere else).
      let variant: (typeof variants)[number] | undefined;
      if (item.variantId) {
        variant = variantMap.get(Number(item.variantId));
        if (!variant || variant.productId !== product.id) {
          return NextResponse.json(
            { error: `Selected option is invalid for "${product.name}". Please refresh and try again.` },
            { status: 400 }
          );
        }
      }

      const availableStock = variant ? variant.stock : product.stock;
      const stockLabel      = variant ? `${product.name} (${variant.optionName})` : product.name;

      if (availableStock < quantity) {
        return NextResponse.json(
          {
            error: availableStock === 0
              ? `"${stockLabel}" is out of stock`
              : `Only ${availableStock} unit(s) of "${stockLabel}" available`,
            stockIssue: {
              productId: product.id,
              variantId: variant?.id ?? null,
              name:      stockLabel,
              requested: quantity,
              available: availableStock,
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
          // Match customization value by: exact label → label without spaces → type → any key containing label words
          const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
          const customEntries = Object.entries(item.customization || {});
          const matchedEntry = customEntries.find(([k]) =>
            k === field.label ||                          // exact match: "Enter name"
            k === field.type ||                           // type match: "text"
            normalize(k) === normalize(field.label) ||    // no-space match: "Entername" === "entername"
            (field.type === "image" && k === "photo_upload") // image always also stored as photo_upload
          );
          const value = matchedEntry ? matchedEntry[1] : undefined;

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

          // Photo format validation skipped — value presence check above is sufficient.
          // We accept Cloudinary URLs, base64 data URIs, and any other valid image format.
        }
      }

      // ── VALIDATE PRICE INTEGRITY ──
      // Ensure price sent from frontend matches DB price (prevent price
      // manipulation) — against the VARIANT's price when one is set and
      // selected, since that's what the customer actually saw and agreed
      // to pay, not the (possibly different) base product price.
      const expectedPrice = variant?.price ?? product.price;
      const sentPrice = Number(item.price);
      if (Math.abs(sentPrice - expectedPrice) > 100) {
        // Allow ±1 rupee tolerance for rounding
        return NextResponse.json(
          { error: `Price mismatch for "${stockLabel}". Please refresh and try again.` },
          { status: 400 }
        );
      }
    }

    // ── VALIDATE COUPON (if provided) + COMPUTE THE REAL DISCOUNT ──
    // Every item's price was confirmed to match the DB above, but nothing
    // above ever checked that `totalAmount` — the number actually charged
    // via Razorpay a few lines down — bears any relationship to those items.
    // A request with correct per-item prices and an arbitrary low
    // totalAmount would previously sail through with the full order created
    // at the real price while only the low totalAmount got charged.
    // couponDiscount was the same story — whatever the client sent was
    // trusted and stored as-is instead of being recalculated from the
    // coupon's actual type/value (mirrors /api/coupons/validate's logic).
    let verifiedDiscount = 0;

    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where:  { id: Number(couponId) },
        include: {
          products:   { select: { productId: true } },
          categories: { select: { categoryId: true } },
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
      if (coupon.expiresAt && now > coupon.expiresAt) {
        return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
      }
      // One use per customer: a live (not cancelled / not failed) order that
      // already used this coupon blocks a second one.
      const alreadyUsed = await prisma.order.count({
        where: {
          userId:         Number(session.user.id),
          couponId:       coupon.id,
          deliveryStatus: { not: "CANCELLED" },
          paymentStatus:  { not: "FAILED" },
        },
      });
      if (alreadyUsed > 0) {
        return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
      }

      if (coupon.applyTo === "SPECIFIC_PRODUCTS" && coupon.products.length > 0) {
        const allowed = new Set(coupon.products.map((p: any) => p.productId));
        if (!items.some((i: any) => allowed.has(Number(i.productId)))) {
          return NextResponse.json({ error: "Coupon is not valid for the items in your cart" }, { status: 400 });
        }
      }

      if (coupon.applyTo === "SPECIFIC_CATEGORIES" && coupon.categories.length > 0) {
        const allowed = new Set(coupon.categories.map((c: any) => c.categoryId));
        const eligible = items.some((i: any) => {
          const p = productMap.get(Number(i.productId)) as any;
          return p?.categoryId && allowed.has(p.categoryId);
        });
        if (!eligible) {
          return NextResponse.json({ error: "Coupon is not valid for the items in your cart" }, { status: 400 });
        }
      }

      // Subtotal from the already-verified item prices (not the client's total)
      const subtotalForCoupon = items.reduce(
        (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
        0
      );

      const minAmountPaise = (coupon.minAmount || 0) * 100;
      if (subtotalForCoupon < minAmountPaise) {
        return NextResponse.json(
          { error: `Minimum order of Rs. ${coupon.minAmount.toLocaleString("en-IN")} required for this coupon` },
          { status: 400 }
        );
      }

      if (coupon.type === "PERCENT") {
        verifiedDiscount = Math.min(Math.round((subtotalForCoupon * coupon.value) / 100), subtotalForCoupon);
      } else if (coupon.type === "FLAT") {
        verifiedDiscount = Math.min(coupon.value * 100, subtotalForCoupon);
      }
    }

    // ── RECOMPUTE THE ORDER TOTAL SERVER-SIDE — this, not the client's
    // totalAmount, is what actually gets stored and charged below. ──
    const computedSubtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const afterDiscount = Math.max(0, computedSubtotal - verifiedDiscount);
    // Same free-delivery threshold/flat fee as the checkout UI (CheckoutClient.tsx)
    const delivery      = afterDiscount >= 99900 ? 0 : 9900;
    const expectedTotal = afterDiscount + delivery;

    // ±1 rupee tolerance for rounding — same convention as the per-item check above
    if (Math.abs(total - expectedTotal) > 100) {
      console.warn(
        `ORDER TOTAL MISMATCH: client sent ${total}, expected ${expectedTotal} ` +
        `(subtotal ${computedSubtotal}, discount ${verifiedDiscount}, delivery ${delivery})`
      );
      return NextResponse.json(
        { error: "Order total doesn't match your cart. Please refresh and try again." },
        { status: 400 }
      );
    }

    // Use the server-computed figure as the source of truth from here on —
    // closes even the ±1 rupee tolerance window above.
    const finalTotal = expectedTotal;

    // ════════════════════════════════════════════════════════
    // ── ATOMIC TRANSACTION — CREATE ORDER + DEDUCT STOCK ──
    // Serializable isolation prevents race conditions
    // SELECT FOR UPDATE locks rows during stock check
    // ════════════════════════════════════════════════════════
    let order: any;

    // Only link a saved address that really belongs to this customer.
    let safeAddressId: number | null = null;
    if (addressId) {
      const ownAddress = await prisma.address.findFirst({
        where:  { id: Number(addressId), userId: Number(session.user.id) },
        select: { id: true },
      });
      safeAddressId = ownAddress?.id ?? null;
    }

    try {
      order = await prisma.$transaction(
        async (tx: any) => {
          // ── STEP 1: CREATE ORDER RECORD ──
          const newOrder = await tx.order.create({
            data: {
              userId:         user?.id ?? null,
              totalAmount:    finalTotal,
              paymentMethod:  paymentMethod,
              paymentStatus:  "PENDING",
              deliveryStatus: "PROCESSING",
              addressId:      safeAddressId,
              addressSnapshot: {
                name:    addressSnapshot.name,
                phone:   addressSnapshot.phone,
                street:  addressSnapshot.street,
                city:    addressSnapshot.city,
                state:   addressSnapshot.state,
                pincode: addressSnapshot.pincode,
              },
              couponCode:     couponCode ? String(couponCode) : null,
              couponId:       couponId   ? Number(couponId)   : null,
              couponDiscount: verifiedDiscount || null,

              items: {
                create: items.map((item: any) => {
                  const variant = item.variantId ? variantMap.get(Number(item.variantId)) : undefined;
                  return {
                    productId: Number(item.productId),
                    quantity:  Number(item.quantity),
                    price:     Number(item.price), // price at time of order in paise
                    // Persist the full customization payload — previously only
                    // name/message/photoUrl were kept, silently dropping the
                    // uploaded photo, generated preview image, chosen font,
                    // and per-field text values from the live preview modal.
                    customization: item.customization || null,
                    // Which specific variant (if any) this line item is for —
                    // this is also how the stock lock/decrement below and the
                    // rollback paths know whether to touch ProductVariant.stock
                    // instead of Product.stock for this item.
                    variantInfo: variant
                      ? { variantId: variant.id, groupName: variant.groupName, optionName: variant.optionName }
                      : null,
                  };
                }),
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
          // reading stale stock while we're deducting. Items tied to a
          // variant lock/check/decrement THAT variant's own stock instead
          // of the parent product's — the two are independent numbers once
          // a product has variants (variants keep whatever stock they had
          // as standalone products before being merged in), so locking the
          // wrong one would let a sold-out variant keep being ordered as
          // long as the unrelated parent Product.stock was still positive.
          for (const item of newOrder.items) {
            const variantId = (item.variantInfo as any)?.variantId as number | undefined;

            if (variantId) {
              const locked = await tx.$queryRaw<Array<{ stock: number; optionName: string }>>`
                SELECT stock, "optionName"
                FROM "ProductVariant"
                WHERE id = ${variantId}
                FOR UPDATE
              `;

              const lockedVariant = locked[0];

              if (!lockedVariant) {
                throw new Error(`Selected option for "${item.product.name}" no longer exists`);
              }

              if (lockedVariant.stock < item.quantity) {
                throw new Error(
                  lockedVariant.stock === 0
                    ? `"${item.product.name} (${lockedVariant.optionName})" just went out of stock. Please remove it from your cart.`
                    : `Only ${lockedVariant.stock} unit(s) of "${item.product.name} (${lockedVariant.optionName})" remaining. Please update quantity.`
                );
              }

              await tx.productVariant.update({
                where: { id: variantId },
                data:  { stock: { decrement: item.quantity } },
              });

              continue;
            }

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
        // Only clear a cart that actually belongs to this visitor.
        const cartToClear = await prisma.cart.findUnique({
          where:  { id: Number(cartId) },
          select: { id: true, userId: true },
        });
        if (cartToClear && (await ownsCart(cartToClear))) {
          await prisma.cartItem.deleteMany({ where: { cartId: cartToClear.id } });
        }
      } catch (cartErr) {
        console.warn("Cart clear failed (non-critical):", cartErr);
      }
    }

    // ══════════════════════════════════
    // ── ONLINE PAYMENT — RAZORPAY ──
    // ══════════════════════════════════
    if (paymentMethod === "online") {
      // Validate keys exist
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json(
          { error: "Payment gateway is not configured. Please use Cash on Delivery or contact support." },
          { status: 503 }
        );
      }

      // Instantiate here — safe now that we checked keys
      const razorpay = new Razorpay({
        key_id:     process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      try {
        const rpOrder = await razorpay.orders.create({
          amount:   finalTotal,      // already in paise — server-verified, not client-sent
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
          await prisma.$transaction(async (tx: any) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus:  "FAILED",
                deliveryStatus: "CANCELLED",
              },
            });

            // Restore stock for all items — a variant-tied item restores
            // ITS variant's stock, not the parent product's (see the note
            // on the decrement loop above for why these are separate pools).
            for (const item of order.items) {
              const variantId = (item.variantInfo as any)?.variantId as number | undefined;
              if (variantId) {
                await tx.productVariant.update({
                  where: { id: variantId },
                  data:  { stock: { increment: item.quantity } },
                });
              } else {
                await tx.product.update({
                  where: { id: item.productId },
                  data:  { stock: { increment: item.quantity } },
                });
              }
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
            finalTotal,
            `${addressSnapshot.street}, ${addressSnapshot.city}, ${addressSnapshot.state} - ${addressSnapshot.pincode}`,
            order.paymentMethod,
            order.createdAt
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
    // Generic message only — this is the catch-all for anything unexpected
    // (DB/Razorpay internals), not the deliberate user-facing messages
    // thrown inside the transaction above. Raw err.message here could leak
    // internal details (query/constraint names, SDK internals) to the client.
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}