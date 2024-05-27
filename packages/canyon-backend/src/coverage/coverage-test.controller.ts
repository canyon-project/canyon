import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CoverageTestService } from './services/coverage-test.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { jacocoXml2Json } from '../utils/jacoco';

@Controller()
export class CoverageTestController {
  constructor(private readonly coverageTestService: CoverageTestService) {}

  @Get('api/coverage/jacoco')
  async coverageJacoco(@Query() body): Promise<any> {
    return this.coverageTestService.find({
      projectID: body.projectID,
      sha: body.sha,
    });
  }

  @Post('coverage/client/jacoco')
  @UseInterceptors(FileInterceptor('file'))
  async coverageClientJacoco(@UploadedFile() file, @Body() body): Promise<any> {
    const coverage = await jacocoXml2Json(body.file || file.buffer.toString());
    return this.coverageTestService.create({
      projectID: body.projectID,
      sha: body.commitSha,
      coverage: coverage,
      branch: body.branch,
    });
  }
}
