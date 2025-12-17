import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '获取欢迎消息' })
  @ApiResponse({ status: 200, description: '返回欢迎消息', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
