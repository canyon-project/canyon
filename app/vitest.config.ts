import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    coverage: {
      provider: "istanbul",
      enabled: true,
      reporter: ["json", "@canyonjs/report"],
      include: ["src/**"],
    },
  },
});
