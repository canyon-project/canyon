import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['json', '@canyonjs/report-html'], // 直接调试的是当前的index.js入口
    },
  },
});
