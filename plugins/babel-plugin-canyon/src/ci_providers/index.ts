import { IProvider } from '../types'

import * as providerGitHubactions from './provider_githubactions'
import * as providerGitLabci from './provider_gitlabci'
import * as providerVercel from './provider_vercel'

const providerList: IProvider[] = [
  providerGitHubactions,
  providerGitLabci,
  providerVercel
]

export default providerList
