import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type SceneInfo = {
  scene: Record<string, unknown>;
  sceneKey: string;
};

type CommitRecord = {
  sha: string;
  branch: string;
  compareTarget: string;
  commitMessage: string;
  statements: number;
  newLines: number;
  times: number;
  latestReport: string;
  buildTarget: string;
  versionID: string;
  coverageID: string;
  reportID: string;
  reportProvider: string;
  scenes: SceneInfo[];
};

@Injectable()
export class CommitsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCommitsByRepoID(repoID: string): Promise<CommitRecord[]> {
    // 查询所有相关的 Coverage 记录
    const coverages = await this.prisma.coverage.findMany({
      where: {
        repoID,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (coverages.length === 0) {
      return [];
    }

    // 按 sha 分组
    const commitsMap = new Map<string, CommitRecord>();
    // 用于跟踪每个 commit 的 scene，避免重复
    const commitScenesMap = new Map<string, Map<string, SceneInfo>>();

    for (const coverage of coverages) {
      const sha = coverage.sha;

      // 从 builds JSON 中提取信息
      const builds = Array.isArray(coverage.builds)
        ? coverage.builds
        : typeof coverage.builds === 'object' && coverage.builds !== null
          ? [coverage.builds]
          : [];

      // 获取第一个 build 的信息作为主要信息
      const firstBuild = builds[0] || {};
      const branch = (firstBuild as any).branch || '';
      const reportID = (firstBuild as any).reportID || '';
      const reportProvider = (firstBuild as any).reportProvider || '';

      if (!commitsMap.has(sha)) {
        // 创建新的 commit 记录
        commitsMap.set(sha, {
          sha,
          branch,
          compareTarget: '',
          commitMessage: '',
          statements: 0,
          newLines: 0,
          times: 0,
          latestReport: coverage.updatedAt.toISOString(),
          buildTarget: coverage.buildTarget,
          versionID: coverage.buildHash,
          coverageID: coverage.id,
          reportID,
          reportProvider,
          scenes: [],
        });
        // 初始化 scene map
        commitScenesMap.set(sha, new Map());
      }

      // 更新记录：增加次数，更新最新报告时间
      const record = commitsMap.get(sha)!;
      record.times += 1;

      // 更新最新报告时间
      if (coverage.updatedAt > new Date(record.latestReport)) {
        record.latestReport = coverage.updatedAt.toISOString();
      }

      // 如果有多个 buildTarget，保留第一个
      // 如果有多个 reportID/reportProvider，保留第一个非空的
      if (!record.reportID && reportID) {
        record.reportID = reportID;
      }
      if (!record.reportProvider && reportProvider) {
        record.reportProvider = reportProvider;
      }

      // 添加 scene 信息（如果不存在）
      const sceneMap = commitScenesMap.get(sha)!;
      if (!sceneMap.has(coverage.sceneKey)) {
        sceneMap.set(coverage.sceneKey, {
          scene: (coverage.scene as Record<string, unknown>) || {},
          sceneKey: coverage.sceneKey,
        });
      }
    }

    // 将 scene map 转换为数组并赋值给每个 commit
    for (const [sha, record] of commitsMap.entries()) {
      const sceneMap = commitScenesMap.get(sha)!;
      record.scenes = Array.from(sceneMap.values());
    }

    // 转换为数组，按最新报告时间倒序排列
    return Array.from(commitsMap.values()).sort((a, b) => {
      return (
        new Date(b.latestReport).getTime() - new Date(a.latestReport).getTime()
      );
    });
  }
}
