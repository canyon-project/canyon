import { template } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import packageJson from '../package.json';
import tep from './template';
import { visitorProgramExit } from './visitor-program-exit';

const writeCanyonToLocalTemplate = template(
  tep['templates/write-canyon-to-local-template.js'],
);

function newAtob() {
  try {
    return typeof atob === 'function' ? atob : () => '';
  } catch (e) {
    return () => '';
  }
}
const newatob = newAtob();

function trim(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (typeof obj[key] === 'string') {
      acc[key] = obj[key].trim();
    } else {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

export default declare((api, config, dirname) => {
  // 需要主动设置 assertVersion7 false
  if (config.assertVersion7 !== false) {
    api.assertVersion(7);
  }
  return {
    visitor: {
      Program: {
        exit: (path) => {
          const preset =
            ((process.env.CI_SERVER_URL || '').includes(newatob('Y3RyaXA=')) &&
              config.disableAutoUpload) === undefined
              ? {
                  provider: 'tripgl',
                  // ==========以上是属性=============
                  // 代理配置
                  oneByOne: {
                    proxy: {
                      protocol: 'http',
                      host: newatob('cHJveHlnYXRlMi5jdHJpcGNvcnAuY29t'),
                      port: 8080,
                    },
                  }, //可配置代理 默认false
                  special: true, //默认false
                  keepMap: true, // 默认true
                  slug: 'auto',
                }
              : {
                  provider: 'gitlab',
                  keepMap: true,
                  slug: 'auto',
                };
          config = {
            ...preset,
            ...trim(config),
          };

          const envs = process.env;
          const env_sha =
            envs.CI_MERGE_REQUEST_SOURCE_BRANCH_SHA ||
            envs.CI_BUILD_REF ||
            envs.CI_COMMIT_SHA;
          const env_projectID = envs.CI_PROJECT_ID;
          const env_branch = envs.CI_COMMIT_BRANCH;
          const env_buildID = envs.CI_JOB_ID;
          const env_buildProvider = 'gitlab_runner';

          const servePa: { provider?: string; compareTarget?: string } & any =
            trim({
              ...config,
              version: packageJson.version,
              projectID: config.projectID || env_projectID || '-',
              sha: config.sha || env_sha || '-',
              branch: config.branch || env_branch || '-',
              instrumentCwd: config.instrumentCwd || process.cwd(),
              // 自配置
              dsn: config.dsn || process.env['DSN'] || 'http://localhost:3000',
              reporter: config.reporter || process.env['REPORTER'] || '-',
              ci: config.ci || process.env['CI'] || false,
              buildID: config.buildID || env_buildID || '-',
              buildProvider: config.buildProvider || env_buildProvider,
              buildTarget: config.buildTarget || '',
            });

          visitorProgramExit(api, path, servePa, config);

          if (config.special) {
            //   其他逻辑
            // TODO: 需要删除writeCanyonToLocal
            const writeCanyonToLocal = writeCanyonToLocalTemplate({
              JSON: 'JSON',
            });
            // TODO: 需要删除writeCanyonToLocal
            // @ts-expect-error
            path.node.body.unshift(writeCanyonToLocal);
          }
        },
      },
    },
  };
});
