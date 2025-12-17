import { defineConfig } from '@rstest/core';

export default defineConfig({
  coverage: {
    reporters: [
      'json',
      [
        '@canyonjs/report-html',
        {
          diff: [1, 2, 3],
        },
      ],
    ],
  },
});
