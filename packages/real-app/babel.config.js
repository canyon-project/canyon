module.exports = {
  plugins: [
    "istanbul",
    [
      "@canyonjs",
      {
        keepMap: true,
        ci: true,
        // 以下配置支持显式传入环境变量
        repoID: "123",
        sha: "xxx",
        provider: "gitlab",
        instrumentCwd: process.cwd(),
        buildTarget: "native",
      },
    ],
  ],
};
