const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackBar = require('webpackbar');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: "static/js/main.[hash].chunk.js",
    publicPath:"/"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use:['babel-loader'],
        exclude:'/node_modules/'
      },
      {
        test: /\.(png|jpg|gif|svg|jpeg|eot|ttf|woff)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'static/media',
            },
          },
        ],
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  devServer: {
    host: "0.0.0.0",
    hot: true,
    port: 9050,
    open: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      inject: true
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/main.[hash].chunk.css"
    }),
    new WebpackBar(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          filter: async (resourcePath) => {
            if (resourcePath.includes('public/index.html')) {
              return false;
            }
            return true;
          },
        }],
    }),
  ],
  devtool: "source-map",
  mode: "development"
}
