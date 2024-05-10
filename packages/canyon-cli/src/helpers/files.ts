import { spawnSync } from 'child_process'
import glob from 'fast-glob'
import fs from 'fs'
import { readFile } from 'fs/promises'
import { posix as path } from 'path'
import { UploaderArgs } from '../types'
import { info, logError, UploadLogger } from './logger'
import { runExternalProgram } from './util'
// import micromatch from "../vendor/micromatch/index.js";
import { SPAWNPROCESSBUFFERSIZE } from './constants'

export const MARKER_NETWORK_END = '\n<<<<<< network\n'
export const MARKER_FILE_END = '<<<<<< EOF\n'
export const MARKER_ENV_END = '<<<<<< ENV\n'

const globstar = (pattern: string) => `**/${pattern}`

/**
 *
 * @param {string} projectRoot
 * @param {Object} args
 * @returns {Promise<string>}
 */
export async function getFileListing(
  projectRoot: string,
  args: UploaderArgs,
): Promise<string> {
  return getAllFiles(projectRoot, projectRoot, args).join('\n')
}

export function manualBlocklist(): string[] {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    '.DS_Store',
    '.circleci',
    '.git',
    '.gitignore',
    '.nvmrc',
    '.nyc_output',
    'bower_components',
    'jspm_packages',
    'node_modules',
    'vendor',
  ]
}

function globBlocklist(): string[] {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    '__pycache__',
    'node_modules/**/*',
    'vendor',
    '.circleci',
    '.git',
    '.gitignore',
    '.nvmrc',
    '.nyc_output',
    '.tox',
    '*.am',
    '*.bash',
    '*.bat',
    '*.bw',
    '*.cfg',
    '*.class',
    '*.cmake',
    '*.cmake',
    '*.conf',
    '*.coverage',
    '*.cp',
    '*.cpp',
    '*.crt',
    '*.css',
    '*.csv',
    '*.csv',
    '*.data',
    '*.db',
    '*.dox',
    '*.ec',
    '*.ec',
    '*.egg',
    '*.egg-info',
    '*.el',
    '*.env',
    '*.erb',
    '*.exe',
    '*.ftl',
    '*.gif',
    '*.go',
    '*.gradle',
    '*.gz',
    '*.h',
    '*.html',
    '*.in',
    '*.jade',
    '*.jar*',
    '*.jpeg',
    '*.jpg',
    '*.js',
    '*.less',
    '*.log',
    '*.m4',
    '*.mak*',
    '*.map',
    '*.marker',
    '*.md',
    '*.o',
    '*.p12',
    '*.pem',
    '*.png',
    '*.pom*',
    '*.profdata',
    '*.proto',
    '*.ps1',
    '*.pth',
    '*.py',
    '*.pyc',
    '*.pyo',
    '*.rb',
    '*.rsp',
    '*.rst',
    '*.ru',
    '*.sbt',
    '*.scss',
    '*.scss',
    '*.serialized',
    '*.sh',
    '*.snapshot',
    '*.sql',
    '*.svg',
    '*.tar.tz',
    '*.template',
    '*.ts',
    '*.whl',
    '*.xcconfig',
    '*.xcoverage.*',
    '*/classycle/report.xml',
    '*codecov.yml',
    '*~',
    '.*coveragerc',
    '.coverage*',
    'codecov.SHA256SUM',
    'codecov.SHA256SUM.sig',
    'coverage-summary.json',
    'createdFiles.lst',
    'fullLocaleNames.lst',
    'include.lst',
    'inputFiles.lst',
    'phpunit-code-coverage.xml',
    'phpunit-coverage.xml',
    'remapInstanbul.coverage*.json',
    'scoverage.measurements.*',
    'test-result-*-codecoverage.json',
    'test_*_coverage.txt',
    'testrunner-coverage*',
    '*.*js',
    '.yarn',
    '*.zip',
  ]
}

export function coverageFilePatterns(): string[] {
  return [
    '*coverage*.*',
    'nosetests.xml',
    'jacoco*.xml',
    'clover.xml',
    'report.xml',
    '*.codecov.!(exe)',
    'codecov.!(exe)',
    '*cobertura.xml',
    'excoveralls.json',
    'luacov.report.out',
    'coverage-final.json',
    'naxsi.info',
    'lcov.info',
    'lcov.dat',
    '*.lcov',
    '*.clover',
    'cover.out',
    'gcov.info',
    '*.gcov',
    '*.lst',
    'test_cov.xml',
  ]
}

const EMPTY_STRING = '' as const

const isNegated = (path: string) => path.startsWith('!')

