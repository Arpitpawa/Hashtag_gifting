import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashToken } from "@/lib/emailVerification";

// Link target of the verification email → marks the email verified, then
// sends the person to the login page with a success / failure notice.
export async function GET(req: NextRequest) {
  const base  = process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const token = req.nextUrl.searchParams.get("token") || "";

  if (!token || token.length > 200) {
    return NextResponse.redirect(`${base}/login?verified=invalid`);
  }

  const user: any = await prisma.user.findFirst({ where: { emailVerifyToken: hashToken(token) } as any });

  if (!user || !user.emailVerifyExpiresAt || user.emailVerifyExpiresAt < new Date()) {
    return NextResponse.redirect(`${base}/login?verified=invalid`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data:  { emailVerifiedAt: new Date(), emailVerifyToken: null, emailVerifyExpiresAt: null } as any,
  });

  return NextResponse.redirect(`${base}/login?verified=1`);
}
