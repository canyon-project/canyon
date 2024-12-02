function newAtob() {
  try {
    return typeof atob === 'function' ? atob : null
  } catch (e) {
    return null
  }
}
const newatob = newAtob()

export const uploaderCoverageData = (initialCoverageDataForTheCurrentFile,__canyon__) => {
  const debug = true
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
          if (debug){
            console.log('Failed to post coverage data:', err)
          }
        })
      } catch (e) {
        if (debug){
          console.log('Failed to post coverage data:', e)
        }
      }
    }
  } else {
    if (debug){
      console.log(JSON.stringify(initialCoverageDataForTheCurrentFile))
    }
  }
}
