// Escape user-supplied text before it goes into an HTML email.
export function esc(v: unknown): string {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export function orderConfirmedTemplate(
  name: string,
  orderId: number,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  address: string,
  paymentMethod: string | null,
  orderDate: Date,
  giftNote?: string | null,
): string {
  const baseUrl = process.env.NEXTAUTH_URL || "";

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #f0ece6; font-family: Arial;">
        ${esc(item.name)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #f0ece6; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #f0ece6; text-align: right;">
        Rs. ${(item.price / 100).toLocaleString("en-IN")}
      </td>
    </tr>
  `,
    )
    .join("");

  const paymentLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online";

  const orderDateLabel = orderDate.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const estDelivery = new Date(orderDate);
  estDelivery.setDate(estDelivery.getDate() + 4);
  const estDeliveryLabel = estDelivery.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#f3efe8; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden;">

        <!-- HEADER -->
        <div style="background: #c0555a; padding: 28px; text-align: center;">
          <img src="${baseUrl}/logo-email.png" alt="Hashtag Gifting" width="64" height="64"
               style="display: block; margin: 0 auto 10px; border-radius: 50%;" />
          <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: -0.5px;">
            Hashtag <span style="font-size: 11px; letter-spacing: 3px; display: block; margin-top: 2px; opacity: 0.9;">GIFTING</span>
          </h1>
        </div>

        <!-- BODY -->
        <div style="padding: 32px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Order confirmed! 🎉</h2>
          <p style="color: #6b6b6b;">Hi ${esc(name)}, your order has been placed successfully.</p>

          <div style="background: #f3efe8; border-radius: 12px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #1a1a1a; font-weight: bold;">Order #${orderId}</p>
            <p style="margin: 4px 0 0; color: #6b6b6b; font-size: 14px;">
              Delivering to: ${esc(address)}
            </p>
            <table style="width: 100%; margin-top: 12px; border-top: 1px solid #e8e0d5; padding-top: 12px;">
              <tr>
                <td style="color: #888; font-size: 12px; padding: 2px 0;">Order date</td>
                <td style="color: #1a1a1a; font-size: 12px; font-weight: bold; text-align: right;">${orderDateLabel}</td>
              </tr>
              <tr>
                <td style="color: #888; font-size: 12px; padding: 2px 0;">Payment method</td>
                <td style="color: #1a1a1a; font-size: 12px; font-weight: bold; text-align: right;">${paymentLabel}</td>
              </tr>
              <tr>
                <td style="color: #888; font-size: 12px; padding: 2px 0;">Estimated delivery</td>
                <td style="color: #c0555a; font-size: 12px; font-weight: bold; text-align: right;">${estDeliveryLabel}</td>
              </tr>
            </table>
          </div>

          ${giftNote ? `
          <!-- GIFT NOTE -->
          <div style="background: #fdf6f0; border: 1px dashed #e0b8ac; border-radius: 12px; padding: 16px; margin: 0 0 24px;">
            <p style="margin: 0 0 6px; color: #c0555a; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              🎁 Your gift note
            </p>
            <p style="margin: 0; color: #1a1a1a; font-size: 14px; font-style: italic; line-height: 1.5;">
              "${esc(giftNote)}"
            </p>
          </div>
          ` : ""}

          <!-- ITEMS TABLE -->
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3efe8;">
                <th style="padding: 10px; text-align: left; font-size: 13px; color: #555;">Product</th>
                <th style="padding: 10px; text-align: center; font-size: 13px; color: #555;">Qty</th>
                <th style="padding: 10px; text-align: right; font-size: 13px; color: #555;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 10px; font-weight: bold; color: #1a1a1a;">Total</td>
                <td style="padding: 12px 10px; font-weight: bold; text-align: right; color: #c0555a; font-size: 16px;">
                  Rs. ${(total / 100).toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/track?orderId=${orderId}"
               style="background: #c0555a; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px;">
              Track your order
            </a>
          </div>

          <p style="color: #6b6b6b; font-size: 13px; text-align: center;">
            Questions? WhatsApp us at
            <a href="https://wa.me/917665909909" style="color: #c0555a;">+91 86400 30112</a>
          </p>
        </div>

        <!-- FOOTER -->
        <div style="background: #f3efe8; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #aaa; font-size: 12px;">
            © ${new Date().getFullYear()} Hashtag Gifting, Jaipur. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── ADMIN ALERT — sent to every ADMIN-role account the moment a real order
// lands (COD placed, or online payment confirmed), so the business owner
// finds out even if nobody's looking at the admin panel right now. This is
// deliberately short and skimmable from a phone lock-screen preview, unlike
// the customer-facing confirmation email above.
export function adminNewOrderTemplate(
  orderId: number,
  customerName: string,
  items: Array<{ name: string; quantity: number }>,
  total: number,
  paymentMethod: string | null,
  giftNote?: string | null,
): string {
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const paymentLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online";

  const itemsLine = items
    .map((i) => `${esc(i.name)}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`)
    .join(", ");

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#f3efe8; font-family: Arial, sans-serif;">
      <div style="max-width: 480px; margin: 32px auto; background: white; border-radius: 16px; overflow: hidden;">

        <div style="background: #1a1a1a; padding: 20px 24px; text-align: center;">
          <p style="margin: 0; color: white; font-size: 15px; font-weight: bold;">
            🔔 New order on Hashtag Gifting
          </p>
        </div>

        <div style="padding: 24px;">
          <p style="margin: 0 0 4px; color: #1a1a1a; font-size: 20px; font-weight: bold;">
            Order #${orderId} — Rs. ${(total / 100).toLocaleString("en-IN")}
          </p>
          <p style="margin: 0 0 16px; color: #888; font-size: 13px;">
            ${esc(customerName)} · ${paymentLabel}
          </p>

          <div style="background: #f3efe8; border-radius: 12px; padding: 14px 16px; margin-bottom: ${giftNote ? "12px" : "20px"};">
            <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">${itemsLine}</p>
          </div>

          ${giftNote ? `
          <div style="background: #fdf6f0; border: 1px dashed #e0b8ac; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 4px; color: #c0555a; font-weight: bold; font-size: 11px; text-transform: uppercase;">🎁 Gift note</p>
            <p style="margin: 0; color: #1a1a1a; font-size: 13px; font-style: italic;">"${esc(giftNote)}"</p>
          </div>
          ` : ""}

          <a href="${baseUrl}/admin/orders"
             style="display: block; text-align: center; background: #c0555a; color: white; padding: 13px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px;">
            View in admin panel
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function orderShippedTemplate(
  name: string,
  orderId: number,
  trackingId: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#f3efe8; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden;">
        <div style="background: #c0555a; padding: 28px; text-align: center;">
          <img src="${process.env.NEXTAUTH_URL || ""}/logo-email.png" alt="Hashtag Gifting" width="56" height="56"
               style="display: block; margin: 0 auto 8px; border-radius: 50%;" />
          <h1 style="color: white; margin: 0; font-size: 20px;">Hashtag Gifting</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a1a1a;">Your order is on the way! 🚚</h2>
          <p style="color: #6b6b6b;">Hi ${esc(name)}, your order #${orderId} has been shipped.</p>
          <div style="background: #f3efe8; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; color: #6b6b6b; font-size: 13px;">Tracking ID</p>
            <p style="margin: 8px 0 0; color: #1a1a1a; font-size: 22px; font-weight: bold; letter-spacing: 2px;">
              ${esc(trackingId)}
            </p>
          </div>
          <p style="color: #6b6b6b; font-size: 13px; text-align: center;">
            Questions? WhatsApp us at
            <a href="https://wa.me/917665909909" style="color: #c0555a;">+91 86400 30112</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}