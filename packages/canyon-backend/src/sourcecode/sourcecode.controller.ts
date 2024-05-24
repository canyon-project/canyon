import { Controller, Get, Query } from '@nestjs/common';
import { SourcecodeService } from './sourcecode.service';

@Controller('')
export class SourcecodeController {
  constructor(private readonly sourcecodeService: SourcecodeService) {}
  @Get('api/sourcecode')
  getHello(@Query() query): Promise<any> {
    const { projectID, sha, filepath, mode } = query;
    return this.sourcecodeService.getsourcecode(projectID, sha, filepath, mode);
  }
}
