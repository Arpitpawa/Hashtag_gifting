interface SendOtpParams {
  phone: string;
  otp:   string;
}

export async function sendOtpSms({ phone, otp }: SendOtpParams): Promise<boolean> {
  try {
    const authKey  = process.env.MSG91_AUTH_KEY!;
    const senderId = process.env.MSG91_SENDER_ID || "HTGGFT";
    const templateId = process.env.MSG91_TEMPLATE_ID!;

    // MSG91 OTP API
    const response = await fetch("https://api.msg91.com/api/v5/otp", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "authkey":       authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile:      `91${phone}`,  // India country code
        otp,
      }),
    });

    const data = await response.json();
    return data.type === "success";

  } catch (err) {
    console.error("SMS SEND ERROR:", err);
    return false;
  }
}

// ── RESEND OTP ──
export async function resendOtp(phone: string): Promise<boolean> {
  try {
    const authKey = process.env.MSG91_AUTH_KEY!;

    const response = await fetch(
      `https://api.msg91.com/api/v5/otp/retry?authkey=${authKey}&mobile=91${phone}&retrytype=text`,
      { method: "POST" }
    );

    const data = await response.json();
    return data.type === "success";

  } catch (err) {
    console.error("OTP RESEND ERROR:", err);
    return false;
  }
}