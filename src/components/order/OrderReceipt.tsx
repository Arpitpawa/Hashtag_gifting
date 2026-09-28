"use client";

import { useEffect, useState } from "react";
import { ReceiptPrinter, type ReceiptLine } from "./ReceiptPrinter";
import { formatPrice } from "@/lib/helpers";

const SELLER_NAME = "Hashtag Gifting";
const SELLER_LINE = "Change the idea of Gifting";

// Whole-rupee display, same convention as every other amount on the site
// since the 25 Sep fractional-rupee fix — no paise shown anywhere customer-facing.
const rupees = (paise: number) => Math.round(paise / 100).toLocaleString("en-IN");

interface OrderItemLike {
  quantity: number;
  price: number;
  product?: { name?: string | null } | null;
  customization?: unknown;
  variantInfo?: unknown;
}

interface OrderLike {
  id: number;
  createdAt: string;
  totalAmount: number;
  paymentMethod?: string | null;
  couponCode?: string | null;
  couponDiscount?: number | null;
  trackingId?: string | null;
  items: OrderItemLike[];
}

// Surfaces a color/personalization detail as a small indented sub-line
// under the item, the way "+ Oat milk" reads on a real receipt. Both
// fields are admin-defined JSON blobs, so this only shows what's actually
// there instead of assuming a shape.
function itemDetail(item: OrderItemLike): string | null {
  const variant = item.variantInfo as { color?: string } | null | undefined;
  if (variant?.color) return `Color: ${variant.color}`;
  const custom = item.customization as
    | { text?: string; name?: string }
    | null
    | undefined;
  const text = custom?.text || custom?.name;
  if (text) return `Personalised: ${text}`;
  return null;
}

function buildReceiptLines(order: OrderLike): ReceiptLine[] {
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  // Same "whatever's left over" math the admin invoice PDF uses, so the two
  // always agree.
  const shipping =
    order.totalAmount - itemsSubtotal + (order.couponDiscount || 0);

  const lines: ReceiptLine[] = [
    { kind: "title", text: SELLER_NAME },
    { kind: "center", text: SELLER_LINE },
    { kind: "rule" },
    {
      kind: "row",
      left: `Order #${order.id}`,
      right: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
    },
    { kind: "rule" },
  ];

  order.items.forEach((item) => {
    const name = item.product?.name || "Product";
    lines.push({
      kind: "row",
      left: `${item.quantity} ${name}`,
      right: rupees(item.price * item.quantity),
    });
    const detail = itemDetail(item);
    if (detail) lines.push({ kind: "row", left: `  + ${detail}`, right: "" });
  });

  lines.push({ kind: "rule" });
  lines.push({ kind: "row", left: "Subtotal", right: rupees(itemsSubtotal) });

  if (order.couponDiscount) {
    lines.push({
      kind: "row",
      left: `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
      right: `-${rupees(order.couponDiscount)}`,
    });
  }

  if (shipping > 0) {
    lines.push({ kind: "row", left: "Shipping", right: rupees(shipping) });
  }

  lines.push({ kind: "total", left: "Total", right: formatPrice(order.totalAmount) });
  lines.push({ kind: "rule", char: "=" });
  lines.push({
    kind: "row",
    left: (order.paymentMethod || "Online").toUpperCase(),
    right: formatPrice(order.totalAmount),
  });
  lines.push({
    kind: "barcode",
    code: String(order.trackingId || order.id).padStart(10, "0"),
  });
  lines.push({ kind: "center", text: "Thank you for shopping with us" });

  return lines;
}

// Fetches the real order (same endpoint the order-history page uses) and
// renders it as an animated tear-off receipt. Renders nothing at all on any
// failure — a slow/failed fetch here should never break the success page
// around it.
export default function OrderReceipt({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderLike | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: OrderLike) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (failed || !order) return null;

  return (
    <div className="mt-8 flex flex-col items-center">
      <ReceiptPrinter
        lines={buildReceiptLines(order)}
        total={formatPrice(order.totalAmount)}
      />
    </div>
  );
}
