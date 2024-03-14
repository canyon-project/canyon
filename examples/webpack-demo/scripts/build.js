const configFactory = require('../config/webpack.config');
const {merge} = require('webpack-merge');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = merge(configFactory, {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  mode: "production"
})
