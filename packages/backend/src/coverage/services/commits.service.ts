import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type SceneInfo = {
  scene: Record<string, unknown>;
  sceneKey: string;
};

type BuildTargetSceneInfo = {
  buildTarget: string;
  scenes: SceneInfo[];
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
  buildTargets: string[];
  buildTargetScenes: BuildTargetSceneInfo[];
  versionID: string;
  coverageID: string;
  reportID: string;
  reportProvider: string;
  scenes: SceneInfo[];
  provider: string;
  authorName?: string | null;
  authorEmail?: string | null;
  createdAt?: string;
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
    // 用于跟踪每个 commit 的 buildTarget，避免重复
    const commitBuildTargetsMap = new Map<string, Set<string>>();
    // 用于跟踪每个 commit 的每个 buildTarget 对应的 scene
    const commitBuildTargetScenesMap = new Map<
      string,
      Map<string, Map<string, SceneInfo>>
    >();
    // 用于跟踪每个 commit 的 provider
    const commitProviderMap = new Map<string, string>();

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
          buildTargets: [],
          buildTargetScenes: [],
          versionID: coverage.buildHash,
          coverageID: coverage.id,
          reportID,
          reportProvider,
          scenes: [],
          provider: coverage.provider,
        });
        // 初始化 scene map 和 buildTarget set
        commitScenesMap.set(sha, new Map());
        commitBuildTargetsMap.set(sha, new Set<string>());
        commitBuildTargetScenesMap.set(sha, new Map());
        commitProviderMap.set(sha, coverage.provider);
      }

      // 更新记录：增加次数，更新最新报告时间
      const record = commitsMap.get(sha)!;
      record.times += 1;

      // 更新最新报告时间
      if (coverage.updatedAt > new Date(record.latestReport)) {
        record.latestReport = coverage.updatedAt.toISOString();
      }

      // 收集 buildTarget
      const buildTargetSet = commitBuildTargetsMap.get(sha)!;
      const buildTarget =
        coverage.buildTarget && coverage.buildTarget.trim() !== ''
          ? coverage.buildTarget
          : '';
      if (buildTarget) {
        buildTargetSet.add(buildTarget);
      }

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

      // 为每个 buildTarget 收集对应的 scene
      if (buildTarget) {
        const buildTargetScenesMap = commitBuildTargetScenesMap.get(sha)!;
        if (!buildTargetScenesMap.has(buildTarget)) {
          buildTargetScenesMap.set(buildTarget, new Map());
        }
        const buildTargetSceneMap = buildTargetScenesMap.get(buildTarget)!;
        if (!buildTargetSceneMap.has(coverage.sceneKey)) {
          buildTargetSceneMap.set(coverage.sceneKey, {
            scene: (coverage.scene as Record<string, unknown>) || {},
            sceneKey: coverage.sceneKey,
          });
        }
      }
    }

    // 将 scene map 转换为数组并赋值给每个 commit，同时设置 buildTargets 和 buildTargetScenes
    for (const [sha, record] of commitsMap.entries()) {
      const sceneMap = commitScenesMap.get(sha)!;
      record.scenes = Array.from(sceneMap.values());

      // 设置 buildTargets 数组
      const buildTargetSet = commitBuildTargetsMap.get(sha)!;
      record.buildTargets = Array.from(buildTargetSet);
      // 如果没有 buildTargets，使用第一个 buildTarget（如果有的话）
      if (record.buildTargets.length === 0 && record.buildTarget) {
        record.buildTargets = [record.buildTarget];
      }

      // 设置 buildTargetScenes 数组
      const buildTargetScenesMap = commitBuildTargetScenesMap.get(sha)!;
      record.buildTargetScenes = Array.from(buildTargetScenesMap.entries()).map(
        ([bt, sceneMap]) => ({
          buildTarget: bt,
          scenes: Array.from(sceneMap.values()),
        }),
      );
    }

    // 从 Commit 表中查询 commit 的详细信息
    const commits = Array.from(commitsMap.values());
    const commitShas = commits.map((c) => c.sha);
    const providers = Array.from(
      new Set(commits.map((c) => commitProviderMap.get(c.sha) || c.provider)),
    );

    // 批量查询 Commit 表
    const commitDetails = await this.prisma.commit.findMany({
      where: {
        sha: { in: commitShas },
        repoID,
        provider: { in: providers },
      },
    });

    // 构建 commit 详情映射：key 为 provider+repoID+sha
    const commitDetailsMap = new Map<string, (typeof commitDetails)[0]>();
    for (const commitDetail of commitDetails) {
      const key = `${commitDetail.provider}+${commitDetail.repoID}+${commitDetail.sha}`;
      commitDetailsMap.set(key, commitDetail);
    }

    // 为每个 commit 填充详细信息
    for (const commit of commits) {
      const provider = commitProviderMap.get(commit.sha) || commit.provider;
      const key = `${provider}+${repoID}+${commit.sha}`;
      const commitDetail = commitDetailsMap.get(key);

      if (commitDetail) {
        commit.commitMessage = commitDetail.commitMessage;
        commit.authorName = commitDetail.authorName;
        commit.authorEmail = commitDetail.authorEmail;
        commit.createdAt = commitDetail.createdAt.toISOString();
      }
    }

    // 转换为数组，按最新报告时间倒序排列
    return commits.sort((a, b) => {
      return (
        new Date(b.latestReport).getTime() - new Date(a.latestReport).getTime()
      );
    });
  }
}
