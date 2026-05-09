/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "confettigifts.in",
      },
    ],
  },
};

module.exports = nextConfig;