import prisma from "@/lib/prisma";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS       = 5;

// ── GENERATE SECURE 6-DIGIT OTP ──
export function generateOtp(): string {
  // Cryptographically secure random 6-digit number
  const buffer = crypto.randomBytes(4);
  const num    = buffer.readUInt32BE(0) % 1_000_000;
  return String(num).padStart(6, "0");
}

// ── SAVE OTP TO DB ──
export async function saveOtp(phone: string, otp: string): Promise<void> {
  // Delete any existing OTPs for this phone first
  await prisma.otpVerification.deleteMany({ where: { phone } });

  await prisma.otpVerification.create({
    data: {
      phone,
      otp,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts:  0,
      verified:  false,
    },
  });
}

// ── VERIFY OTP ──
export async function verifyOtp(
  phone: string,
  otp:   string
): Promise<{
  valid:   boolean;
  error?:  string;
}> {
  const record = await prisma.otpVerification.findFirst({
    where: { phone, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { valid: false, error: "No OTP found. Please request a new one." };
  }

  // Check expiry
  if (new Date() > record.expiresAt) {
    await prisma.otpVerification.delete({ where: { id: record.id } });
    return { valid: false, error: "OTP has expired. Please request a new one." };
  }

  // Check max attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.otpVerification.delete({ where: { id: record.id } });
    return { valid: false, error: "Too many wrong attempts. Please request a new OTP." };
  }

  // Wrong OTP — increment attempts
  if (record.otp !== otp) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data:  { attempts: { increment: 1 } },
    });

    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    return {
      valid: false,
      error: remaining > 0
        ? `Wrong OTP. ${remaining} attempt(s) remaining.`
        : "Too many wrong attempts. Please request a new OTP.",
    };
  }

  // ✅ OTP is correct — mark as verified
  await prisma.otpVerification.update({
    where: { id: record.id },
    data:  { verified: true },
  });

  return { valid: true };
}

// ── CLEANUP EXPIRED OTPs (run periodically) ──
export async function cleanupExpiredOtps(): Promise<void> {
  await prisma.otpVerification.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}