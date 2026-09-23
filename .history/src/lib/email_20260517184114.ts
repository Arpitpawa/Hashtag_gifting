import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const { error } = await resend.emails.send({
      from:    `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("RESEND EMAIL ERROR:", error);
    }
  } catch (err) {
    // Never fail order if email fails
    console.error("EMAIL SEND ERROR:", err);
  }
}