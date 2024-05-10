import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { UploaderInputs } from '../types'
import { DEFAULT_UPLOAD_HOST } from './constants'
import { info, logError, UploadLogger } from './logger'
import { validateToken } from './validate'

/**
 *
 * @param {object} inputs
 * @param {string} projectRoot
 * @returns string
 */
export function getToken(inputs: UploaderInputs, projectRoot: string): string {
  const { args, envs } = inputs
  const options = [
    [args.token, 'arguments'],
    [envs.CANYON_TOKEN, 'environment variables'],
    [getTokenFromYaml(projectRoot), 'Canyon yaml config'],
  ]

  for (const [token, source] of options) {
    if (token) {
      info(`->  Token found by ${source}`)
      // If this is self-hosted (-u is set), do not validate
      // This is because self-hosted can use a global upload token
      if (args.url !== DEFAULT_UPLOAD_HOST) {
        UploadLogger.verbose('Self-hosted install detected due to -u flag')
        info(`->  Token set by ${source}`)
        return token
      }
      if (validateToken(token) !== true) {
        throw new Error(
          `Token found by ${source} with length ${token?.length} did not pass validation`,
        )
      }

      return token
    }
  }

  return ''
}

interface ICanyonYAML {
  canyon?: {
    token?: string
  }
  canyon_token?: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
function yamlParse(input: object | string | number): ICanyonYAML {
  let yaml: ICanyonYAML
  if (typeof input === 'string') {
    yaml = JSON.parse(input)
  } else if (typeof input === 'number') {
    yaml = JSON.parse(input.toString())
  } else {
    yaml = input
  }
  return yaml
}

export function getTokenFromYaml(
  projectRoot: string,
): string {
  const dirNames = ['', '.github', 'dev']

  const yamlNames = [
    '.canyon.yaml',
    '.canyon.yml',
    'canyon.yaml',
    'canyon.yml',
  ]

  for (const dir of dirNames) {
    for (const name of yamlNames) {
      const filePath = path.join(projectRoot, dir, name)

      try {
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, {
            encoding: 'utf-8',
          })
          const yamlConfig: ICanyonYAML = yamlParse(
            new Object(yaml.load(fileContents, { json: true }) || {},
          ))
          if (
            yamlConfig['canyon'] &&
            yamlConfig['canyon']['token'] &&
            validateToken(yamlConfig['canyon']['token'])
          ) {
            return yamlConfig['canyon']['token']
          }

          if (yamlConfig['canyon_token']) {
            logError(
              `'canyon_token' is a deprecated field. Please switch to 'canyon.token' ` +
                '',
            )
          }
        }
      } catch (err) {
        UploadLogger.verbose(`Error searching for upload token in ${filePath}: ${err}`)
      }
    }
  }
  return ''
}
