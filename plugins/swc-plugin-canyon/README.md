# swc-plugin-canyon

A SWC plugin cooperates with istanbul to report the coverage.

__Note:__ To use this plugin, it is recommended to use a branch to determine whether it is in effect or not, as he is not available for production environments.

## Usage

Install it:

```sh
npm install --save-dev swc-plugin-canyon
```

Add it to `next.config.mjs` in test mode:

```js
const nextConfig = {
    experimental: {
      swcPlugins: process.env.CI_COMMIT_REF_NAME === 'test-coverage'? [
        'swc-plugin-coverage-instrument', {},
        'swc-plugin-canyon', {},
      ]:[],
    },
  };

export default nextConfig;
```

View [Example](https://github.com/canyon-project/canyon/blob/main/examples/next-swc/next.config.mjs)


## Configuration

next.config.mjs

```js
const nextConfig = {
    experimental: {
      swcPlugins: [
        [
          'swc-plugin-coverage-instrument', {},
          'swc-plugin-canyon',
          {
            dsn: 'http://yourdomain.com/coverage/client',
            reporter: 'your_token',
            projectID: '230614',
            sha: 'xxxxxxxxx',
            reportID: 'case_id',
            branch: 'master',
            compareTarget: 'develop',
          },
        ],
      ],
    },
  };

export default nextConfig;
```

| Prop      | Description                                                                                                             | Usage                                     |
|-----------|-------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| dsn       | Service address for reporting coverage, recommended to be configured via pipeline variables.                            | Required               |
| reporter  | Reporter for reporting coverage, recommended to be configured via pipeline variables.                                   | Required               |
| projectID | Git repository ID, the plugin will detect the variables of the pipeline, which usually don't need to be configured.     | Required |
| sha       | Git repository SHA, the plugin will detect the variables of the pipeline, which usually don't need to be configured.    | Required |
| instrumentCwd     | Instrument Cwd, which usually don't need to be configured.                                                              | Required               |
| reportID    | Report ID, Used to distinguish between different test cases.                                                            | Optional          |
| branch    | Git repository branch, the plugin will detect the variables of the pipeline, which usually don't need to be configured. | Optional          |
| compareTarget    | Compare target, used as a baseline against current sha to calculate change line coverage.                               | Optional          |
