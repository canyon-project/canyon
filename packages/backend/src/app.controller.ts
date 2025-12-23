import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('vi/health')
  @ApiOperation({ summary: '获取欢迎消' })
  @ApiResponse({ status: 200, description: '返回欢迎消息', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
