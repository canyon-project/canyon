import { Body, Controller, Get, Post, Request } from '@nestjs/common'
import { AppService } from './app.service'
import axios from 'axios'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
