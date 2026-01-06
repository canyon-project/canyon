import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { logger } from './logger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get('vi/health')
  @ApiOperation({ summary: '获取欢迎消' })
  @ApiResponse({ status: 200, description: '返回欢迎消息', type: String })
  getHello(): string {
    logger({
      type: 'info',
      title: '健康检查',
      message: 'vi/health',
      addInfo: {
        hello: 'world',
      },
    });
    return '251025';
  }
}
