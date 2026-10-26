import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["api/**/*.e2e.test.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
  },
});
