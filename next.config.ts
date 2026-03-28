import type { NextConfig } from "next";
import { createCache } from "@cloudflare/next-on-pages";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "**.remove.bg" }],
  },
};

export default createCache({
  nextConfig,
});
