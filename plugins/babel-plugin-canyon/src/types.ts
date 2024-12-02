// import { Dispatcher, ProxyAgent } from "undici";

export interface UploaderArgs {
  branch?: string // Specify the branch manually
  build?: string // Specify the build number manually
  changelog?: string // Displays the changelog and exits
  clean?: string // Move discovered coverage reports to the trash
  dir?: string // Directory to search for coverage reports.
  dryRun?: string // Don't upload files to Codecov
  env?: string // Specify environment variables to be included with this build
  feature?: string // Toggle features
  file?: string | string[] // Target file(s) to upload
  flags: string | string[] // Flag the upload to group coverage metrics
  fullReport?: string // Specify the path to a previously uploaded Codecov report
  gcov?: string // Run with gcov support
  gcovArgs?: string | string[] // Extra arguments to pass to gcov
  gcovIgnore?: string | string[] // Paths to ignore during gcov gathering
  gcovInclude?: string | string[] // Paths to include during gcov gathering
  gcovExecutable?: string // gcov executable to run.
  name?: string // Custom defined name of the upload. Visible in Codecov UI
  networkFilter?: string // Specify a prefix on the files listed in the network section of the Codecov report. Useful for upload-specific path fixing
  networkPrefix?: string // Specify a prefix on files listed in the network section of the Codecov report. Useful to help resolve path fixing
  nonZero?: string // Should errors exit with a non-zero (default: false)
  parent?: string // The commit SHA of the parent for which you are uploading coverage.
  pr?: string // Specify the pull request number manually
  preventSymbolicLinks?: string // Specifies whether to prevent following of symoblic links
  rootDir?: string // Specify the project root directory when not in a git repo
  sha?: string // Specify the commit SHA manually
  slug: string // Specify the slug manually
  source?: string // Track wrappers of the uploader
  swift?: string // Run with swift support
  swiftProject?: string // Specify the swift project
  tag?: string // Specify the git tag
  token?: string // Codecov upload token
  upstream: string // Upstream proxy to connect to
  url?: string // Change the upload host (Enterprise use)
  useCwd?: boolean
  verbose?: string // Run with verbose logging
  xcode?: string // Run with xcode support
  xcodeArchivePath?: string // Specify the xcode archive path. Likely specified as the -resultBundlePath and should end in .xcresult
  projectID?: string // Specify the project ID manually
}

export type UploaderEnvs = NodeJS.Dict<string>

export interface UploaderInputs {
  envs: UploaderEnvs
  args: UploaderArgs
}

export interface IProvider {
  detect: (arg0: UploaderEnvs) => boolean
  getServiceName: () => string
  getServiceParams: (arg0: UploaderInputs) => IServiceParams
  getEnvVarNames: () => string[]
}

export interface IServiceParams {
  branch: string
  // build: string
  // buildURL: string
  commit: string
  // job: string
  // pr: string | ''
  service: string
  slug: string
  // name?: string
  // tag?: string
  // flags?: string
  // parent?: string
  // project?: string
  // server_uri?: string
}

// export interface IRequestHeaders {
//   agent?: ProxyAgent
//   url: URL
//   options: Dispatcher.RequestOptions
// }

export interface PostResults {
  putURL: URL
  resultURL: URL
}

export interface PutResults {
  status: string
  resultURL: URL
}

export type XcodeCoverageFileReport = Record<string, string | null>
export type XcodeCoverageReport = Record<string, XcodeCoverageFileReport>
