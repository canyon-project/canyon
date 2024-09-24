import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as v8 from 'v8';
function test(a, b) {
  if (a > b) {
    return a + b;
  } else {
    return a - b;
  }
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    test(1, 2);
    v8.takeCoverage();
    v8.stopCoverage();
    return this.appService.getHello();
  }
}
