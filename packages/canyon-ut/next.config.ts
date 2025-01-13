import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(__dirname, "../../.env") });

// flag position, do not delete

const nextConfig: NextConfig = {
  /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
