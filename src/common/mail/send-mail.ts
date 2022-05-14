import axios from 'axios'
import { test123, test321 } from './template'

// console.log(global.conf,'global.conf')

const { mail } = global.conf

export function sendSignUp({ receivers, bodyContentParams }) {
  return axios.post(mail.url, {
    appId: mail.appId,
    sender: mail.sender,
    receivers: receivers,
    cclist: [],
    bcclist: [],
    subject: `您的Canyon密码是 ${bodyContentParams.code}`,
    bodyContent: test123(bodyContentParams),
  })
}

export function sendPassword({ receivers, bodyContentParams }) {
  return axios.post(mail.url, {
    appId: mail.appId,
    sender: mail.sender,
    receivers: receivers,
    cclist: [],
    bcclist: [],
    subject: `您的Canyon密码是 ${bodyContentParams.code}`,
    bodyContent: test321(bodyContentParams),
  })
}
