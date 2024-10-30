import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { convertSystemSettingsFromTheDatabase } from "./utils/sys";

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
    const { gitlabServer, gitlabClientID, docsLink, canyonServer } =
      await this.prisma.sysSetting
        .findMany({})
        .then((res) => convertSystemSettingsFromTheDatabase(res));
    return {
      SYSTEM_QUESTION_LINK: docsLink,
      GITLAB_URL: gitlabServer,
      GITLAB_CLIENT_ID: gitlabClientID,
      CANYON_SERVER: canyonServer,
    };
  }

  @Get("/api/monthly-coverage-trend")
  async monthlyCoverageTrend() {
    // const projects = await this.prisma.project.findMany({
    //   where: {
    //     tags: {
    //       array_contains: [
    //         {
    //           name: "Auto Statistic",
    //         },
    //       ],
    //     },
    //   },
    // });
    // const ids = projects.map((item) => item.id.split("-")[1]);
    //
    // const codechanges = await this.prisma.codechange.findMany({
    //   where: {
    //     projectID: {
    //       in: ids,
    //     },
    //     createdAt: {
    //       gte: new Date("2024-08-01"),
    //       lte: new Date("2024-09-01"),
    //     },
    //   },
    // });
    //
    // let num = 0;
    // codechanges.forEach((item) => {
    //   num += item.additions.length + item.deletions.length;
    // });

    return [
      {
        month: 0,
        year: 2024,
        uiTestBranchCoverage: 50.59,
        uiTestLineCoverage: 56.08,
        uiTestChangedLineCoverage: 100.0,
        utBranchCoverage: 64.96,
        utLineCoverage: 62.56,
        codeChangeNum: 0,
      },
      {
        month: 1,
        year: 2024,
        uiTestBranchCoverage: 51.45,
        uiTestLineCoverage: 59.19,
        uiTestChangedLineCoverage: 93.76,
        utBranchCoverage: 64.74,
        utLineCoverage: 64.0,
        codeChangeNum: 0,
      },
      {
        month: 2,
        year: 2024,
        uiTestBranchCoverage: 50.05,
        uiTestLineCoverage: 63.23,
        uiTestChangedLineCoverage: 93.95,
        utBranchCoverage: 64.68,
        utLineCoverage: 64.38,
        codeChangeNum: 0,
      },
      {
        month: 3,
        year: 2024,
        uiTestBranchCoverage: 55.15,
        uiTestLineCoverage: 66.47,
        uiTestChangedLineCoverage: 95.49,
        utBranchCoverage: 64.62,
        utLineCoverage: 65.61,
        codeChangeNum: 0,
      },
      {
        month: 4,
        year: 2024,
        uiTestBranchCoverage: 57.84,
        uiTestLineCoverage: 71.61,
        uiTestChangedLineCoverage: 95.1,
        utBranchCoverage: 64.69,
        utLineCoverage: 66.15,
        codeChangeNum: 0,
      },
      {
        month: 5,
        year: 2024,
        uiTestBranchCoverage: 62.84,
        uiTestLineCoverage: 77.23,
        uiTestChangedLineCoverage: 96.13,
        utBranchCoverage: 65.21,
        utLineCoverage: 68.91,
        codeChangeNum: 730591,
      },
      {
        month: 6,
        year: 2024,
        uiTestBranchCoverage: 63.22,
        uiTestLineCoverage: 77.66,
        uiTestChangedLineCoverage: 95.35,
        utBranchCoverage: 66.81,
        utLineCoverage: 69.34,
        codeChangeNum: 988195,
      },
      {
        month: 7,
        year: 2024,
        uiTestBranchCoverage: 63.43,
        uiTestLineCoverage: 77.92,
        uiTestChangedLineCoverage: 95.61,
        utBranchCoverage: 67.1,
        utLineCoverage: 69.83,
        codeChangeNum: 940460,
      },
      {
        month: 8,
        year: 2024,
        uiTestBranchCoverage: 63.5,
        uiTestLineCoverage: 78.11,
        uiTestChangedLineCoverage: 95.33,
        utBranchCoverage: 67.9,
        utLineCoverage: 70.21,
        codeChangeNum: 951122,
      },
      {
        month: 9,
        year: 2024,
        uiTestBranchCoverage: 63.35,
        uiTestLineCoverage: 77.91,
        uiTestChangedLineCoverage: 95.31,
        utBranchCoverage: 67.68,
        utLineCoverage: 69.97,
        codeChangeNum: 935567,
      },
    ];
  }
}
