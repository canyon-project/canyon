import { Controller, Get, Query } from '@nestjs/common';
import { SourcecodeService } from './sourcecode.service';

@Controller('')
export class SourcecodeController {
  constructor(private readonly sourcecodeService: SourcecodeService) {}
  @Get('api/sourcecode')
  getHello(@Query() query): Promise<any> {
    const { repoID, sha, filepath } = query;
    return this.sourcecodeService.getsourcecode(repoID, sha, filepath);
  }
}
