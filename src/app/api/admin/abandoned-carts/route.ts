import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { buildWhatsAppClickToChatLink } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "READY" | "SENT" | null (= all)

    const alerts = await prisma.abandonedCartAlert.findMany({
      where:   status ? { status: status as "READY" | "SENT" } : {},
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({
      success: true,
      alerts: alerts.map((a) => ({
        id:                a.id,
        customerName:      a.user.name,
        customerEmail:     a.user.email,
        phone:             a.phone,
        itemCount:         a.itemCount,
        subtotal:          a.subtotal,
        firstProductName:  a.firstProductName,
        firstProductImage: a.firstProductImage,
        messageText:       a.messageText,
        status:            a.status,
        sentAt:            a.sentAt,
        createdAt:         a.createdAt,
        chatLink:          buildWhatsAppClickToChatLink(a.phone, a.messageText),
      })),
    });
  } catch (err) {
    console.error("ABANDONED CART ALERTS GET ERROR:", err);
    return NextResponse.json({ error: "Failed to load abandoned cart alerts" }, { status: 500 });
  }
}
