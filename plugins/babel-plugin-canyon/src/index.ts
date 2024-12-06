import {declare} from "@babel/helper-plugin-utils";
import {visitorProgramExit} from "./visitor-program-exit";

export default declare((api, config, dirname) => {
  api.assertVersion(7);
  return {
    visitor: {
      Program: {
        exit: (path) => {
          const envs = process.env
          const env_sha = envs.CI_MERGE_REQUEST_SOURCE_BRANCH_SHA || envs.CI_BUILD_REF || envs.CI_COMMIT_SHA
          const env_projectID = envs.CI_PROJECT_ID
          visitorProgramExit(api, path, {
            projectID: config.projectID || env_projectID || '-',
            sha: config.sha || env_sha || '-',
            instrumentCwd: config.instrumentCwd || process.cwd(),
            dsn: config.dsn || process.env['DSN'] || 'http://localhost:3000',
          })
        }
      },
    },
  };
});
