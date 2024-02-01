import { ProxyAgent } from 'undici';
import { UploaderArgs, UploaderEnvs } from '../types.js';
import { logError } from './logger'

export function getBasicAuthToken(username: string, password: string): string {
  const authString = Buffer.from(`${username}:${password}`).toString('base64')
  return `Basic ${authString}`
}

export function removeUrlAuth(url: string | URL): string {
  const noAuthUrl = new URL(url)
  noAuthUrl.username = ''
  noAuthUrl.password = ''
  return noAuthUrl.href
}

export function addProxyIfNeeded(envs: UploaderEnvs, args: UploaderArgs): ProxyAgent | undefined {
  if (!args.upstream) {
    return undefined
  }

  // https://github.com/nodejs/undici/blob/main/docs/api/ProxyAgent.md#example---basic-proxy-request-with-authentication
  try {
    const proxyUrl = new URL(args.upstream)
    if (proxyUrl.username && proxyUrl.password) {
      return new ProxyAgent({
        uri: removeUrlAuth(proxyUrl),
        token: getBasicAuthToken(proxyUrl.username, proxyUrl.password),
      })
    }
    return new ProxyAgent({ uri: args.upstream })
  } catch (err) {
    logError(`Couldn't set upstream proxy: ${err}`)
  }

  return undefined
}
