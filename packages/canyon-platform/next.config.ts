import type { NextConfig } from "next";
import { resolve } from "node:path";
import { config } from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
config({ path: resolve(__dirname, "../../.env") });

import prisma from "@/lib/prisma";

// 只有数据库URL是必须的，其他的都从库里读
// prisma 设置环境变量
// gitlab nodejs

// flag position, do not delete

export default async function () {
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
              // ["swc-plugin-coverage-instrument", {}],
              // ["swc-plugin-canyon", {}],
            ]
          : [],
    },
  };

  return withNextIntl(nextConfig);
}

// export default withNextIntl(nextConfig);
