import { IProvider } from '../types'

import * as providerGitLabci from './provider_gitlabci'
import * as providerJenkinsci from './provider_jenkinsci'
import * as providerLocal from './provider_local'

// Please make sure provider_local is last
const providerList: IProvider[] = [
  providerGitLabci,
  providerJenkinsci,
  providerLocal,
]

export default providerList
