import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Public()
@Controller('ping')
export class AppController {
  @Get()
  ping(): string {
    return 'Success';
  }
}
