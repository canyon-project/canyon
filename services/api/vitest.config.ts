import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.e2e.test.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
  },
});
