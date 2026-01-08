import { defineConfig } from '@rstest/core';

export default defineConfig({
  coverage: {
    provider: 'istanbul',
    reporters: [
      'json',
      [
        '@canyonjs/report-html',
        {
          diff: '',
        },
      ],
    ], // 直接调试的是当前的index.js入口
  },
});
