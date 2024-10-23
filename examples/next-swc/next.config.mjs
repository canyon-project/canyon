/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcPlugins: [
      [
        'swc-plugin-coverage-instrument', {},
      ],
      [
        // TODO: 目前SWC不支持插件内读取运行时环境变量，需要显式传入。已向SWC团队提交Issue，待解决后可删除下面的配置 https://github.com/swc-project/swc/issues/9668
        'swc-plugin-canyon', {
          projectID: process.env.CI_PROJECT_ID,
          sha: process.env.CI_COMMIT_SHA,
          dsn: process.env.DSN,
          reporter: process.env.REPORTER,
          branch: process.env.CI_COMMIT_BRANCH,
          instrumentCwd: process.cwd(),
          // compareTarget: 'dev', //可选
        },
      ]
    ],
  },
};

export default nextConfig;
