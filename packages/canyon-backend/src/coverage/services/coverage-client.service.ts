import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CoverageClientDto } from "../dto/coverage-client.dto";
import { Coverage } from "@prisma/client";
import { CoveragediskService } from "./core/coveragedisk.service";
import { formatReportObject } from "../../utils/coverage";
import { compressedData } from "../../utils/zstd";
/**
 * 上传覆盖率，十分重要的服务
 */

// 改版完以后，不能在没有创建之前上传覆盖率，并且上传完覆盖率以后需要手动触发生成报告

function checkUserID(id) {
  if (isNaN(Number(id))) {
    return -1;
  } else {
    return Number(id);
  }
}

@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    private coveragediskService: CoveragediskService,
  ) {}

  async invoke(currentUser, coverageClientDto: CoverageClientDto) {
    // 1.检验 user 是否存在
    const currentUserDb = await this.prisma.user.findFirst({
      where: {
        id: checkUserID(currentUser),
      },
    });
    if (!currentUserDb) {
      throw new UnauthorizedException();
    }

    // 3.检验 project 是否存在
    const project = await this.prisma.project.findFirst({
      where: {
        id: coverageClientDto.projectID,
      },
      select: {
        instrumentCwd: true,
      },
    });
    if (!project) {
      //   返回错误，项目不存在
      throw new HttpException("project not found", 400);
    }

    // 注意这里还是小驼峰
    if (!coverageClientDto.reportID || coverageClientDto.reportID === "-") {
      coverageClientDto.reportID = coverageClientDto.sha;
    }
    if (
      !coverageClientDto.compareTarget ||
      coverageClientDto.compareTarget === "-"
    ) {
      const initCoverage = await this.prisma.coverage.findFirst({
        where: {
          covType: "all",
          projectID: coverageClientDto.projectID,
          sha: coverageClientDto.sha,
        },
        select: {
          compareTarget: true,
        },
      });
      coverageClientDto.compareTarget = initCoverage
        ? initCoverage.compareTarget
        : coverageClientDto.sha;
    }
    // ******************************************************
    // ******************************************************
    // ******************************************************
    // 重要方法，数据格式化和检查
    // ******************************************************
    // ******************************************************
    // ******************************************************
    const coverageReport = coverageClientDto;
    const cov: Coverage & { coverage: any; instrumentCwd: string } = {
      id: "",
      sha: coverageReport.sha,
      branch: coverageReport.branch || "-",
      compareTarget: coverageReport.compareTarget,
      provider: "gitlab",
      buildProvider: coverageReport.buildProvider || "gitlab",
      buildID: coverageReport.buildID || "-",
      projectID: coverageReport.projectID,
      reporter: currentUser,
      reportID: coverageReport.reportID,
      covType: "normal",
      branchesCovered: 0,
      branchesTotal: 0,
      functionsCovered: 0,
      functionsTotal: 0,
      linesCovered: 0,
      linesTotal: 0,
      statementsCovered: 0,
      statementsTotal: 0,
      newlinesCovered: 0,
      newlinesTotal: 0,
      hit: "",
      coverage: coverageReport.coverage,
      instrumentCwd: coverageReport.instrumentCwd,
      createdAt: coverageReport.createdAt || new Date(),
      updatedAt: coverageReport.updatedAt || new Date(),

      //后加的
    };
    const dataFormatAndCheckQueueDataToBeConsumed =
      await this.dataFormatAndCheck(cov, project?.instrumentCwd);

    // 这里要有一个地方分开bfs

    const objMap = {};
    const objHit = {};

    // TODO: Hit表多存一个statementMap，这里可以大大减少消费时候的计算量

    // TODO: 存一张表里，coverage-data，hit、map

    // TODO: 写一个job，做数据库迁移了。

    // 查询的时候支持tag查询，要把ut排除掉了

    function fn(sMap) {
      // 只保留start
      const obj = {};
      Object.entries(sMap).forEach(([key, value]: any) => {
        obj[key] = {
          start: {
            line: value.start.line,
          },
        };
      });
      return obj;
    }

    Object.entries(dataFormatAndCheckQueueDataToBeConsumed.coverage).forEach(
      ([path, value]: any) => {
        objMap[path] = {
          fnMap: value.fnMap,
          branchMap: value.branchMap,
          statementMap: value.statementMap,
        };
        objHit[path] = {
          f: value.f,
          b: value.b,
          s: value.s,
          statementMap: fn(value.statementMap),
        };
      },
    );

    const arr = await Promise.all(
      Object.entries(objMap).map(([path, value]: any) => {
        return compressedData(JSON.stringify(value)).then((r) => ({
          path: path,
          map: r,
        }));
      }),
    );

    await this.prisma.coverageMap.createMany({
      data: arr.map(({ path, map }: any) => {
        const { projectID, sha } = dataFormatAndCheckQueueDataToBeConsumed;
        return {
          id: `__${projectID}__${sha}__${path}__`,
          map: map, //???没删除bfs
          projectID: projectID,
          sha: sha,
          path: path,
        };
      }),
      skipDuplicates: true,
    });

    await this.coveragediskService.pushQueue({
      ...dataFormatAndCheckQueueDataToBeConsumed,
      coverage: objHit,
    });
    return {
      msg: "ok",
      coverageId: "",
      dataFormatAndCheckTime: "",
      coverageInsertDbTime: "",
    };
  }

  async dataFormatAndCheck(data, projectInstrumentCwd): Promise<any> {
    data = this.regularData(data);
    const instrumentCwd = data.instrumentCwd;
    const noPass = [];
    for (const coverageKey in data.coverage) {
      if (coverageKey.includes(instrumentCwd)) {
      } else {
        noPass.push(coverageKey);
      }
    }
    if (noPass.length > 0) {
      console.log(`coverage对象与canyon.processCwd不匹配`);
    }

    // 3.修改覆盖率路径
    // 考虑到会出现大数的情况
    // CanyonUtil.formatReportObject上报时就开启源码回溯
    const coverage = await formatReportObject({
      coverage: data.coverage,
      instrumentCwd,
      projectInstrumentCwd,
    }).then((res) => res.coverage);
    return {
      ...data,
      coverage: coverage,
    };
  }
  regularData(data: any) {
    const obj = {};
    const { coverage } = data;
    // 针对windows电脑，把反斜杠替换成正斜杠
    // 做数据过滤，去除 \u0000 字符
    for (const coverageKey in coverage) {
      if (!coverageKey.includes("\u0000")) {
        obj[coverageKey] = coverage[coverageKey];
      }
    }
    return {
      ...data,
      coverage: obj,
    };
  }
}
