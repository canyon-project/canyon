import { defineConfig } from '@rspack/cli';
import { rspack, type SwcLoaderOptions } from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  entry: {
    main: './src/main.tsx',
  },
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
    assetModuleFilename: 'assets/[name][ext]',
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules\/monaco-editor/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    isDev ? new ReactRefreshRspackPlugin() : null,
    new MonacoWebpackPlugin({
      languages: ['javascript'],
      globalAPI: true,
    }),
    new rspack.CopyRspackPlugin({
      patterns: [{ from: 'public' }],
    }),
    new rspack.CssExtractRspackPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[name].css',
    }),
  ].filter(Boolean),

  experiments: {
    css: true,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true,
        },
      },
    },
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: {
          targets: ['> 0.25%', 'not dead'],
        },
      }),
    ],
  },
  devtool: false, // 设置为false即可关闭所有环境的sourcemap
});
