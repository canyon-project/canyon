import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { checkCoverageType } from '../helpers/checkCoverageType';
import { generateObjectSignature } from '../helpers/generateObjectSignature';

type CoverageKind = 'hit' | 'map';
@Injectable()
export class CoverageClientService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke(reporter: string, coverageClientDto: CoverageClientDto) {
    const {
      provider,
      sha,
      repoID,
      coverage,
      instrumentCwd,
      reportID, // Option
      branch, // Option
      compareTarget, // Option
      // buildID, // Option
      // buildProvider, // Option
      reportProvider, // Option
      buildTarget, // Option 默认空字符串
    } = coverageClientDto;

    // 第一步：生成coverageID，核心7个字段，确保顺序
    const coverageID = generateObjectSignature({
      provider,
      repoID,
      sha,
      buildTarget,
      reportProvider,
      reportID,
    });
    // 生成versionID
    const versionID = generateObjectSignature({
      provider,
      repoID,
      sha,
      buildTarget,
    });

    // 第二步：检查coverage类型
    const coverageType = checkCoverageType(coverage as any) as CoverageKind;

    // 第三步：插入 coverage 表
    const coverageCreateRes = await this.insertCoverage(
      reporter,
      coverageID,
      versionID,
      coverageClientDto,
    );

    return this.prisma.log.create({
      data: {
        // @ts-expect-error
        content: coverageClientDto,
      },
    });
  }

  async insertCoverage(
    reporter: string,
    coverageID: string,
    versionID: string,
    {
      provider,
      sha,
      repoID,
      instrumentCwd,
      reportID, // Option
      branch, // Option
      compareTarget, // Option
      buildID, // Option
      buildProvider, // Option
      reportProvider, // Option
      buildTarget,
    }: CoverageClientDto,
  ) {
    const coverageCreateRes = await this.prisma.coverage.create({
      data: {
        id: coverageID,
        provider: provider,
        repoID,
        sha,
        instrumentCwd,
        reportID: reportID,
        reportProvider: reportProvider,
        branches: branch || '',
        builds: [],
        // compareTarget: compareTarget || '',
        // buildID: buildID || '',
        // buildProvider: buildProvider || '',
        reporter: reporter,
        buildTarget: buildTarget || '',
        versionID,
        // buildProvider: '',
        // buildID: '',
        // compareTarget: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return coverageCreateRes;
  }
}
