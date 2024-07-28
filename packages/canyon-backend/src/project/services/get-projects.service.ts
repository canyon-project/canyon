import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { removeNullKeys, within30days } from "../../utils/utils";
import * as dayjs from "dayjs";
@Injectable()
export class GetProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(
    userID,
    current,
    pageSize,
    keyword,
    lang,
    bu,
    field,
    order,
    favorOnly,
  ): Promise<any> {
    const favorProjects = await this.prisma.user
      .findUnique({
        where: {
          id: userID,
        },
      })
      .then((r) => r.favor.split(",").filter((item) => item !== ""));
    // 2.根据项目ID再查询到对应的项目信息，使用promise.all
    const whereCondition: any = {
      OR: [
        {
          pathWithNamespace: {
            contains: keyword,
            mode: "insensitive", // Ignore case sensitivity
          },
        },
        {
          id: {
            contains: keyword,
            mode: "insensitive", // Ignore case sensitivity
          },
        },
      ],
    };

    if (bu.length > 0) {
      whereCondition.bu = {
        in: bu,
      };
    }
    if (lang.length > 0) {
      whereCondition.language = {
        in: lang,
      };
    }
    const pro = await this.prisma.project.findMany({
      where: whereCondition,
      select: {
        id: true,
        pathWithNamespace: true,
        description: true,
        bu: true,
        language: true,
      },
    });
    const cov = await this.prisma.coverage.findMany({
      where: {
        covType: "all",
        projectID: {
          in: pro.map(({ id }) => id),
        },
      },
      select: {
        projectID: true,
        // project: true,
        sha: true,
        // branch: true,
        // report: true,
        createdAt: true,
        updatedAt: true,
        summary: true,
      },
    });

    const rows = await Promise.all([cov, pro]).then((res) => {
      const reslut = [];
      const pros = res[1];
      for (let i = 0; i < pros.length; i++) {
        const {
          id,
          pathWithNamespace,
          description,
          bu: _bu,
          language,
        } = pros[i];
        const covs = res[0].filter((item) => {
          return item.projectID === id;
        });
        if ((favorOnly && favorProjects.includes(id)) || !favorOnly) {
          reslut.push({
            favored: favorProjects.includes(id),
            id: id,
            bu: _bu,
            description: description,
            lastReportTime:
              covs.length > 0
                ? covs.sort((a, b) =>
                    dayjs(b.updatedAt).isBefore(a.updatedAt) ? -1 : 1,
                  )[0].updatedAt
                : new Date("1970-01-01T00:00:00Z"),
            maxCoverage:
              covs.filter((item) => within30days(item.updatedAt)).length > 0
                ? Math.max(
                    ...covs
                      .filter((item) => within30days(item.updatedAt))
                      .map((item) => item.summary["statements"]["pct"]),
                  )
                : 0,
            reportTimes: covs.length,
            pathWithNamespace: pathWithNamespace,
            language: language,
          });
        }
      }
      field = field || "lastReportTime";
      return reslut.sort((a, b) => {
        if (field === "lastReportTime") {
          return order === "ascend"
            ? dayjs(a.lastReportTime).isBefore(b.lastReportTime)
              ? -1
              : 1
            : dayjs(a.lastReportTime).isBefore(b.lastReportTime)
              ? 1
              : -1;
        } else if (field === "maxCoverage") {
          return order === "ascend"
            ? a.maxCoverage - b.maxCoverage
            : b.maxCoverage - a.maxCoverage;
        } else if (field === "reportTimes") {
          return order === "ascend"
            ? a.reportTimes - b.reportTimes
            : b.reportTimes - a.reportTimes;
        }
      });
    });
    return {
      data: rows,
      total: rows.length,
    };
  }
}
