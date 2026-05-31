import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // ── Image domains whitelist ─────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com"        },
      { protocol: "https", hostname: "images.unsplash.com"       },
      { protocol: "https", hostname: "confettigifts.in"          },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "aicagifts.com"             },
      { protocol: "https", hostname: "**.shopify.com"            },
      { protocol: "https", hostname: "cdn.shopify.com"           },
      { protocol: "https", hostname: "**.cdninstagram.com"       },
      { protocol: "https", hostname: "images.weserv.nl"          },
      { protocol: "https", hostname: "img.magnific.com"          },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com"},
    ],
    // Limit image sizes that can be generated
    deviceSizes:    [640, 750, 828, 1080, 1200, 1920],
    imageSizes:     [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // ── API body size limit ─────────────────────────────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

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