import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(
    reporter: string,
    {
      sha,
      projectID,
      coverage,
      instrumentCwd,
      reportID, // 可选
      branch, // 可选
      compareTarget, //可选
      buildID, // 可选
      buildProvider, // 可选
      reportProvider, // 可选
      tags, // 可选
    }: CoverageClientDto,
  ) {
    // 0. 异步日志

    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }
}
