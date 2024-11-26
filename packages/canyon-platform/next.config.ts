import type { NextConfig } from "next";

// 引入上层目录的.env配置
import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });

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
