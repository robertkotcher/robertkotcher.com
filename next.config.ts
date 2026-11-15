import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/nyc-schools", destination: "/nyc-schools.html" }];
  },
  turbopack: {
    root,
  },
};

export default nextConfig;
