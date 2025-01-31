import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul', // or 'v8'
      reporter: [
        // 原本的报告器
        "json",
        // canyon-reporter
        "canyon-reporter"
      ],
    },
  },
})
