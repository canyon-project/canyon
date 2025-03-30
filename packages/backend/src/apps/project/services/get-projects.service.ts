import { Injectable } from "@nestjs/common";
// import { PrismaService } from "../../prisma/prisma.service";
// import { within30days } from "../../utils/utils";
import { percent } from "canyon-data";
import * as dayjs from "dayjs";
import {PrismaService} from "../../../prisma/prisma.service";
// import {within30days} from "../../../utils/utils";

@Injectable()
export class GetProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(
    {    userID,
      current,
      pageSize,
      keyword,
      bu,
      field,
      order,
      favorOnly,
      defaultCoverageDim}
  ) {
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
    const pro = await this.prisma.project.findMany({
      where: whereCondition,
      select: {
        id: true,
        pathWithNamespace: true,
        description: true,
        bu: true,
        // language: true,
      },
    });


    return {
      data: pro.map(item=>{
        return {
          id: item.id,
          name: item.pathWithNamespace,
          pathWithNamespace: item.pathWithNamespace,
          description: item.description,
          coverage: "0",
          bu: item.bu,
          branchOptions: [],
          maxCoverage: 0,
          defaultBranch: "master",
          reportTimes: 0,
          lastReportTime: new Date(),
          favored: false,
          createdAt: new Date(),
        }
      }),
      total: pro.length,
    };
  }
}
