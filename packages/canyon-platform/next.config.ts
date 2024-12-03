import type { NextConfig } from "next";
import { resolve } from "node:path";
import { config } from "dotenv";
import fs from "node:fs";
config({ path: resolve(__dirname, "../../.env") });
console.log(fs.chmod);

// flag position, do not delete

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    swcPlugins:
      process.env.NODE_ENV === "production"
        ? [
            ["swc-plugin-coverage-instrument", {}],
            ["swc-plugin-canyon", {}],
          ]
        : [],
  },
};

export default nextConfig;
