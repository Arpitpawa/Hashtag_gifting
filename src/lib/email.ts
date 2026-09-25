import { Resend } from "resend";

// Lazy init — don't crash if key is missing
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendEmailParams {
  to:      string | string[]; // array = same email to multiple recipients (e.g. every admin)
  subject: string;
  html:    string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Email skipped — RESEND_API_KEY not configured");
      return;
    }
    const { error } = await getResend().emails.send({
      from:    `${process.env.EMAIL_FROM_NAME || "Hashtag Gifting"} <${process.env.EMAIL_FROM || "orders@hashtaggifting.com"}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("RESEND EMAIL ERROR:", error);
    }
  } catch (err) {
    // Never fail the order if email fails
    console.error("EMAIL SEND ERROR:", err);
  }
}