import fs from 'fs/promises'

import { info, UploadLogger } from '../helpers/logger'
import {
  XcodeCoverageFileReport,
  XcodeCoverageReport,
} from '../types'
import { isProgramInstalled, runExternalProgram } from "./util"

export async function generateXcodeCoverageFiles(archivePath: string): Promise<string> {
  if (!isProgramInstalled('xcrun')) {
      throw new Error('xcrun is not installed, cannot process files')
  }
  info('Running xcode coversion...')

  const coverage: XcodeCoverageReport = {}
  const report = { coverage: coverage }

  getFileList(archivePath).forEach(repoFilePath => {
    UploadLogger.verbose(`Converting ${repoFilePath}...`)
    const coverageInfo = getCoverageInfo(archivePath, repoFilePath)
    const coverageJson = convertCoverage(coverageInfo)
    report.coverage[repoFilePath] = coverageJson
  })

  let pathFilename = archivePath.split('/').pop()
  if (pathFilename) {
    pathFilename = pathFilename.split('.xcresult')[0]
  }
  const filename = `./coverage-report-${pathFilename}.json`
  UploadLogger.verbose(`Writing coverage to ${filename}`)
  await fs.writeFile(filename, JSON.stringify(report))
  return filename
}

function getFileList(archivePath: string): string[] {
  const fileList = runExternalProgram('xcrun', ['xccov', 'view', '--file-list', '--archive', archivePath]);
  return fileList.split('\n').filter(i => i !== '')
}

function getCoverageInfo(archivePath: string, filePath: string): string {
  return runExternalProgram('xcrun', ['xccov', 'view', '--archive', archivePath, '--file', filePath])
}

function convertCoverage(coverageInfo: string): XcodeCoverageFileReport {
  const coverageInfoArr = coverageInfo.split('\n')
  const obj: XcodeCoverageFileReport = {}
  coverageInfoArr.forEach(line => {
    const [lineNum, lineInfo] = line.split(':')
    if (lineNum && Number.isInteger(Number(lineNum))) {
      const lineHits = lineInfo?.trimStart().split(' ')[0]?.trim()
      if (typeof lineHits !== 'string') {
        return
      }
      if (lineHits === '*') {
        obj[String(lineNum.trim())] = null
      } else {
        obj[String(lineNum.trim())] = lineHits
      }
    }
  })
  return obj
}
