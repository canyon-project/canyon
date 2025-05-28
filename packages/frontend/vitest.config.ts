import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 排除 e2e 测试和某些特定目录
    coverage: {
      provider: 'istanbul', // or 'v8'
      reporter: ['text', 'json', 'html'],
      exclude: ['src/components/report.tsx'],
    },
  },
});
