import axios from 'axios'
import { HttpException, HttpStatus } from '@nestjs/common'

// 创建 axios 实例
const service: any = axios.create({
  timeout: 20000, // 请求超时时间
})

const err = (error: any) => {
  if (error.response) {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use((config) => {
  return config
}, err)

// response interceptor
service.interceptors.response.use((response) => {
  const { status: code, data, statusText: msg } = response
  return data
}, err)

export default service
