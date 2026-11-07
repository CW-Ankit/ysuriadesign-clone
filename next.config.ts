import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ysuriadesign.co",
      },
      {
        protocol: "https",
        hostname: "ysuriadesign.com",
      },
    ],
  },
};

export default nextConfig;
