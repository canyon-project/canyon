import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get('api/base')
  getHello() {
    return {};
  }

  @Get('vi/health')
  health() {
    return '10ms';
  }
}
