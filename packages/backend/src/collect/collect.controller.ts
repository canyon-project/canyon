import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { CodeService } from '../code/service/code.service';
import { PrismaService } from '../prisma/prisma.service';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageMapInitDto } from './dto/coverage-map-init.dto';
import { formatCoverageData } from './helpers/formatCoverageData';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageMapInitService } from './services/coverage-map-init.service';

// @Public()
@Controller('api/coverage')
export class CollectController {
  constructor(
    private coverageClientService: CoverageClientService,
    private coverageMapInitService: CoverageMapInitService,
    private codeService: CodeService,
    private prisma: PrismaService,
  ) {}
  @Post('client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', {
      coverage: formatCoverageData(coverageClientDto.coverage),
      scene: coverageClientDto.scene,
    });
  }

  @Post('map/init')
  async coverageMapInit(@Body() coverageMapInitDto: CoverageMapInitDto) {
    // 过滤掉 coverage 中 value 里有 oldPath 字段的项
    const filteredCoverage: Record<string, any> = {};
    for (const [key, value] of Object.entries(coverageMapInitDto.coverage)) {
      if (value && typeof value === 'object' && !('oldPath' in value)) {
        filteredCoverage[key] = value;
      }
    }
    coverageMapInitDto.coverage = filteredCoverage;

    // 从 coverage 的第一个值中提取参数
    const coverageValues = Object.values(coverageMapInitDto.coverage);
    if (coverageValues.length > 0) {
      const firstEntry = coverageValues[0] as any;
      // 如果第一个值中存在这些字段，则覆盖 DTO 中的值
      if (firstEntry.sha !== undefined) {
        coverageMapInitDto.sha = firstEntry.sha;
        console.log(`从 coverage 的第一个值中提取的 sha: ${firstEntry.sha}`);
      }
      if (firstEntry.provider !== undefined) {
        coverageMapInitDto.provider = firstEntry.provider;
        console.log(
          `从 coverage 的第一个值中提取的 provider: ${firstEntry.provider}`,
        );
      }
      if (firstEntry.repoID !== undefined) {
        coverageMapInitDto.repoID = firstEntry.repoID;
        console.log(
          `从 coverage 的第一个值中提取的 repoID: ${firstEntry.repoID}`,
        );
      }
      // TODO 这里特殊一点，如果 DTO 中已经有 instrumentCwd，就不覆盖
      if (
        firstEntry.instrumentCwd !== undefined &&
        !coverageMapInitDto.instrumentCwd
      ) {
        coverageMapInitDto.instrumentCwd = firstEntry.instrumentCwd;
        console.log(
          `从 coverage 的第一个值中提取的 instrumentCwd: ${firstEntry.instrumentCwd}`,
        );
      }
      if (firstEntry.buildTarget !== undefined) {
        coverageMapInitDto.buildTarget = firstEntry.buildTarget;
        console.log(
          `从 coverage 的第一个值中提取的 buildTarget: ${firstEntry.buildTarget}`,
        );
      }

      // 处理 diff 参数
      if (coverageMapInitDto.diff) {
        const { subject, subjectID } = coverageMapInitDto.diff;
        const { repoID, provider } = coverageMapInitDto;

        if (!subject || !subjectID) {
          throw new BadRequestException(
            'diff 参数中 subject 和 subjectID 不能为空',
          );
        }

        if (!repoID || !provider) {
          throw new BadRequestException(
            '创建 diff 需要 repoID 和 provider 参数',
          );
        }

        // 解析 subjectID 获取 from 和 to commit SHA
        const parts = subjectID.split('...');
        if (parts.length !== 2) {
          throw new BadRequestException(
            'subjectID 格式错误，应为 commit1...commit2',
          );
        }
        const [fromSha, toSha] = parts.map((s) => s.trim());
        if (!fromSha || !toSha) {
          throw new BadRequestException(
            'subjectID 格式错误，from 和 to 不能为空',
          );
        }

        // 检查并插入缺失的 commit
        await Promise.all([
          this.codeService.insertCommitIfNotExists({
            sha: fromSha,
            provider,
            repoID,
          }),
          this.codeService.insertCommitIfNotExists({
            sha: toSha,
            provider,
            repoID,
          }),
        ]);

        // 先删除旧数据（根据 provider、repoID、subjectID、subject 匹配）
        await this.prisma.diff.deleteMany({
          where: {
            provider,
            repo_id: repoID,
            subject_id: subjectID,
            subject,
          },
        });

        // 通过 service 获取代码差异数据
        const diffData = await this.codeService.getDiffForMultipleCommits({
          repoID,
          provider,
          subjectID,
        });

        // 保存到数据库
        await this.prisma.diff.createMany({
          data: diffData,
          skipDuplicates: true,
        });

        console.log(
          `已创建 diff: provider=${provider}, repoID=${repoID}, subject=${subject}, subjectID=${subjectID}`,
        );
      }

      return this.coverageMapInitService.init(coverageMapInitDto);
    } else {
      return {
        success: false,
        message: 'Coverage data is empty, cannot extract parameters.',
      };
    }
  }
}
