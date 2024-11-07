import { declare } from '@babel/helper-plugin-utils'
import {template} from "@babel/core";
import tep from './template'
import generate from '@babel/generator';
import {generateInitialCoverage} from "./helpers/generate-initial-coverage";
import {generateCanyon} from "./helpers/generate-canyon";
const canyonTemplate = template(tep["templates/canyon.template.js"]);
const writeCanyonToLocalTemplate = template(tep["templates/write-canyon-to-local-template.js"])
const injectInPagePopupTemplate = template(tep["templates/inject-in-page-popup.js"])
import packageJson from '../package.json'

// 转换配置，优先级：babel配置 > 环境变量
function convertConfig(config) {
  let defaultCiField = {
    projectID: 'CI_PROJECT_ID',
    buildID: 'CI_JOB_ID',
    commitSha: 'CI_COMMIT_SHA',
    reporter: 'REPORTER',
    dsn: 'DSN',
    branch: 'CI_COMMIT_BRANCH'
  }
  let data = {}
  for (const ciFieldKey in defaultCiField) {
    data[ciFieldKey] = config[ciFieldKey] || process.env[defaultCiField[ciFieldKey]]
  }
  return {
    ...config,
    ...data
  }
}

function newAtob() {
  try {
    return typeof atob === 'function' ? atob : null
  } catch (e) {
    return null
  }
}
const newatob = newAtob()

function analyzeIntervalTime (intervalTime) {
  if (!isNaN(Number(intervalTime))){
    return String(intervalTime)
  } else {
    return '0'
  }
}

export default declare((api,config) => {
  api.assertVersion(7)
  return {
    visitor: {
      Program: {
        exit(path) {

          // 转换配置
          config = convertConfig(config)

          const __canyon__ = {
            PROJECT_ID: String(config.projectID) || '-',
            BUILD_ID: String(config.buildID) || '-',
            DSN: config.dsn || '-',
            REPORTER: config.reporter || '-',
            INSTRUMENT_CWD: config.instrumentCwd || process.cwd(),
            COMMIT_SHA: config.commitSha ||config.sha || '-',
            BRANCH: config.branch || '-',
            REPORT_ID: config.reportID || '-',
            COMPARE_TARGET: config.compareTarget || '-',
            INTERVAL_TIME: analyzeIntervalTime(config.intervalTime),
            VERSION: packageJson.version || '-'
          }


          // 生成初始覆盖率数据
          const initialCoverageDataForTheCurrentFile = generateInitialCoverage(generate(path.node).code)
          // generateCanyon(__canyon__)

          // 生成canyon代码
          const canyon = canyonTemplate(__canyon__);
          // TODO: 需要删除writeCanyonToLocal
          const writeCanyonToLocal = writeCanyonToLocalTemplate({
            JSON: 'JSON'
          })
          const injectInPagePopup = injectInPagePopupTemplate({
            JSON: 'JSON'
          })
          path.node.body.unshift(canyon)
          // TODO: 需要删除writeCanyonToLocal
          path.node.body.unshift(writeCanyonToLocal)

          if (config.injectInPagePopup){
            // TODO: 测试代码
            path.node.body.unshift(injectInPagePopup)
          }


          // 必须校验数据完整性
          if (initialCoverageDataForTheCurrentFile && __canyon__.DSN.includes('http') && __canyon__.COMMIT_SHA && __canyon__.PROJECT_ID && __canyon__.REPORTER) {
            if (__canyon__.COMMIT_SHA !== '-' && __canyon__.PROJECT_ID !== '-' && __canyon__.REPORTER !== '-' && newatob) {
              const proxy = (process.env.CI_SERVER_URL || '').includes(newatob('Y3RyaXA=')) ? {
                proxy: {
                  protocol: 'http',
                  host: newatob('cHJveHlnYXRlMi5jdHJpcGNvcnAuY29t'),
                  port: 8080
                }
              } : {}
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
                  buildID: __canyon__.BUILD_ID,
                }, {
                  headers: {
                    Authorization: 'Bearer ' + __canyon__.REPORTER,
                  },
                  timeout: 15000,
                  ...proxy
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
    }
  }
})
