import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      enabled: true,
      reporter: ["json", "@canyonjs/report"],
      include: ["src/**"],
    },
  },
});
