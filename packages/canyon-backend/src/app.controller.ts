import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}
  @Get("vi/health")
  async viHealth() {
    return "230614";
  }

  @Get("/api/gitprovider")
  gitprovider() {
    return this.prisma.gitProvider.findMany({
      where: {},
    });
  }

  @Get("/api/base")
  async base() {
    return {
      SYSTEM_QUESTION_LINK: process.env.SYSTEM_QUESTION_LINK,
      GITLAB_URL: process.env.GITLAB_URL,
      GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
    };
  }

  @Get("/api/monthly-coverage-trend")
  async monthlyCoverageTrend() {
    return [
      {
        month: 0,
        year: 2024,
        uiTestBranchCoverage: 50.59,
        uiTestLineCoverage: 66.08,
        uiTestChangedLineCoverage: 100.0,
        utBranchCoverage: 64.96,
        utLineCoverage: 62.56,
      },
      {
        month: 1,
        year: 2024,
        uiTestBranchCoverage: 51.45,
        uiTestLineCoverage: 67.18,
        uiTestChangedLineCoverage: 93.76,
        utBranchCoverage: 64.74,
        utLineCoverage: 64.0,
      },
      {
        month: 2,
        year: 2024,
        uiTestBranchCoverage: 50.05,
        uiTestLineCoverage: 64.81,
        uiTestChangedLineCoverage: 93.95,
        utBranchCoverage: 64.68,
        utLineCoverage: 64.38,
      },
      {
        month: 3,
        year: 2024,
        uiTestBranchCoverage: 55.15,
        uiTestLineCoverage: 68.7,
        uiTestChangedLineCoverage: 95.49,
        utBranchCoverage: 64.62,
        utLineCoverage: 65.61,
      },
      {
        month: 4,
        year: 2024,
        uiTestBranchCoverage: 57.84,
        uiTestLineCoverage: 71.82,
        uiTestChangedLineCoverage: 95.1,
        utBranchCoverage: 64.69,
        utLineCoverage: 66.15,
      },
      {
        month: 5,
        year: 2024,
        uiTestBranchCoverage: 62.84,
        uiTestLineCoverage: 76.37,
        uiTestChangedLineCoverage: 96.13,
        utBranchCoverage: 65.21,
        utLineCoverage: 68.91,
      },
      {
        month: 6,
        year: 2024,
        uiTestBranchCoverage: 63.22,
        uiTestLineCoverage: 77.66,
        uiTestChangedLineCoverage: 95.35,
        utBranchCoverage: 66.81,
        utLineCoverage: 69.34,
      },
    ];
  }
}
