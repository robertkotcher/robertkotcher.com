import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/how-i-build-and-review-code-with-ai.html",
      destination: "/how-i-write-and-review-code-with-ai.html",
      permanent: true,
    }];
  },
  async rewrites() {
    return [{ source: "/nyc-schools", destination: "/nyc-schools.html" }];
  },
  turbopack: {
    root,
  },
};

export default nextConfig;
