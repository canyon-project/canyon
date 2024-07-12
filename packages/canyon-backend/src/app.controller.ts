import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/vi/health')
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/api/base')
  async base() {
    return {
      SYSTEM_QUESTION_LINK: process.env.SYSTEM_QUESTION_LINK,
      GITLAB_URL: process.env.GITLAB_URL,
      GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
    };
  }
}
