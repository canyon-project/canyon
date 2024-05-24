import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoverageTestService } from './services/coverage-test.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { jacocoXml2Json } from '../utils/jacoco';
import { compressedData } from '../utils/zstd';

@Controller()
export class CoverageTestController {
  constructor(
    private readonly coverageTestService: CoverageTestService,
    private prisma: PrismaService,
  ) {}

  @Post('api/coverage/uploadjacoco')
  @UseInterceptors(FileInterceptor('file'))
  async uploadjacoco(@UploadedFile() file, @Body() body): Promise<any> {
    const coverage = await jacocoXml2Json(file.buffer.toString()).then((data) =>
      compressedData(JSON.stringify(data)),
    );
    return this.coverageTestService.create({
      projectID: body.projectID,
      sha: body.sha,
      coverage: coverage,
    });
  }

  @Get('api/coverage/uploadjacoco')
  async getjacoco(@Query() body): Promise<any> {
    return this.coverageTestService.find({
      projectID: body.projectID,
      sha: body.sha,
    });
  }
}
