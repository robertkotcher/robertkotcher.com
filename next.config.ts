import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/nyc-budget", destination: "/nyc-budget.html" }];
  },
  turbopack: {
    root,
  },
};

export default nextConfig;
