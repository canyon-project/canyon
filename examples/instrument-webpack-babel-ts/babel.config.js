module.exports = {
  plugins: [
    'istanbul',
    [
      'canyon',
      {
        keepMap: true,
        ci: true,
        // 以下配置支持显式传入环境变量
        // projectID: process.env.CI_PROJECT_ID,
        // sha: process.env.CI_COMMIT_SHA,
        // dsn: process.env.DSN,
        // reporter: process.env.REPORTER,
        // branch: process.env.CI_COMMIT_BRANCH,
        // instrumentCwd: process.cwd(),
      },
    ],
  ],
};
