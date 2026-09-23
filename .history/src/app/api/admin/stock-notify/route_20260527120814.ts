import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { productId } = await req.json();
    const product = await prisma.product.findUnique({
      where:  { id: Number(productId) },
      select: { id: true, name: true, slug: true, stock: true, images: true },
    });

    if (!product || product.stock === 0) return NextResponse.json({ sent: 0 });

    const notifications = await prisma.stockNotification.findMany({
      where: { productId: Number(productId), notified: false },
    });

    if (notifications.length === 0) return NextResponse.json({ sent: 0 });

    const productUrl = `https://hashtaggifting.com/product/${product.slug}`;
    const productImg = product.images?.[0] || "";
    let sent = 0;

    for (const notif of notifications) {
      try {
        await sendEmail({
          to:      notif.email,
          subject: `🎉 Back in stock: ${product.name} | Hashtag Gifting`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
              <h2 style="color:#c0555a;margin-bottom:4px">It's back in stock! 🎁</h2>
              <p style="color:#555;margin-bottom:20px">Great news! A product you wanted is available again.</p>
              ${productImg ? `<img src="${productImg}" alt="${product.name}" style="width:100%;border-radius:12px;margin-bottom:20px;max-height:200px;object-fit:cover">` : ""}
              <div style="background:#f3efe8;border-radius:12px;padding:16px;margin-bottom:20px">
                <p style="color:#1a1a1a;font-weight:bold;font-size:18px;margin:0">${product.name}</p>
                <p style="color:#888;font-size:13px;margin:6px 0 0">Limited stock — order before it runs out again!</p>
              </div>
              <a href="${productUrl}" style="display:inline-block;background:#c0555a;color:white;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:bold;font-size:15px;margin-bottom:20px">
                Order now →
              </a>
              <p style="color:#aaa;font-size:12px">You signed up to be notified when this came back in stock.</p>
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0">
              <p style="color:#aaa;font-size:11px">Hashtag Gifting · Jaipur · hashtaggifting.com</p>
            </div>
          `,
        });
        await prisma.stockNotification.update({
          where: { id: notif.id },
          data:  { notified: true, notifiedAt: new Date() },
        });
        sent++;
      } catch (e) { console.error("Email failed:", notif.email, e); }
    }

    return NextResponse.json({ sent, product: product.name });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}