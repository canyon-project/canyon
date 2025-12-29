const path = require('path');

module.exports = {
  entry: './build/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader'],
        exclude: '/node_modules/',
      },
    ],
  },
};
