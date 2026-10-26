const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "../.artifacts/tsc/main.js"),
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, "babel.config.js"),
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
};
