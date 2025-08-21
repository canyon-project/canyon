import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { registry } from '../metrics';

@Controller({ path: '', version: undefined })
export class RootController {
  @Get('/metrics')
  async metrics(@Res() res: Response) {
    res.setHeader('Content-Type', registry.contentType);
    const body = await registry.metrics();
    res.send(body);
  }
}
