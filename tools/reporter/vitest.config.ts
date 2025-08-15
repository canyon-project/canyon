import * as path from 'node:path';
import { defineConfig } from 'vitest/config';

const self = path.resolve(__dirname, 'index.js');

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['json', self],
    },
  },
});
