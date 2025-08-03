import { Controller, Get, Query } from '@nestjs/common';
import { CodeService } from './code.service';

@Controller('api/code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}
  @Get()
  getHello(@Query() query): Promise<any> {
    const { repoID, sha, filepath } = query;
    return this.codeService.getCode(repoID, sha, filepath);
  }
}
