import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },

      // Confetti Gifts Images
      {
        protocol: "https",
        hostname: "confettigifts.in",
      },
    ],
  },
};

export default nextConfig;