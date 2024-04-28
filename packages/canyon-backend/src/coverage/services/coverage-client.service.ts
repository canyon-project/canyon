import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { formatReportObject } from '../../utils/coverage';
import { Coverage } from '@prisma/client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoverageLog } from '../schemas/coverage-log.schema';
import { CoveragediskService } from './coveragedisk.service';
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

  async invoke(currentUser, coverageClientDto: CoverageClientDto, ip) {
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
      covOrigin: 'handmade', //没有就是手工
      summary: {},
      tag: coverageReport.tags || {},
      relationID: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      //后加的
      coverage: coverageReport.coverage,
    };
    await this.coveragediskService.pushQueue(cov);
    await this.coverageLogModel.create({
      key: cov.key,
      sha: cov.sha,
      projectID: cov.projectID,
      reportID: cov.reportID,
      covType: 'normal',
      covOrigin: cov.covOrigin,
      tag: JSON.stringify(cov.tag),
      createdAt: new Date(),
    });
    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }
}
