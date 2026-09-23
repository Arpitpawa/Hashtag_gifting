import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { notifyBackInStock } from "@/lib/stockNotify";

// Manual trigger — kept mainly as a retry/backfill tool. Restocking a
// product from ANY admin screen (Edit product page, Inventory quick-edit)
// now auto-fires this same logic from src/app/api/admin/products/[id]/route.ts,
// so this endpoint isn't required for the normal flow anymore, but it's
// useful if an earlier auto-send partially failed (e.g. email provider
// hiccup) and you want to re-run it for a specific product.
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { productId } = await req.json();
    const result = await notifyBackInStock(Number(productId));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}