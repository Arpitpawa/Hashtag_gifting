import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// Lets an admin confirm they've manually messaged a customer via the free
// wa.me click-to-chat link (no WhatsApp API provider wired up yet), so that
// customer stops showing as "needs action" on the Abandoned Carts page.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const alertId = Number(id);
  if (!Number.isInteger(alertId)) {
    return NextResponse.json({ error: "Invalid alert id" }, { status: 400 });
  }

  try {
    const alert = await prisma.abandonedCartAlert.update({
      where: { id: alertId },
      data:  { status: "SENT", sentAt: new Date() },
    });
    return NextResponse.json({ success: true, alert });
  } catch (err) {
    console.error("ABANDONED CART MARK-SENT ERROR:", err);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
