import { defineConfig } from '@rstest/core';
import path from 'node:path'
import { mockDiff } from './mock-diff';


export default defineConfig({
  coverage: {
    provider: 'istanbul',
    reporters: [
      'json',
      [
        path.resolve(__dirname, './dist/index.cjs'),
        {
          diff: mockDiff,
        },
      ],
    ],
  },
});
