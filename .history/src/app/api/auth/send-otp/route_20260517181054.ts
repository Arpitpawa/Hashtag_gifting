import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateOtp, saveOtp } from "@/lib/otpManager";
import { sendOtpSms } from "@/lib/sms";
import { rateLimit } from "@/lib/rateLimit";
import { isValidPhone } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  try {
    // ── RATE LIMIT — max 5 OTPs per phone per 10 mins ──
    const ip      = req.headers.get("x-forwarded-for") || "unknown";
    const limited = rateLimit(`send-otp:${ip}`, {
      maxRequests: 5,
      windowMs:    10 * 60_000,
    });

    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    const { phone } = await req.json();

    // ── VALIDATE PHONE ──
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    // ── GENERATE + SAVE OTP ──
    const otp = generateOtp();
    await saveOtp(phone, otp);

    // ── SEND SMS ──
    const sent = await sendOtpSms({ phone, otp });

    if (!sent) {
      // Fallback: log OTP in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] OTP for ${phone}: ${otp}`);
      } else {
        return NextResponse.json(
          { error: "Failed to send OTP. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to +91 ${phone}`,
      // Only expose in development
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}