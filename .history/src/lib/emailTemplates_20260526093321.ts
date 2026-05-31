export function orderConfirmedTemplate(
  name: string,
  orderId: number,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  address: string,
): string {
  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #f0ece6; font-family: Arial;">
        ${item.name}
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

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#f3efe8; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden;">

        <!-- HEADER -->
        <div style="background: #c0555a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -1px;">
            Hashtag <span style="font-size: 12px; letter-spacing: 3px; display: block; margin-top: 4px;">GIFTING</span>
          </h1>
        </div>

        <!-- BODY -->
        <div style="padding: 32px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Order confirmed! 🎉</h2>
          <p style="color: #6b6b6b;">Hi ${name}, your order has been placed successfully.</p>

          <div style="background: #f3efe8; border-radius: 12px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #1a1a1a; font-weight: bold;">Order #${orderId}</p>
            <p style="margin: 4px 0 0; color: #6b6b6b; font-size: 14px;">
              Delivering to: ${address}
            </p>
          </div>

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
            <a href="${process.env.NEXTAUTH_URL}/account/orders/${orderId}"
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
        <div style="background: #c0555a; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Hashtag Gifting</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a1a1a;">Your order is on the way! 🚚</h2>
          <p style="color: #6b6b6b;">Hi ${name}, your order #${orderId} has been shipped.</p>
          <div style="background: #f3efe8; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; color: #6b6b6b; font-size: 13px;">Tracking ID</p>
            <p style="margin: 8px 0 0; color: #1a1a1a; font-size: 22px; font-weight: bold; letter-spacing: 2px;">
              ${trackingId}
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
