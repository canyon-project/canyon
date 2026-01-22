import { defineConfig } from '@rstest/core';
import path from "path";
import { mockDiff } from './mock-diff';

export default defineConfig({
  coverage: {
    provider: 'istanbul',
    reporters: [
      'json',
      [
        path.resolve(__dirname, 'index.js'),
        {
          diff: mockDiff,
        },
      ],
    ],
  },
});
