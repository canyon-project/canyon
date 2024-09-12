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
import { undefined } from "zod";

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
    return this.coverageClientService.invoke(req.user.id, coverageClientDto);
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
