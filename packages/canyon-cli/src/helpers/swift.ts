import fs from 'fs'
import * as fsPromise from 'fs/promises'
import glob from 'fast-glob'
import os from 'os'
import path from 'path'

import { info, UploadLogger } from '../helpers/logger'
import { isProgramInstalled, runExternalProgram } from "./util"

export async function generateSwiftCoverageFiles(project: string): Promise<string[]> {
  if (!isProgramInstalled('xcrun')) {
      throw new Error('xcrun is not installed, cannot process files')
  }
  info('==> Processing Xcode reports via llvm-cov...')

  const derivedDataDir = `${os.homedir()}/Library/Developer/Xcode/DerivedData`
  UploadLogger.verbose(`  DerivedData folder: ${derivedDataDir}`)

  if (project == "") {
    info("   hint: Speed up Swift processing by using use -J 'AppName'")
  }

  const profDataFiles = await glob.sync(['**/*.profdata'], {
      cwd: derivedDataDir,
      absolute: true,
      onlyFiles: true,
    })

  if (profDataFiles.length == 0) {
    info('  -> No swift coverage found.')
  } else {
    info(`Found ${profDataFiles.length} profdata files:`)
  }

  for (const profDataFile of profDataFiles) {
    info(`  ${profDataFile}`)
  }

  let outputFiles: string[] = []
  for (const profDataFile of profDataFiles) {
    const projOutputFiles = await convertSwiftFile(profDataFile, project)
    for (const projOutputFile of projOutputFiles) {
      info(`${profDataFile} ${projOutputFile}`)
    }
    outputFiles = outputFiles.concat(projOutputFiles)
  }
  return outputFiles
}

async function convertSwiftFile(profDataFile: string, project: string): Promise<string[]> {
  UploadLogger.verbose(`Starting conversion of ${profDataFile}`)
  let dirName = path.dirname(profDataFile)
  const BUILD = 'Build'
  if (profDataFile.includes(BUILD)) {
    dirName = dirName.substr(0, dirName.indexOf(BUILD) + (BUILD.length))
  }

  const outputFiles: string[] = []

  for (const fileType of ['app', 'framework', 'xctest']) {
    const reportDirs = await glob.sync([`**/*.${fileType}`], {
        cwd: dirName,
        absolute: true,
        onlyFiles: false
      })

    if (reportDirs.length == 0) {
      continue
    }

    for (const reportDir of reportDirs) {
      const proj = path.basename(reportDir, `.${fileType}`)

      if (project != "" && proj != project) {
        UploadLogger.verbose(`  Skipping ${proj} as it does not match project ${project}`)
        continue
      }
      info(`  + Building reports for ${proj} ${fileType}`)
      UploadLogger.verbose(`  Reports sourced from ${reportDir}`)

      let dest = path.join(reportDir, proj)
      if (!fs.existsSync(dest)) {
        dest = path.join(reportDir, 'Contents', 'MacOS', proj)
      }

      const outputFile = `${proj.replace(/\s/g,'')}.${fileType}.coverage.txt`
      try {
        await fsPromise.writeFile(
          outputFile,
          runExternalProgram(
            'xcrun',
            ['llvm-cov', 'show', '-instr-profile', profDataFile, dest]
          )
        )
        info(`  Coverage report written to ${outputFile}`)
        outputFiles.push(outputFile)
      } catch (error) {
        info(`  Could not write coverage report to ${outputFile}: ${error}`)
      }
    }
  }
  return outputFiles
}
