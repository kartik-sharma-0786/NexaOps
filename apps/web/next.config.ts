import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  // Standalone symlinks fail on Windows when the repo lives under OneDrive (path too long).
  ...(process.platform !== "win32" ? { output: "standalone" as const } : {}),
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
