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
    // return this.coverageService.recalculation(body);
    return {};
  }
}
