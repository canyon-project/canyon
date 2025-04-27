import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/base')
  getHello() {
    return this.appService.getHello();
  }

  @Get('vi/health')
  health() {
    return '10ms';
  }

  @Get('sss')
  getHello123() {
    return this.appService.getHello();
  }
}
