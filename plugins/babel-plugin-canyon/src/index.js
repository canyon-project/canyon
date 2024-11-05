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
            VERSION: packageJson.version || '-'
          }


          // 生成初始覆盖率数据
          const initialCoverageDataForTheCurrentFile = generateInitialCoverage(generate(path.node).code)


          const t = api.types;
          // 遍历 Program 中的所有节点
          path.traverse({
            VariableDeclarator(variablePath) {
              // 直接判断对象的属性是否存在，是否是coverageData
              if (variablePath.node?.init?.properties?.some) {
                // 查找插桩后的字段
                const hasInstrumentation = variablePath.node.init.properties.some((prop) =>
                  t.isIdentifier(prop.key, { name: "_coverageSchema" }) || // 确保是已插桩的字段
                  t.isIdentifier(prop.key, { name: "s" }) ||
                  t.isIdentifier(prop.key, { name: "f" })
                );
                if (hasInstrumentation) {
                  // 获取 coverageData 对象的 properties
                  const properties = variablePath.node.init.properties;

                  // 删除 statementMap、fnMap 和 branchMap 属性
                  const keysToRemove = ["statementMap", "fnMap", "branchMap","inputSourceMap"];

                  keysToRemove.forEach(key => {
                    const index = properties.findIndex(prop =>
                      t.isIdentifier(prop.key, { name: key })
                    );

                    if (index !== -1) {
                      properties.splice(index, 1); // 删除属性
                    }
                  });
                }
              }
            }})


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
