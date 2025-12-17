import { defineConfig } from '@rstest/core';

export default defineConfig({
  coverage: {
    provider: 'istanbul',
    reporters: [
      ['text', { skipFull: true }],
      ['json', { file: 'coverage-final.json' }],
    ],
  }
});
