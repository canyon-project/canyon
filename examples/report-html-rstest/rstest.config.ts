import { defineConfig } from '@rstest/core';

export default defineConfig({
  coverage: {
    provider: 'istanbul',
    reporters: [
      'json',
      [
        '@canyonjs/report',
        {
          diff: [],
        },
      ],
    ],
  },
});
