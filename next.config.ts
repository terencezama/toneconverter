import type { NextConfig } from "next";
import { resolve } from "node:path";

const repoRoot = resolve(process.cwd(), "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: repoRoot,
    resolveAlias: {
      "@shared": resolve(repoRoot, "shared"),
    },
  },
};

export default nextConfig;
