import { defineConfig } from 'vitest/config';
import {mockDiff} from "./mock-diff";

export default defineConfig({
  test:{
    coverage: {
      provider: 'istanbul',
      reporter: [
        'json',
        [
          // '/Users/travzhang/github.com/canyon-project/canyon/packages/report-html/index.js',
          {
            diff: mockDiff,
          },
        ],
      ],
    },
  }
});
