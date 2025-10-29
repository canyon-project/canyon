import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  @Get('vi/health')
  getHello() {
    return '251025';
  }
}
