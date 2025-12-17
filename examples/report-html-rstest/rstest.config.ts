import { defineConfig } from '@rstest/core';

export default defineConfig({
  coverage: {
    provider: 'istanbul',
    reporters: [
      'json',
      // @ts-ignore
      '@canyonjs/report-html'
    ],
  }
});
