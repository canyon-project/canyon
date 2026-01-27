import { defineConfig } from '@rstest/core';

import { mockDiff } from './mock-diff';

export default defineConfig({
  coverage: {
    provider: 'istanbul',
    reporters: [
      'json',
      [
        '/Users/travzhang/github.com/canyon-project/canyon/packages/report/dist/index.cjs',
        {
          diff: mockDiff,
        },
      ],
    ],
  },
});
