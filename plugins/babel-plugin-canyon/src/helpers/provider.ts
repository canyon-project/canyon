import providers from '../ci_providers'
import { info, logError, UploadLogger } from '../helpers/logger'
import { IServiceParams, UploaderInputs } from '../types'

export function detectProvider(
  inputs: UploaderInputs,
  hasToken = false,
): Partial<IServiceParams> {
  const { args } = inputs
  let serviceParams: Partial<IServiceParams> | undefined

  //   check if we have a complete set of manual overrides (slug, SHA)
  if (args.sha && (args.slug || hasToken)) {
    // We have the needed args for a manual override
    info(`Using manual override from args.`)
    serviceParams = {
      commit: args.sha,
      ...(hasToken ? {} : { slug: args.slug }),
    }
  } else {
    serviceParams = undefined
  }

  //   loop though all providers
  try {
    const serviceParams = walkProviders(inputs)
    return { ...serviceParams, ...serviceParams }
  } catch (error) {
    //   if fails, display message explaining failure, and explaining that SHA and slug need to be set as args
    if (typeof serviceParams !== 'undefined') {
      logError(`Error detecting repos setting using git: ${error}`)
    } else {
      // throw new Error(
      //   '\nUnable to detect SHA and slug, please specify them manually.\nSee the help for more details.',
      // )
    }
  }
  return serviceParams
}

export function walkProviders(inputs: UploaderInputs): IServiceParams {
  for (const provider of providers) {
    if (provider.detect(inputs.envs)) {
      info(`Detected ${provider.getServiceName()} as the CI provider.`)
      UploadLogger.verbose('-> Using the following env variables:')
      for (const envVarName of provider.getEnvVarNames()) {
        UploadLogger.verbose(`     ${envVarName}: ${inputs.envs[envVarName]}`)
      }
      return provider.getServiceParams(inputs)
    }
  }
  // 返回默认值
  return {
    slug: '-',
    commit: '-',
    service: '-',
    branch: '-',
    // instrumentCwd: '-',
    // branch: '-',
  }
  // throw new Error(`Unable to detect provider.`)
}
