import * as colors from 'colors'
import * as moment from 'moment'

export function getUuid() {
  const s = []
  const hexDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'
  const uuid = s.join('')
  return uuid
}

// 扭转覆盖率对象路径
export function reverseCoveragePath({ coverage, projectId, processCwd }) {
  function reversePath(p) {
    return p.replace(processCwd, `/code/${projectId}`)
  }
  const obj = {}
  for (const coverageKey in coverage) {
    obj[reversePath(coverageKey)] = {
      ...coverage[coverageKey],
      path: reversePath(coverageKey),
    }
  }
  return {
    coverage: obj,
  }
}

export function configLog({ type, info }) {
  console.log(
    colors.green(`[Conf] ${process.pid}  - `) +
      colors.black(moment().format('MM/DD/YYYY, h:mm:ss A')) +
      colors.green(`     LOG `) +
      colors.bgYellow(`[${type}] `) +
      colors.bgGreen(`${info} `),
  )
}

// 格式化覆盖率数据
export function formatCoverage(coverage: any): any {
  return Object.values(coverage).map((item: any) => {
    return {
      ...item,
      statementMap: Object.values(item.statementMap),
      fnMap: Object.values(item.fnMap),
      branchMap: Object.values(item.branchMap),
      s: Object.values(item.s),
      f: Object.values(item.f),
      b: Object.values(item.b),
    }
  })
}

export function getRangeRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
