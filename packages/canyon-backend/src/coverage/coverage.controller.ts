import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
// import { AppService } from './app.service';
import { CoverageClientService } from './services/coverage-client.service';
// import { RetrieveCoverageSummaryService } from './services/retrieve-coverage-summary.service';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoverageService } from './services/coverage.service';
// import { query } from 'express';
import { RetrieveCoverageTreeSummaryService } from './services/retrieve-coverage-tree-summary.service';
// import { getSpecificCoverageData } from '../adapter/coverage-data.adapter';
import { join } from 'path';
import { download } from '../utils/download';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumerCoverageService } from './services/consumer-coverage.service';
import { TestCoverage } from './services/test.coverage';
// import axios from 'axios';
// import * as platform from 'platform'
// export function getPlatformInfo(str) {
//   return platform.parse(str)
// }

@Controller()
export class CoverageController {
  constructor(
    private readonly coverageService: CoverageService,
    private readonly coverageClientService: CoverageClientService,
    // private readonly retrieveCoverageSummaryService: RetrieveCoverageSummaryService,
    private readonly retrieveCoverageTreeSummaryService: RetrieveCoverageTreeSummaryService,
    private prisma: PrismaService,
    private consumerCoverageService: ConsumerCoverageService,
    private testCoverage: TestCoverage,
  ) {
    this.consumerCoverageService.invoke();
    // this.testCoverage.invoke();
  }

  @UseGuards(JwtAuthGuard)
  @Post('coverage/client')
  async coverageClient(
    @Body() coverageClientDto: CoverageClientDto,
    @Request() req: any,
  ): Promise<any> {
    // console.log(req.ip);
    // 添加特殊上报逻辑处 (这是标记，勿动！)
    // {{$mpaasSpecial}}添加特殊上报逻辑处 (这是标记，勿动！)
    return this.coverageClientService.invoke(
      req.user.id,
      coverageClientDto,
      req.ip,
    );
  }

  @Get('api/coverage/summary/map')
  async coverageSummary(@Query() query): Promise<any> {
    // return {};
    const { sha, reportID, mode } = query;
    return this.coverageService.getCoverageSummaryMap(sha, reportID, mode);
  }

  @Get('api/coverage/map')
  async coveragemMap(@Query() query): Promise<any> {
    const { sha, reportID, filepath } = query;
    return this.coverageService.getCoverageData(sha, reportID, filepath);
  }

  // 获取概览，重要！！！！！
  @Get('coverage/treesummary')
  async coverageTreeSummary(
    @Query()
    params: {
      reportId?: string;
      report_id?: string;
      reportID?: string;
      commitsha?: string;
      commitSha?: string;
      commit_sha?: string;
      sha?: string;
      projectID?: string;
      branch?: string;
    },
  ) {
    // 同时有projectID和branch时，联查出最新的sha
    if (params.projectID && params.branch) {
      const coverage = await this.prisma.coverage.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          projectID: params.projectID,
          branch: params.branch,
          covType: 'all',
        },
      });
      if (coverage) {
        params.sha = coverage.sha;
      } else {
        params.sha = 'sha_not_found';
      }
    }
    return this.retrieveCoverageTreeSummaryService.invoke({
      reportID: params.reportId || params.report_id || params.reportID || null,
      sha:
        params.sha ||
        params.commitsha ||
        params.commitSha ||
        params.commit_sha ||
        null,
    });
  }

  @Get('coverage/aggstatus')
  listAggStatus(
    @Query()
    params: {
      reportId?: string;
      report_id?: string;
      reportID?: string;
    },
  ) {
    return {
      code: 2,
      msg: '聚合完成',
    };
  }

  // 触发覆盖率聚合方法
  // 传 reportId 和 reporterId 都可以
  @Post('coverage/triggeragg')
  triggeragg(
    @Body()
    params: {
      reportId?: string;
      report_id?: string;
      reportID?: string;
      sha?: string;
    },
  ) {
    return {
      msg: '报告聚合中',
      data: [],
      code: -1,
      reportID: 'reportID',
    };
  }
}
