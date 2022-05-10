import { configLog } from './index'
import * as fs from 'fs'
import * as YAML from 'yaml'

export const prepareInit = () => {
  const conf = fs.readFileSync(
    `./conf/application${
      process.env.CUSTOM_ENV ? process.env.CUSTOM_ENV : ''
    }.yml`,
    'utf8',
  )
  const packageJson = fs.readFileSync(`./package.json`, 'utf8')
  global.version = JSON.parse(packageJson).version
  global.conf = YAML.parse(conf)
  configLog({ type: 'main.ts', info: `当前环境为${process.env.CUSTOM_ENV}` })
  configLog({ type: 'main.ts', info: `当前版本为v${global.version}` })
}
