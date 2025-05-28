import { Controller, Get, Query } from '@nestjs/common';
import { CodeService } from './code.service';

@Controller('')
export class CodeController {
  constructor(private readonly sourcecodeService: CodeService) {}
  @Get('api/code')
  getHello(@Query() query): Promise<any> {
    const { repoID, sha, filepath } = query;
    return this.sourcecodeService.getsourcecode(repoID, sha, filepath);
  }
}
