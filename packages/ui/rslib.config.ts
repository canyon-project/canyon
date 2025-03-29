import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact(),pluginBabel({
    babelLoaderOptions:{
      plugins: ['istanbul'],
    }
  })],
});
