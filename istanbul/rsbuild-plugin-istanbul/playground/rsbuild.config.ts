import { defineConfig } from '@rsbuild/core';
import { pluginIstanbul } from '../src';

export default defineConfig({
  plugins: [pluginIstanbul()],
});
