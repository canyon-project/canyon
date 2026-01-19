import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CodeService } from './service/code.service';
@Controller('api/code')
export class CodeController {
  constructor(
    private readonly codeService: CodeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('file')
  async getFileContent(
    @Query('repoID') repoID: string,
    @Query('sha') sha?: string,
    @Query('analysisNumber') analysisNumber?: string,
    @Query('filepath') filepath?: string,
    @Query('provider') provider?: string,
  ) {
    if (!repoID || !filepath) {
      return { content: null };
    }
    if (!sha && !analysisNumber) {
      return { content: null };
    }
    try {
      return await this.codeService.getFileContent({
        repoID,
        sha: sha || null,
        analysisNumber: analysisNumber || null,
        filepath,
        provider: provider || null,
      });
    } catch (error) {
      console.error('Failed to get file content:', error);
      return { content: null };
    }
  }

  @Get('diff')
  async getDiff(
    @Query('repoID') repoID?: string,
    @Query('provider') provider?: string,
  ) {
    if (!repoID || !provider) {
      return { data: [], total: 0 };
    }

    // 查询所有 diff 记录
    const diffs = await this.prisma.diff.findMany({
      where: {
        provider,
        repo_id: repoID,
      },
      select: {
        id: true,
        provider: true,
        repo_id: true,
        from: true,
        to: true,
        subject: true,
        subject_id: true,
        path: true,
        additions: true,
        deletions: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    // 按 subject_id 和 subject 分组，收集文件列表
    const recordsMap = new Map<
      string,
      {
        id: string;
        provider: string;
        repoID: string;
        from: string;
        to: string;
        subject: string;
        subjectID: string;
        files: Array<{
          path: string;
          additions: number[];
          deletions: number[];
        }>;
        buildTargets: string[];
      }
    >();

    for (const diff of diffs) {
      const key = `${diff.subject_id}_${diff.subject}`;
      if (!recordsMap.has(key)) {
        recordsMap.set(key, {
          id: diff.id,
          provider: diff.provider,
          repoID: diff.repo_id,
          from: diff.from,
          to: diff.to,
          subject: diff.subject,
          subjectID: diff.subject_id,
          files: [],
          buildTargets: [],
        });
      }
      const record = recordsMap.get(key)!;
      record.files.push({
        path: diff.path,
        additions: diff.additions as number[],
        deletions: diff.deletions as number[],
      });
    }

    const analysisRecords = Array.from(recordsMap.values());

    // 批量查询 coverage 表，获取每个 to commit 的所有 buildTarget
    // 收集所有唯一的 to commit
    const toCommits = new Set<string>();
    for (const record of analysisRecords) {
      toCommits.add(record.to);
    }

    // 批量查询所有相关的 coverage 记录
    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider,
        repoID,
        sha: {
          in: Array.from(toCommits),
        },
      },
      select: {
        sha: true,
        buildTarget: true,
      },
    });

    // 按 sha 分组，收集每个 commit 的 buildTarget
    const buildTargetsMap = new Map<string, Set<string>>();
    for (const coverage of coverages) {
      if (!buildTargetsMap.has(coverage.sha)) {
        buildTargetsMap.set(coverage.sha, new Set<string>());
      }
      const buildTargetSet = buildTargetsMap.get(coverage.sha)!;
      if (coverage.buildTarget && coverage.buildTarget.trim() !== '') {
        buildTargetSet.add(coverage.buildTarget);
      }
    }

    // 为每个分析记录设置 buildTargets
    for (const record of analysisRecords) {
      const buildTargetSet = buildTargetsMap.get(record.to);
      record.buildTargets = buildTargetSet
        ? Array.from(buildTargetSet)
        : [];
    }

    return {
      data: analysisRecords,
      total: analysisRecords.length,
    };
  }

  @Delete('diff')
  async deleteDiff(
    @Query('subjectID') subjectID: string,
    @Query('subject') subject: string,
    @Query('repoID') repoID: string,
    @Query('provider') provider: string,
  ) {
    if (!subjectID || !subject || !repoID || !provider) {
      return { success: false, message: '缺少必要参数' };
    }

    await this.prisma.diff.deleteMany({
      where: {
        provider,
        repo_id: repoID,
        subject_id: subjectID,
        subject,
      },
    });

    return { success: true };
  }

  @Post('diff')
  async postDiff(
    @Body()
    body: {
      repoID: string;
      provider: string;
      subject: string;
      subjectID: string;
    },
  ) {
    const { repoID, provider, subjectID, subject } = body;
    console.log(repoID, provider, subjectID, subject, 'body');
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
    const data = await this.codeService.getDiffForMultipleCommits({
      repoID,
      provider,
      subjectID,
    });

    // 保存到数据库
    await this.prisma.diff.createMany({
      data: data,
      skipDuplicates: true,
    });

    return data;
  }
}
