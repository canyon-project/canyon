import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createNewCoverageData } from '../../adapter/coverage-data.adapter';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { formatReportObject } from '../../utils/coverage';

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
  constructor(private readonly prisma: PrismaService) {}

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
          coverageId: '',
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

    const dataFormatAndCheckTimeStart = new Date().getTime();
    // ******************************************************
    // ******************************************************
    // ******************************************************
    // 重要方法，数据格式化和检查
    // ******************************************************
    // ******************************************************
    // ******************************************************
    const coverageReport = await this.dataFormatAndCheck(coverageClientDto);
    const {
      coverage,
      sha,
      projectID,
      instrumentCwd,
      reportID,
      compareTarget,
      branch,
      tags,
      env,
    } = coverageReport;
    const dataFormatAndCheckTimeEnd = new Date().getTime();
    // ******************************************************
    // s3覆盖率实体存储
    // ******************************************************
    const coverageDataRepositoryInsertResult =
      await createNewCoverageData(coverage);
    const coverageDataInsertDb = {
      compareTarget,
      sha,
      branch: branch || '-', //branch可能为空
      tags: (tags || []).concat({ env: env }), //tags可能为空
      reporter: Number(currentUserDb.id),
      projectID,
      instrumentCwd,
      reportID,
      covType: 'normal',
      relationID: String(coverageDataRepositoryInsertResult.insertedId),
      consumer: 1,
      key: coverageClientDto.key,
    };
    const coverageInsertDbTimeStart = new Date().getTime();
    // ******************************************************
    // 覆盖率数据落库
    // ******************************************************
    const coverageRepositoryInsertResult = await this.prisma.coverage.create({
      data: coverageDataInsertDb,
    });
    const coverageInsertDbTimeEnd = new Date().getTime();

    return {
      msg: 'ok',
      coverageId: String(coverageRepositoryInsertResult.id),
      coverageDataId: String(coverageDataRepositoryInsertResult.insertedId),
      dataFormatAndCheckTime:
        dataFormatAndCheckTimeEnd - dataFormatAndCheckTimeStart,
      coverageInsertDbTime: coverageInsertDbTimeEnd - coverageInsertDbTimeStart,
    };
  }
  async dataFormatAndCheck(data: CoverageClientDto): Promise<any> {
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
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'coverage对象与canyon.processCwd不匹配',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3.修改覆盖率路径
    // 考虑到会出现大数的情况
    // CanyonUtil.formatReportObject上报时就开启源码回溯
    const coverage = await formatReportObject({
      coverage: data.coverage,
      instrumentCwd,
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
