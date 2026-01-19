import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
} from '@nestjs/common';
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

    // 收集所有唯一的 commit SHA（from 和 to）
    const allCommits = new Set<string>();
    for (const record of analysisRecords) {
      allCommits.add(record.from);
      allCommits.add(record.to);
    }

    // 批量查询 commit 表，获取 commit 概要信息
    const commitIds = Array.from(allCommits).map(
      (sha) => `${provider}${repoID}${sha}`,
    );
    const commits = await this.prisma.commit.findMany({
      where: {
        id: {
          in: commitIds,
        },
      },
      select: {
        id: true,
        sha: true,
        commitMessage: true,
        authorName: true,
        authorEmail: true,
        createdAt: true,
      },
    });

    // 构建 commit 信息映射表
    const commitInfoMap = new Map<
      string,
      {
        commitMessage: string;
        authorName: string | null;
        authorEmail: string | null;
        createdAt: Date;
      }
    >();
    for (const commit of commits) {
      commitInfoMap.set(commit.sha, {
        commitMessage: commit.commitMessage,
        authorName: commit.authorName,
        authorEmail: commit.authorEmail,
        createdAt: commit.createdAt,
      });
    }

    // 批量查询 coverage 表，获取每个 to commit 的所有 buildTarget
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

    // 为每个分析记录设置 buildTargets 和 commit 信息，并映射字段名
    const mappedRecords = analysisRecords.map((record) => {
      const buildTargetSet = buildTargetsMap.get(record.to);
      const buildTargets = buildTargetSet ? Array.from(buildTargetSet) : [];

      // 添加 commit 概要信息
      const fromCommitInfo = commitInfoMap.get(record.from);
      const toCommitInfo = commitInfoMap.get(record.to);

      // 映射字段名：from -> after, to -> now
      return {
        id: record.id,
        provider: record.provider,
        repoID: record.repoID,
        after: record.from,
        now: record.to,
        subject: record.subject,
        subjectID: record.subjectID,
        files: record.files,
        buildTargets,
        fromCommit: fromCommitInfo || null,
        toCommit: toCommitInfo || null,
      };
    });

    return {
      data: mappedRecords,
      total: mappedRecords.length,
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

    // 解析 subjectID 获取 from 和 to commit SHA
    const parts = subjectID.split('...');
    if (parts.length !== 2) {
      throw new BadRequestException(
        'subjectID 格式错误，应为 commit1...commit2',
      );
    }
    const [fromSha, toSha] = parts.map((s) => s.trim());
    if (!fromSha || !toSha) {
      throw new BadRequestException('subjectID 格式错误，from 和 to 不能为空');
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
