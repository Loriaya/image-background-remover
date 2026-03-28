import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "**.remove.bg" }],
  },
};

export default nextConfig;
