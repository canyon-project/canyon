import { defineConfig } from 'vitest/config'
import * as path from "node:path";

const aa = path.resolve(__dirname, 'index.js');

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul', // or 'v8'
      reporter: [
        'json',
        aa,
      ],
    },
  },
})