/**
 *
 * @param {string} projectRoot
 * @param {string[]} coverageFilePatterns
 * @returns {Promise<string[]>}
 */
export async function getCoverageFiles(
  projectRoot: string,
  coverageFilePatterns: string[],
  followSymbolicLinks: boolean = true,
): Promise<string[]> {
  const globstar = (pattern: string) => `**/${pattern}`

  return glob(coverageFilePatterns.map((pattern: string) => {
    const parts = []

    if (isNegated(pattern)) {
      parts.push('!')
      parts.push(globstar(pattern.substr(1)))
    } else {
      parts.push(globstar(pattern))
    }

    return parts.join(EMPTY_STRING)
  }), {
    cwd: projectRoot,
    dot: true,
    followSymbolicLinks,
    ignore: getBlocklist(),
    suppressErrors: true,
  })
}

export function fetchGitRoot(): string {
  const currentWorkingDirectory = process.cwd()
  try {
    const gitRoot = runExternalProgram('git', ['rev-parse', '--show-toplevel'])
    return (gitRoot != "" ? gitRoot : currentWorkingDirectory)
  } catch (error) {
    info(`Error fetching git root. Defaulting to ${currentWorkingDirectory}. Please try using the -R flag. ${error}`)
    return currentWorkingDirectory
  }
}

/**
 *
 * @param {string} projectRoot Root of the project
 * @param {string} dirPath Directory to search in
 * @param {Object} args
 * @returns {string[]}
 */
export function getAllFiles(
  projectRoot: string,
  dirPath: string,
  args: UploaderArgs,
): string[] {
  UploadLogger.verbose(`Searching for files in ${dirPath}`)

  const { stdout, status, error } = spawnSync(
    'git',
    ['-C', dirPath, 'ls-files'],
    { encoding: 'utf8', maxBuffer: SPAWNPROCESSBUFFERSIZE },
  )

  let files = []
  if (error instanceof Error || status !== 0) {
    files = glob
      .sync(['**/*', '**/.[!.]*'], {
        cwd: dirPath,
        ignore: manualBlocklist().map(globstar),
        suppressErrors: true,
      })
  } else {
    files = stdout.split(/[\r\n]+/)
  }

  if (args.networkFilter) {
    files = files.filter(file => file.startsWith(String(args.networkFilter)))
  }

  if (args.networkPrefix) {
    files = files.map(file => String(args.networkPrefix) + file)
  }

  return files
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns {string}
 */
export async function readCoverageFile(
  projectRoot: string,
  filePath: string,
): Promise<string> {
  return readFile(getFilePath(projectRoot, filePath), {
    encoding: 'utf-8',
  }).catch(err => {
    throw new Error(`There was an error reading the coverage file: ${err}`)
  })
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns boolean
 */
export function fileExists(projectRoot: string, filePath: string): boolean {
  return fs.existsSync(getFilePath(projectRoot, filePath))
}

/**
 *
 * @param {string} filePath
 * @returns string
 */
export function fileHeader(filePath: string): string {
  return `# path=${filePath}\n`
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns {string}
 */
export function getFilePath(projectRoot: string, filePath: string): string {
  if (
    filePath.startsWith('./') ||
    filePath.startsWith('/') ||
    filePath.startsWith('.\\') ||
    filePath.startsWith('.\\') ||
    /^[A-Z]:\\\S*/.test(filePath) // This line is here to handle Windows drive letter absolute paths such as "C:\<path>"
  ) {
    return filePath
  }
  if (projectRoot === '.') {
    return path.join('.', filePath)
  }
  return path.join(projectRoot, filePath)
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 */
export function removeFile(projectRoot: string, filePath: string): void {
  fs.unlink(getFilePath(projectRoot, filePath), err => {
    if (err) {
      logError(`Error removing ${filePath} coverage file`)
    }
  })
}
export function getBlocklist(): string[] {
  return [...manualBlocklist(), ...globBlocklist()].map(globstar)
}

export function filterFilesAgainstBlockList(paths: string[], ignoreGlobs: string[]): string[] {
  return paths
}

export function cleanCoverageFilePaths(projectRoot: string, paths: string[]): string[] {
  UploadLogger.verbose(`Preparing to clean the following coverage paths: ${paths.toString()}`)
  const coverageFilePaths = [... new Set(paths.filter(file => {
    return fileExists(projectRoot, file)
  }))]

  if (coverageFilePaths.length === 0) {
    logError(`None of the following appear to exist as files: ${paths.toString()}`)
    throw new Error('Error while cleaning paths. No paths matched existing files!')
  }

  return coverageFilePaths
}

