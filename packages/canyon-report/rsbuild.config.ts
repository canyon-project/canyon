import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';
// import * as path from "node:path";

// console.log(process.env.RSBUILD_MODE)
// import aa from '../../plugins/babel-plugin-canyon/lib'

const normalConfig = defineConfig({
  plugins: [pluginReact(),pluginBabel({
    babelLoaderOptions:{
      plugins:['istanbul','canyon']
    }
  })],
  output:{
    copy: [
      // `./src/assets/image.png` -> `./dist/image.png`
      { from: './mock' },
    ],
  },
  tools: {
    swc: {
      jsc: {
        experimental: {
          // plugins: [['swc-plugin-coverage-instrument', {}]],
        },
      },
    },
  },
})

const componentConfig = {}


export default (process.env.RSBUILD_MODE === 'component' ? componentConfig : normalConfig);
