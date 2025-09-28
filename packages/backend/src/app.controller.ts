import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('vi/health')
  getHello(): string {
    return '230614';
  }
}
