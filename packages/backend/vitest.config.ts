import * as path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage:{
      provider:'istanbul',
      enabled:true,
      reporter:['json','@canyonjs/report'],
      include: [
        'src/**',
      ],
    },
    // globals: true,
    // environment: 'node',
  },
});
