import { parseSlugFromRemoteAddr } from '../helpers/git'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.JENKINS_URL)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.BUILD_NUMBER || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { envs } = inputs
  return envs.BUILD_URL ? (envs.BUILD_URL) : ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return (
    args.branch ||
    envs.ghprbSourceBranch ||
    envs.CHANGE_BRANCH ||
    envs.GIT_BRANCH ||
    envs.BRANCH_NAME ||
    ''
  )
}

function _getJob() {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.pr || envs.ghprbPullId || envs.CHANGE_ID || ''
}

function _getService(): string {
  return 'jenkins'
}

export function getServiceName(): string {
  return 'Jenkins CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  // Note that the value of GIT_COMMIT may not be accurate if Jenkins
  // is merging `master` in to the working branch first. In these cases
  // there is no envvar representing the actual submitted commit
  return args.sha || envs.ghprbActualCommit || envs.GIT_COMMIT || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args } = inputs
  if (args.slug !== '') return args.slug
  return parseSlugFromRemoteAddr('') || ''
}

export async function getServiceParams(inputs: UploaderInputs): Promise<IServiceParams> {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return [
    'BRANCH_NAME',
    'BUILD_NUMBER',
    'BUILD_URL',
    'CHANGE_ID',
    'GIT_BRANCH',
    'GIT_COMMIT',
    'JENKINS_URL',
    'ghprbActualCommit',
    'ghprbPullId',
    'ghprbSourceBranch',
  ]
}
