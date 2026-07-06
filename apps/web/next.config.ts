import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone symlinks fail on Windows when the repo lives under OneDrive (path too long).
  ...(process.platform !== "win32" ? { output: "standalone" as const } : {}),
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
