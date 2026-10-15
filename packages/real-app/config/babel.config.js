const path = require("path");

module.exports = {
  plugins: [
    "istanbul",
    [
      "@canyonjs",
      {
        keepMap: true,
        ci: true,
        repoID: "123",
        sha: "xxx",
        provider: "gitlab",
        instrumentCwd: path.resolve(__dirname, ".."),
        buildTarget: "native",
      },
    ],
  ],
};
