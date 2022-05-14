import { Body, Controller, Get, Post, Request } from '@nestjs/common'
import { AppService } from './app.service'
import axios from 'axios'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/vi/health')
  getHello(): string {
    return '365ms'
  }
  @Get('/base')
  getBaseInfo(): any {
    const {
      clientId: thAppClientId,
      redirectUri: thAppRedirectUri,
      uri: thAppUri,
    } = global.conf.gitlab.application
    return {
      thAppType: 'gitlab',
      thAppClientId,
      thAppRedirectUri,
      thAppUri,
    }
  }
}
