import providers from '../ci_providers'
import { info, logError, UploadLogger } from '../helpers/logger'
import { IServiceParams, UploaderInputs } from '../types'

export async function detectProvider(
  inputs: UploaderInputs,
  hasToken = false,
): Promise<Partial<IServiceParams>> {
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
    const serviceParams = await walkProviders(inputs)
    return { ...serviceParams, ...serviceParams }
  } catch (error) {
    //   if fails, display message explaining failure, and explaining that SHA and slug need to be set as args
    if (typeof serviceParams !== 'undefined') {
      logError(`Error detecting repos setting using git: ${error}`)
    } else {
      throw new Error(
        '\nUnable to detect SHA and slug, please specify them manually.\nSee the help for more details.',
      )
    }
  }
  return serviceParams
}

export async function walkProviders(inputs: UploaderInputs): Promise<IServiceParams> {
  for (const provider of providers) {
    if (provider.detect(inputs.envs)) {
      info(`Detected ${provider.getServiceName()} as the CI provider.`)
      UploadLogger.verbose('-> Using the following env variables:')
      for (const envVarName of provider.getEnvVarNames()) {
        UploadLogger.verbose(`     ${envVarName}: ${inputs.envs[envVarName]}`)
      }
      return await provider.getServiceParams(inputs)
    }
  }
  throw new Error(`Unable to detect provider.`)
}

export function setSlug(
  slugArg: string | undefined,
  orgEnv: string | undefined,
  repoEnv: string | undefined,
): string {
  if (typeof slugArg !== "undefined" && slugArg !== '') {
    return slugArg
  }
  if (
    typeof orgEnv !== 'undefined' &&
    typeof repoEnv !== 'undefined' &&
    orgEnv !== '' &&
    repoEnv !== ''
  ) {
    return `${orgEnv}/${repoEnv}`
  }
  return ''
}
