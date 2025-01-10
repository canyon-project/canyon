import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('wuya-feiji')
  async accumulate(data: any): Promise<number> {
    console.log('data:', data);
    return 3;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
