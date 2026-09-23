import { NextResponse }  from "next/server";
import type { NextRequest } from "next/server";
import prisma            from "@/lib/prisma";
import { sendEmail }     from "@/lib/email";
import { rateLimit }     from "@/lib/rateLimit";

// ── POST — register for notification ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip      = req.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`stock-notify:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { email, productId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: "Email and product ID required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Check product exists and is actually out of stock
    const product = await prisma.product.findUnique({
      where:  { id: Number(productId) },
      select: { id: true, name: true, stock: true, images: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stock > 0) {
      return NextResponse.json({
        error:   "This product is currently in stock!",
        inStock: true,
      }, { status: 400 });
    }

    // Upsert — don't duplicate
    await prisma.stockNotification.upsert({
      where:  { email_productId: { email: email.toLowerCase(), productId: Number(productId) } },
      update: { notified: false, notifiedAt: null },
      create: { email: email.toLowerCase(), productId: Number(productId) },
    });

    // Confirmation email to customer
    await sendEmail({
      to:      email,
      subject: `We'll notify you! — ${product.name} | Hashtag Gifting`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#1a1a1a;margin-bottom:8px">You're on the list! 🎉</h2>
          <p style="color:#555;margin-bottom:16px">
            Hi there! We've added you to the waitlist for:
          </p>
          <div style="background:#f3efe8;border-radius:12px;padding:16px;margin-bottom:20px">
            <p style="color:#1a1a1a;font-weight:bold;font-size:16px;margin:0">${product.name}</p>
            <p style="color:#888;font-size:13px;margin:4px 0 0">hashtaggifting.com/product/${product.slug}</p>
          </div>
          <p style="color:#555;margin-bottom:20px">
            We'll send you an email the <strong>moment this product is back in stock</strong>.
            Don't worry — we'll only email you once about this.
          </p>
          <p style="color:#aaa;font-size:12px">
            Changed your mind? Simply ignore the next email and we won't bother you again.
          </p>
          <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0">
          <p style="color:#aaa;font-size:11px">Hashtag Gifting · Jaipur, Rajasthan · hashtaggifting.com</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "You'll be notified when this is back in stock!" });

  } catch (err: any) {
    // Handle unique constraint — already registered
    if (err.code === "P2002") {
      return NextResponse.json({ success: true, message: "You're already on the waitlist for this product!" });
    }
    console.error("STOCK NOTIFY ERROR:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}