import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// pdfkit needs real Node APIs (it ships its own base-14 fonts read from
// disk internally) — this route can't run on the Edge runtime.
export const runtime = "nodejs";

const fp = (p: number) => `Rs. ${(p / 100).toLocaleString("en-IN")}`;

// Same address used site-wide (Footer, About, Terms, contact page) — see
// those for the single source of truth if this ever needs to change.
const SELLER = {
  name:    "Hashtag Gifting",
  address: "Shop no. 83, Roop Vandana Complex, Arya Samaj Rd, Gurunanakpura, Raja Park, Jaipur, Rajasthan 302004",
  phone:   "+91 76659 09909",
  email:   "hashtaggiftsupport@gmail.com",
};

// QR encodes the order/shipment info as plain text (same idea as the QR you
// see on Nykaa/Amazon-style retail invoices — scanning it just shows these
// details as text, it's not linked to a specific courier's own system).
async function buildQrBuffer(order: any): Promise<Buffer> {
  const text = [
    `OrderCode: ${order.trackingId || order.id}`,
    `InvoiceNo: INV-${order.id}`,
    `InvoiceDate: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
    `OrderRef: ${order.id}`,
    `TotalAmt: ${(order.totalAmount / 100).toFixed(2)}`,
    `Discount: ${((order.couponDiscount || 0) / 100).toFixed(2)}`,
  ].join("|");

  return QRCode.toBuffer(text, { errorCorrectionLevel: "M", margin: 1, width: 220 });
}

async function buildInvoicePdf(order: any): Promise<Buffer> {
  const qrBuffer = await buildQrBuffer(order);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const snap: any = order.addressSnapshot || {};
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const leftX = doc.page.margins.left;

    // ── Header — brand + invoice title/meta + QR ──
    const qrSize = 66;
    const qrX = leftX + pageWidth - qrSize;
    const metaWidth = pageWidth - qrSize - 14;

    doc.fillColor("#c0555a").fontSize(22).font("Helvetica-Bold").text(SELLER.name, leftX, 50);
    doc.fillColor("#888888").fontSize(9).font("Helvetica")
      .text("Change the idea of gifting", leftX, 76);

    doc.fillColor("#1a1a1a").fontSize(16).font("Helvetica-Bold")
      .text("INVOICE", leftX, 45, { width: metaWidth, align: "right" });
    doc.fillColor("#555555").fontSize(10).font("Helvetica")
      .text(`Invoice #: INV-${order.id}`, leftX, 68, { width: metaWidth, align: "right" })
      .text(
        `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
        leftX, 82, { width: metaWidth, align: "right" }
      );

    doc.image(qrBuffer, qrX, 46, { width: qrSize, height: qrSize });
    doc.fillColor("#aaaaaa").fontSize(6).font("Helvetica")
      .text("Scan for order details", qrX - 20, 46 + qrSize + 2, { width: qrSize + 20, align: "center" });

    doc.moveTo(leftX, 132).lineTo(leftX + pageWidth, 132).strokeColor("#e8e0d5").stroke();

    // ── Customer details — name, order id, contact ──
    const custName  = snap.name || order.user?.name || "Customer";
    const custEmail = order.user?.email || "—";
    const custPhone = snap.phone || order.user?.phone || "—";
    let y = 148;

    doc.fillColor("#c4922a").fontSize(9).font("Helvetica-Bold").text("CUSTOMER DETAILS", leftX, y);
    doc.fillColor("#1a1a1a").fontSize(11).font("Helvetica-Bold").text(custName, leftX, y + 14);
    doc.fillColor("#555555").fontSize(9).font("Helvetica")
      .text(`Order ID: #${order.id}`, leftX, y + 30, { width: pageWidth / 2 })
      .text(`Email: ${custEmail}`, leftX + pageWidth / 2, y + 30, { width: pageWidth / 2 })
      .text(`Phone: ${custPhone}`, leftX, y + 44, { width: pageWidth / 2 });

    y += 68;
    doc.moveTo(leftX, y).lineTo(leftX + pageWidth, y).strokeColor("#e8e0d5").stroke();
    y += 16;

    // ── Sold by / Ship to — two columns ──
    const colWidth = pageWidth / 2 - 10;

    doc.fillColor("#c4922a").fontSize(9).font("Helvetica-Bold").text("SOLD BY", leftX, y);
    doc.fillColor("#1a1a1a").fontSize(11).font("Helvetica-Bold").text(SELLER.name, leftX, y + 14);
    doc.fillColor("#555555").fontSize(9).font("Helvetica")
      .text(SELLER.address, leftX, y + 30, { width: colWidth });
    doc.text(`Phone: ${SELLER.phone}`, leftX, doc.y + 2);
    doc.text(`Email: ${SELLER.email}`, leftX, doc.y + 2);

    const rightColX = leftX + colWidth + 20;
    doc.fillColor("#c4922a").fontSize(9).font("Helvetica-Bold").text("SHIP TO", rightColX, y);
    doc.fillColor("#1a1a1a").fontSize(11).font("Helvetica-Bold")
      .text(custName, rightColX, y + 14);
    doc.fillColor("#555555").fontSize(9).font("Helvetica")
      .text(snap.street || "—", rightColX, y + 30, { width: colWidth });
    doc.text(`${snap.city || ""}${snap.city ? ", " : ""}${snap.state || ""}${snap.pincode ? " - " + snap.pincode : ""}`, rightColX, doc.y + 2, { width: colWidth });
    if (snap.phone) doc.text(`Phone: ${snap.phone}`, rightColX, doc.y + 2);

    y = Math.max(doc.y, y + 82) + 20;

    // ── Payment meta strip ──
    doc.rect(leftX, y, pageWidth, 26).fill("#faf6f0");
    doc.fillColor("#555555").fontSize(9).font("Helvetica")
      .text(`Payment method: ${(order.paymentMethod || "—").toUpperCase()}`, leftX + 10, y + 8, { width: pageWidth / 3, continued: false })
      .text(`Payment status: ${order.paymentStatus}`, leftX + pageWidth / 3, y + 8, { width: pageWidth / 3 })
      .text(`Delivery status: ${order.deliveryStatus}`, leftX + (pageWidth / 3) * 2, y + 8, { width: pageWidth / 3 });

    y += 46;

    // ── Item table ──
    const col = {
      no:     leftX,
      item:   leftX + 30,
      qty:    leftX + pageWidth - 170,
      price:  leftX + pageWidth - 120,
      amount: leftX + pageWidth - 60,
    };

    doc.rect(leftX, y, pageWidth, 22).fill("#1a1a1a");
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");
    doc.text("#",        col.no,     y + 6);
    doc.text("Item",     col.item,   y + 6);
    doc.text("Qty",      col.qty,    y + 6, { width: 40, align: "right" });
    doc.text("Price",    col.price,  y + 6, { width: 50, align: "right" });
    doc.text("Amount",   col.amount, y + 6, { width: 60, align: "right" });
    y += 22;

    const items: any[] = order.items || [];
    items.forEach((item, i) => {
      const rowStartY = y;
      const name = item.product?.name || "Product";
      doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica");
      const nameHeight = doc.heightOfString(name, { width: col.qty - col.item - 10 });
      const rowHeight  = Math.max(24, nameHeight + 10);

      if (i % 2 === 1) doc.rect(leftX, rowStartY, pageWidth, rowHeight).fill("#faf9f7");

      doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica");
      doc.text(String(i + 1),                          col.no,     rowStartY + 7);
      doc.text(name,                                    col.item,   rowStartY + 7, { width: col.qty - col.item - 10 });
      doc.text(String(item.quantity),                   col.qty,    rowStartY + 7, { width: 40, align: "right" });
      doc.text(fp(item.price),                          col.price,  rowStartY + 7, { width: 50, align: "right" });
      doc.text(fp(item.price * item.quantity),           col.amount, rowStartY + 7, { width: 60, align: "right" });

      y = rowStartY + rowHeight;
    });

    doc.moveTo(leftX, y).lineTo(leftX + pageWidth, y).strokeColor("#e8e0d5").stroke();
    y += 12;

    // ── Totals ──
    const itemsSubtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const totalsX = leftX + pageWidth - 200;

    doc.fillColor("#555555").fontSize(10).font("Helvetica");
    doc.text("Subtotal", totalsX, y, { width: 120 });
    doc.text(fp(itemsSubtotal), totalsX + 120, y, { width: 80, align: "right" });
    y += 16;

    if (order.couponDiscount) {
      doc.fillColor("#34A853");
      doc.text(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, totalsX, y, { width: 120 });
      doc.text(`- ${fp(order.couponDiscount)}`, totalsX + 120, y, { width: 80, align: "right" });
      y += 16;
      doc.fillColor("#555555");
    }

    const shipping = order.totalAmount - itemsSubtotal + (order.couponDiscount || 0);
    if (shipping !== 0) {
      doc.text("Shipping", totalsX, y, { width: 120 });
      doc.text(fp(shipping), totalsX + 120, y, { width: 80, align: "right" });
      y += 16;
    }

    doc.moveTo(totalsX, y).lineTo(totalsX + 200, y).strokeColor("#e8e0d5").stroke();
    y += 8;
    doc.fillColor("#c0555a").fontSize(13).font("Helvetica-Bold");
    doc.text("Total", totalsX, y, { width: 120 });
    doc.text(fp(order.totalAmount), totalsX + 120, y, { width: 80, align: "right" });

    // ── Footer ──
    const footerY = doc.page.height - doc.page.margins.bottom - 60;
    doc.moveTo(leftX, footerY).lineTo(leftX + pageWidth, footerY).strokeColor("#e8e0d5").stroke();
    doc.fillColor("#aaaaaa").fontSize(8).font("Helvetica")
      .text("This is a computer-generated invoice and does not require a signature.", leftX, footerY + 10, { width: pageWidth, align: "center" })
      .text(`Questions about this order? WhatsApp us at ${SELLER.phone} or email ${SELLER.email}`, leftX, footerY + 24, { width: pageWidth, align: "center" })
      .text("Thank you for shopping with Hashtag Gifting!", leftX, footerY + 38, { width: pageWidth, align: "center" });

    doc.end();
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where:   { id: Number(id) },
      include: {
        user:  true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pdfBuffer = await buildInvoicePdf(order);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-order-${order.id}.pdf"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("INVOICE GENERATION ERROR:", err);
    // TEMP: surfacing the real message so we can see it without server
    // console access — revert to a generic message once this is confirmed fixed.
    return NextResponse.json(
      { error: "Failed to generate invoice", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
