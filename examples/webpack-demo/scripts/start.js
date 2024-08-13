const configFactory = require('../config/webpack.config');
const {merge} = require('webpack-merge');

module.exports = merge(configFactory,{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader','css-loader']
      }
    ],
  },
  mode: "development"
})
