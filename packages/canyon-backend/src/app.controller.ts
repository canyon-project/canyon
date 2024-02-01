import { Body, Controller, Get, Post, Request } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('vi/health')
  viHealth() {
    return '230614ms';
  }

  @Get('/api/base')
  base(): any {
    return {
      SYSTEM_QUESTION_LINK: process.env.SYSTEM_QUESTION_LINK,
      GITLAB_URL: process.env.GITLAB_URL,
      GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
    };
  }
}
