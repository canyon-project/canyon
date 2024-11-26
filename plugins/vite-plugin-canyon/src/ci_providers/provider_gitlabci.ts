import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

// import { parseSlugFromRemoteAddr } from '../helpers/git'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.GITLAB_CI)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.CI_BUILD_ID || envs.CI_JOB_ID || ''
}

function _getBuildURL(): string {
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.branch || envs.CI_BUILD_REF_NAME || envs.CI_COMMIT_REF_NAME || ''
}

function _getJob(): string {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.pr || ''
}

function _getService(): string {
  return 'gitlab'
}

export function getServiceName(): string {
  return 'GitLab CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.sha || envs.CI_MERGE_REQUEST_SOURCE_BRANCH_SHA || envs.CI_BUILD_REF || envs.CI_COMMIT_SHA || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  // if (args.slug !== '') return args.slug
  // const remoteAddr = envs.CI_BUILD_REPO || envs.CI_REPOSITORY_URL || ''
  // return (
  //   envs.CI_PROJECT_ID
  //   // remoteAddr||
  //   // envs.CI_PROJECT_ID ||
  //   // parseSlugFromRemoteAddr(remoteAddr) ||
  //   // ''
  // )
  return envs.CI_PROJECT_ID
}

export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    // build: _getBuild(inputs),
    // buildURL: _getBuildURL(),
    commit: _getSHA(inputs),
    // job: _getJob(),
    // pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return [
    'CI_BUILD_ID',
    'CI_BUILD_REF',
    'CI_BUILD_REF_NAME',
    'CI_BUILD_REPO',
    'CI_COMMIT_REF_NAME',
    'CI_COMMIT_SHA',
    'CI_JOB_ID',
    'CI_MERGE_REQUEST_SOURCE_BRANCH_SHA',
    'CI_PROJECT_PATH',
    'CI_REPOSITORY_URL',
    'GITLAB_CI',
  ]
}
