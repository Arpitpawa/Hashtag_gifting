import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // ── Standalone output ───────────────────────────────────────────────────────
  // Traces only the files/node_modules the server actually needs into
  // .next/standalone. Without this, `next start` on your VPS runs against
  // the FULL node_modules (Prisma, Konva, everything) — standalone cuts the
  // deployed footprint way down and speeds up cold starts / restarts (pm2
  // reload, server reboot, etc). Deploy by copying .next/standalone,
  // .next/static, and public/ to the server and running `node server.js`.
  output: "standalone",

  // ── Image domains whitelist ─────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/dxioc14zc/**" }, // only OUR Cloudinary account
      { protocol: "https", hostname: "images.unsplash.com"       },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "placehold.co"               },
    ],
    // Limit image sizes that can be generated
    deviceSizes:    [640, 750, 828, 1080, 1200, 1920],
    imageSizes:     [16, 32, 48, 64, 96, 128, 256, 384],
    // Was 60 (seconds) — every optimized image variant got evicted from
    // Vercel's image cache a minute after being generated, so almost every
    // real visitor was paying the ~100-300ms re-optimization cost on every
    // single product/hero image, on every page, all day, instead of ever
    // getting a cached hit. Source images live on Cloudinary behind their
    // own unique URLs (a changed photo gets a new URL, not the same one
    // mutated in place), so nothing here goes stale from caching this long
    // — bumped to a year to match the static-asset Cache-Control below.
    minimumCacheTTL: 31536000,
    // AVIF first (smaller than WebP at the same quality when the visitor's
    // browser supports it — most do now), WebP as the fallback Next was
    // already serving.
    formats: ["image/avif", "image/webp"],
  },

  // ── API body size limit ─────────────────────────────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  // ── pdfkit needs to run un-bundled ──────────────────────────────────────────
  // pdfkit loads its base-14 font metrics off disk using paths relative to its
  // own node_modules folder. If webpack/Turbopack bundles it into the route's
  // chunk, those relative paths break and every PDF generation throws — this
  // tells Next to require() it straight from node_modules at runtime instead.
  serverExternalPackages: ["pdfkit"],

  // ── Powered by header removal ───────────────────────────────────────────────
  poweredByHeader: false,

  // ── Strict mode ────────────────────────────────────────────────────────────
  reactStrictMode: true,

  // ── Security headers via next.config ──────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY"                          },
          { key: "X-Content-Type-Options",    value: "nosniff"                       },
          { key: "X-XSS-Protection",          value: "1; mode=block"                },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/(.*)\\.(jpg|jpeg|png|webp|gif|svg|ico|woff|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ── Redirect http to https (production) ────────────────────────────────────
  async redirects() {
    return [
      {
        source:      "/home",
        destination: "/",
        permanent:   true,
      },
    ];
  },
};

export default nextConfig;