import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "**.remove.bg" }],
  },
  // Cloudflare Pages 适配
  output: "standalone",
};

export default nextConfig;
