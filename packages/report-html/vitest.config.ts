import { defineConfig } from 'vitest/config';
import {mockDiff} from "./mock-diff";
import path from 'path';

export default defineConfig({
  test:{
    coverage: {
      provider: 'istanbul',
      reporter: [
        'json',
        [
          path.resolve(__dirname, 'index.js'),
          {
            diff: mockDiff,
          },
        ],
      ],
    },
  }
});
