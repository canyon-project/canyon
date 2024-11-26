import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'


export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.GITHUB_ACTIONS)
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  const branchRegex = /refs\/heads\/(.*)/
  const branchMatches = branchRegex.exec(envs.GITHUB_REF || '')
  let branch
  if (branchMatches) {
    branch = branchMatches[1]
  }

  if (envs.GITHUB_HEAD_REF && envs.GITHUB_HEAD_REF !== '') {
    branch = envs.GITHUB_HEAD_REF
  }
  return args.branch || branch || ''
}

function _getJob(envs: UploaderEnvs): string {
  return (envs.GITHUB_WORKFLOW || '')
}

function _getService(): string {
  return 'github-actions'
}

export function getServiceName(): string {
  return 'GitHub Actions'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.sha || envs.GITHUB_SHA
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  // if (args.slug !== '') return args.slug
  return envs.GITHUB_REPOSITORY_ID || ''
}

export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    // build: _getBuild(inputs),
    // buildURL: await _getBuildURL(inputs),
    commit: _getSHA(inputs),
    // job: _getJob(inputs.envs),
    // pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return [
    'GITHUB_ACTION',
    'GITHUB_HEAD_REF',
    'GITHUB_REF',
    'GITHUB_REPOSITORY_ID',
    'GITHUB_RUN_ID',
    'GITHUB_SERVER_URL',
    'GITHUB_SHA',
    'GITHUB_WORKFLOW',
  ]
}
