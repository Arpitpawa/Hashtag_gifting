import { getToken }    from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Security headers applied to every response ────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy — disable camera, mic, geolocation access
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // HSTS — force HTTPS (only on production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://confettigifts.in https://lh3.googleusercontent.com",
      "connect-src 'self' https://api.razorpay.com https://www.google-analytics.com https://vitals.vercel-insights.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  return response;
}

// ── Request size check ────────────────────────────────────────────────────────
const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB

function isBodyTooLarge(req: NextRequest): boolean {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) return true;
  return false;
}

// ── Bot / suspicious UA detection ────────────────────────────────────────────
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /python-requests\/[01]\./i,
  /curl\/[0-6]\./i,
  /dirbuster/i,
  /burpsuite/i,
  /havij/i,
  /acunetix/i,
];

function isBlockedUserAgent(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") || "";
  return BLOCKED_UA_PATTERNS.some(pattern => pattern.test(ua));
}

// ── Path traversal detection ──────────────────────────────────────────────────
function hasPathTraversal(pathname: string): boolean {
  return pathname.includes("../") || pathname.includes("..\\") || pathname.includes("%2e%2e");
}

// ── Main middleware ───────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Block path traversal attempts
  if (hasPathTraversal(pathname)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 2. Block known attack tools
  if (isBlockedUserAgent(req)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 3. Block oversized requests to API routes
  if (pathname.startsWith("/api/") && isBodyTooLarge(req)) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  // 4. Admin route protection
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== "ADMIN") {
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/login?error=unauthorized", req.url))
      );
    }
  }

  // 5. Account + checkout protection
  if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return addSecurityHeaders(
        NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
      );
    }
  }

  // 6. Add security headers to all responses
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};