import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { adminNewOrderTemplate } from "@/lib/emailTemplates";

// Fires the moment a real order lands — COD placed, or online payment
// confirmed — so whoever's role is ADMIN finds out by email even if nobody
// has the admin panel open (the in-app bell + sound in AdminNotifications.tsx
// only alerts while that tab is open; this is the fallback that doesn't
// depend on that). Called from the same 3 spots that send the customer's own
// confirmation email (orders/create, orders/verify, payment/webhook), right
// after it, and is just as non-critical — a failure here must never fail or
// roll back the order itself.
export async function notifyAdminNewOrder(params: {
  orderId:       number;
  customerName:  string;
  items:         Array<{ name: string; quantity: number }>;
  totalAmount:   number; // paise
  paymentMethod: string | null;
  giftNote?:     string | null;
}) {
  try {
    const admins = await prisma.user.findMany({
      where:  { role: "ADMIN" },
      select: { email: true },
    });
    const to = admins.map((a) => a.email).filter((e): e is string => !!e);
    if (to.length === 0) return;

    await sendEmail({
      to,
      subject: `🔔 New order #${params.orderId} — Rs. ${(params.totalAmount / 100).toLocaleString("en-IN")}`,
      html: adminNewOrderTemplate(
        params.orderId,
        params.customerName,
        params.items,
        params.totalAmount,
        params.paymentMethod,
        params.giftNote,
      ),
    });
  } catch (err) {
    // Never fail the order over an admin-alert hiccup.
    console.warn("Admin new-order notification failed (non-critical):", err);
  }
}
