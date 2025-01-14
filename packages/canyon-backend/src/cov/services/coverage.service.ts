import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CoverageSummaryDataMap } from "canyon-data";
import { decompressedData } from "canyon-map";

// 马上废弃，勿动
@Injectable()
export class CoverageService {
  constructor(private readonly prisma: PrismaService) {}

  async coverageSummaryMap(projectID, sha: string, reportID: string) {
    const coverage = await this.prisma.coverage.findFirst({
      where: {
        sha: sha || undefined,
        projectID: projectID || undefined,
        reportID: reportID || undefined,
        covType: reportID ? "agg" : "all",
      },
    });

    if (coverage?.summary) {
      return decompressedData<CoverageSummaryDataMap>(coverage.summary).then(
        (data) => {
          return Object.entries(data).map(([key, value]) => {
            return {
              ...value,
              path: key,
            };
          });
        },
      );
    }
    throw new HttpException(
      {
        statusCode: 404,
        message: "summary data not found",
        errorCode: "SUMMARY_DATA_NOT_FOUND",
      },
      404,
    );
  }
}
