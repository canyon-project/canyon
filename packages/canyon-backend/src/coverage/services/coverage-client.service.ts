import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { Coverage } from '@prisma/client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoverageLog } from '../schemas/coverage-log.schema';
import { CoveragediskService } from './core/coveragedisk.service';
import {formatReportObject} from "../../utils/coverage";
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
    @InjectModel(CoverageLog.name)
    private coverageLogModel: Model<CoverageLog>,
    private coveragediskService: CoveragediskService,
  ) {}

  async oldInvoke(currentUser, coverageClientDto: CoverageClientDto, ip) {
    // 1.检验 user 是否存在
    const currentUserDb = await this.prisma.user.findFirst({
      where: {
        id: checkUserID(currentUser),
      },
    });
    if (!currentUserDb) {
      throw new UnauthorizedException();
    }

    // 2.防止插入重复key
    if (coverageClientDto.key) {
      const isRepeated = await this.prisma.coverage.findFirst({
        where: {
          key: coverageClientDto.key,
        },
      });
      if (isRepeated) {
        return {
          msg: 'ok',
          coverageId: 'isRepeated',
          dataFormatAndCheckTime: '',
          coverageInsertDbTime: '',
        };
      }
    }

    coverageClientDto.sha = coverageClientDto.commitSha;

    // 注意这里还是小驼峰
    if (!coverageClientDto.reportID || coverageClientDto.reportID === '-') {
      coverageClientDto.reportID = coverageClientDto.sha;
    }
    if (
      !coverageClientDto.compareTarget ||
      coverageClientDto.compareTarget === '-'
    ) {
      coverageClientDto.compareTarget = coverageClientDto.sha;
    }
    // ******************************************************
    // ******************************************************
    // ******************************************************
    // 重要方法，数据格式化和检查
    // ******************************************************
    // ******************************************************
    // ******************************************************
    const coverageReport = coverageClientDto;
    const cov: Coverage & { coverage: any } = {
      id: '',
      key: coverageReport.key || '',
      sha: coverageReport.sha,
      branch: coverageReport.branch || '-',
      compareTarget: coverageReport.compareTarget,
      provider: 'gitlab',
      projectID: coverageReport.projectID,
      instrumentCwd: coverageReport.instrumentCwd,
      reporter: currentUser,
      reportID: coverageReport.reportID,
      covType: 'normal',
      // rule: 'auto', //没有就是手工
      summary: {},
      tag: coverageReport.tags || {},
      relationID: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      //后加的
      coverage: coverageReport.coverage,
    };
    const project = await this.prisma.project.findFirst({
      where: {
        id: cov.projectID,
      },
      select:{
        instrumentCwd:true
      }
    });
    const dataFormatAndCheckQueueDataToBeConsumed =
      await this.dataFormatAndCheck(
        cov,
        project?.instrumentCwd,
      );

    await this.coveragediskService.pushQueue(dataFormatAndCheckQueueDataToBeConsumed);
    await this.coverageLogModel.create({
      key: cov.key,
      sha: cov.sha,
      projectID: cov.projectID,
      reportID: cov.reportID,
      covType: 'normal',
      tag: JSON.stringify(cov.tag),
      instrumentCwd: cov.instrumentCwd,
      createdAt: new Date(),
    });
    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }

  async invoke(currentUser, coverageClientDto: CoverageClientDto, ip) {
    const projects = await this.prisma.project.findMany({
      where: {
        id: {
          contains: coverageClientDto.projectID,
          mode: 'insensitive', // Ignore case sensitivity
          not: {
            contains: '-ut',
          },
        },
      },
    });
    if (projects.length > 0) {
      const resList = [];
      for (let i = 0; i < projects.length; i++) {
        resList.push(
          await this.oldInvoke(
            currentUser,
            {
              ...coverageClientDto,
              projectID: projects[i].id,
            },
            ip,
          ),
        );
      }
      return resList[0];
    } else {
      return this.oldInvoke(currentUser, coverageClientDto, ip);
    }
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
      if (!coverageKey.includes('\u0000')) {
        obj[coverageKey] = coverage[coverageKey];
      }
    }
    return {
      ...data,
      coverage: obj,
    };
  }
}
