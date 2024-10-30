import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CoverageClientService } from "./services/coverage-client.service";
import { CoverageClientDto } from "./dto/coverage-client.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CoverageService } from "./services/coverage.service";
import { PrismaService } from "../prisma/prisma.service";
import { CoverageReportsService } from "./services/coverage-reports.service";
import { ConsumerCoverageService } from "./services/core/consumer-coverage.service";
import {HtmlBody} from "../html-body.decorator";

@Controller()
export class CoverageController {
  constructor(
    private readonly coverageService: CoverageService,
    private readonly coverageReportsService: CoverageReportsService,

    private readonly coverageClientService: CoverageClientService,
    private prisma: PrismaService,
    private consumerCoverageService: ConsumerCoverageService,
  ) {
    this.consumerCoverageService.invoke();
  }

  @UseGuards(JwtAuthGuard)
  @Post("coverage/client")
  async coverageClient(
    @Body() coverageClientDto: CoverageClientDto,
    @Request() req: any,
  ): Promise<any> {
    const userAgent = req.headers["user-agent"]; // 获取 User-Agent
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress; // 获取 IP 地址

    return this.coverageClientService.invoke(
      req.user.id,
      coverageClientDto,
      ip,
      userAgent,
    );
  }

  // 测试navigator.sendBeacon
  @Post("api/coverage/collect")
  async coverageCollect(@HtmlBody() data: string) {
    try {
      const coverageClientDto = JSON.parse(data);
      return await this.prisma.coverageLog.create({
        data:{
          projectID: coverageClientDto.projectID,
          sha: coverageClientDto.sha,
          reportID: coverageClientDto.reportID||"",
          size: JSON.stringify(coverageClientDto.coverage).length||0,
          createdAt: new Date(),
          coverage: "",
          tags: coverageClientDto.tags||'', //key、value的数组，需要zod校验强类型
          ip: '999999999',
          userAgent: '',
          instrumentCwd: coverageClientDto.instrumentCwd||'',
        }
      })
    } catch (e) {
      return {
        success: false,
      }
    }
  }

  @Get("api/coverage/summary/map")
  async coverageSummary(@Query() query): Promise<any> {
    const { projectID, sha, reportID } = query;
    return this.coverageService.getCoverageSummaryMap(projectID, sha, reportID);
  }

  @Get("api/coverage/map")
  async coverageMap(@Query() query): Promise<any> {
    const { projectID, sha, reportID, filepath } = query;
    return this.coverageService.getCoverageData(
      projectID,
      sha,
      reportID,
      filepath,
    );
  }

  @Get("api/coverage/reports")
  async coverageReports(@Query() query): Promise<any> {
    const { bu, start, end } = query;
    return this.coverageReportsService.invoke({ bu, start, end });
  }

  // /api/coverage
  @Post("api/coverage/recalculation")
  async recalculation(@Body() body): Promise<any> {
    console.log(body);
    const pros = await this.prisma.project.findMany({
      where: {
        bu: "商旅",
      },
    });

    const coverages = await this.prisma.coverage.findMany({
      where: {
        projectID: {
          in: pros.map((item) => item.id),
        },
        covType: "agg",
        updatedAt: {
          gte: new Date("2024-09-09"),
        },
      },
      select: {
        branch: true,
        buildID: true,
        buildProvider: true,
        compareTarget: true,
        projectID: true,
        reporter: true,
        sha: true,
        reportID: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    // for (let i = 0; i < coverages.length; i++) {
    //   const cov = coverages[i];
    //   await this.coverageClientService.invoke(cov.reporter, {
    //     branch: cov.branch,
    //     buildID: cov.buildID,
    //     buildProvider: cov.buildProvider,
    //     compareTarget: cov.compareTarget,
    //     key: "",
    //     tags: undefined,
    //     coverage: {},
    //     projectID: cov.projectID,
    //     instrumentCwd: "/builds",
    //     sha: cov.sha,
    //     reportID: cov.reportID,
    //     updatedAt: cov.updatedAt,
    //     createdAt: cov.createdAt,
    //   });
    // }

    return {
      len: coverages.length,
    };
  }
}
