import {declare} from "@babel/helper-plugin-utils";
import {visitorProgramExit} from "./visitor-program-exit";
import {template} from "@babel/core";
import tep from './template';
import packageJson from '../package.json'
const writeCanyonToLocalTemplate = template(tep["templates/write-canyon-to-local-template.js"])

function newAtob() {
  try {
    return typeof atob === 'function' ? atob : ()=>""
  } catch (e) {
    return ()=>""
  }
}
const newatob = newAtob()

function trim(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (typeof obj[key] === "string"){
      acc[key] = obj[key].trim();
    } else {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

export default declare((api, config, dirname) => {
  api.assertVersion(7);
  return {
    visitor: {
      Program: {
        exit: (path) => {
          const preset = (process.env.CI_SERVER_URL || '').includes(newatob('Y3RyaXA=')) ? {
              provider: 'tripgl',
              // ==========以上是属性=============
              // 代理配置
              oneByOne: {
                proxy:{
                  protocol: 'http',
                  host: newatob('cHJveHlnYXRlMi5jdHJpcGNvcnAuY29t'),
                  port: 8080
                }
              }, //可配置代理 默认false
              special: true, //默认false
              keepMap: true, // 默认true
              slug:'auto'
            }
            :{
              provider: 'gitlab',
              keepMap: true,
              slug:'auto'
            }
          config = {
            ...preset,
            ...trim(config),
          }

          const envs = process.env
          const env_sha = envs.CI_MERGE_REQUEST_SOURCE_BRANCH_SHA || envs.CI_BUILD_REF || envs.CI_COMMIT_SHA
          const env_projectID = envs.CI_PROJECT_ID
          const env_branch = envs.CI_COMMIT_BRANCH

          const servePa:{provider?:string,compareTarget?:string}&any = {
            ...config,
            version: packageJson.version,
            projectID: config.projectID || env_projectID || '-',
            sha: config.sha || env_sha || '-',
            branch: config.branch || env_branch || '-',
            instrumentCwd: config.instrumentCwd || process.cwd(),
            // 自配置
            dsn: config.dsn || process.env['DSN'] || 'http://localhost:3000',
            reporter: config.reporter || process.env['REPORTER'] || '-',
          }

          const {initialCoverageDataForTheCurrentFile} = visitorProgramExit(api, path, servePa)



          if (config.special) {
            //   其他逻辑

            // TODO: 需要删除writeCanyonToLocal
            const writeCanyonToLocal = writeCanyonToLocalTemplate({
              JSON: 'JSON'
            })
            // TODO: 需要删除writeCanyonToLocal
            // @ts-ignore
            path.node.body.unshift(writeCanyonToLocal)

          }


          const __canyon__ = {
            DSN: servePa.dsn,
            COMMIT_SHA: servePa.sha,
            PROJECT_ID: `${servePa.provider||'default'}-${servePa.projectID}-auto`,
            BRANCH: servePa.branch,
            REPORTER: servePa.reporter,
            COMPARE_TARGET: servePa.compareTarget||'-',
            INSTRUMENT_CWD: servePa.instrumentCwd,
          }

          if (config.oneByOne) {
            // 必须校验数据完整性
            if (initialCoverageDataForTheCurrentFile && __canyon__.DSN.includes('http') && __canyon__.COMMIT_SHA && __canyon__.PROJECT_ID && __canyon__.REPORTER) {
              if (__canyon__.COMMIT_SHA !== '-' && __canyon__.PROJECT_ID !== '-' && __canyon__.REPORTER !== '-') {
                const proxy = config.oneByOne.proxy || {}
                try {
                  const axios = require('axios')
                  axios.post(__canyon__.DSN.replace('https://','http://'), {
                    coverage: {
                      [initialCoverageDataForTheCurrentFile.path]: initialCoverageDataForTheCurrentFile
                    },
                    commitSha: __canyon__.COMMIT_SHA,
                    branch: __canyon__.BRANCH,
                    projectID: __canyon__.PROJECT_ID,
                    reportID: 'initial_coverage_data',
                    compare_target: __canyon__.COMPARE_TARGET,
                    instrumentCwd: __canyon__.INSTRUMENT_CWD,
                    // buildID: __canyon__.BUILD_ID,
                  }, {
                    headers: {
                      Authorization: 'Bearer ' + __canyon__.REPORTER,
                    },
                    timeout: 15000,
                    ...proxy
                  }).then(r=>{
                    if (config.debug){
                      console.log('Posted coverage data:', r.data)
                    }
                  }).catch(err=>{
                    if (config.debug){
                      console.log('Failed to post coverage data:', err)
                    }
                  })
                } catch (e) {
                  if (config.debug){
                    console.log('Failed to post coverage data:', e)
                  }
                }
              }
            } else {
              if (config.debug){
                console.log(JSON.stringify(initialCoverageDataForTheCurrentFile))
              }
            }
          }



        }
      },
    },
  };
});
