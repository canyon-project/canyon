import { defineConfig } from '@rsbuild/core';
import { pluginExample } from '../src';

export default defineConfig({
  plugins: [pluginExample()],
});
