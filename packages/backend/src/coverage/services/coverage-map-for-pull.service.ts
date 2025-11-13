// import { EntityRepository, QueryOrder } from '@mikro-orm/core';
// import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
// import { CoverHitAggEntity } from '../../../entities/cover-hit-agg.entity';
// import { CoverageEntity } from '../../../entities/coverage.entity';
// import { CoverageMapRelationEntity } from '../../../entities/coverage-map-relation.entity';
// import { RepoEntity } from '../../../entities/repo.entity';
// import { extractIstanbulData } from '../../../helpers/coverage-map-util';
// import { decodeID, encodeID } from '../../../helpers/coverageID';
// import { testExclude } from '../../../helpers/test-exclude';
// import { transformFlatBranchHitsToArrays } from '../../../helpers/utils';
// import { ChService } from '../../ch/ch.service';
import { CodeService } from '../../code/service/code.service';
import { PrismaService } from '../../prisma/prisma.service';
// import { SystemConfigService } from '../../system-config/system-config.service';
import { aggregateForCommits } from '../helpers/aggregate-for-commits';
// import { tupleToMap } from '../coverage.utils';
import { CoverageMapStoreService } from './coverage.map-store.service';
import { CoverageMapForCommitService } from './coverage-map-for-commit.service';

@Injectable()
export class CoverageMapForPullService {
  constructor(
    private readonly configService: ConfigService,
    private readonly codeService: CodeService,
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly prisma: PrismaService,
  ) {}
  async invoke({
    provider,
    repoID,
    pullID,
    buildTarget,
    reportProvider,
    reportID,
    filePath,
    // compareTarget,
    onlyChanged, // TODO 默认为true，显式传false才返回全部
    mode,
  }) {
    const baseUrl = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');

    const projectId = encodeURIComponent(repoID);
    const headers = { 'PRIVATE-TOKEN': token } as Record<string, string>;

    // MR 基本信息，获取 headSha
    const mrResp = await axios.get(
      `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullID}`,
      { headers },
    );
    if (mrResp.status < 200 || mrResp.status >= 300) return {};
    const mr: {
      diff_refs?: { head_sha?: string };
      sha?: string;
      merge_commit_sha?: string;
    } = mrResp.data as any;

    // 优先从 coverage 表中判断候选 SHA（sha、merge_commit_sha、head_sha）是否有覆盖
    const candidates = [
      mr?.sha,
      mr?.merge_commit_sha,
      mr?.diff_refs?.head_sha,
    ].filter((v): v is string => Boolean(v));
    const uniqCandidates = Array.from(new Set(candidates));
    let headSha: string | undefined;
    if (uniqCandidates.length > 0) {
      const covForCandidates = await this.prisma.coverage.findMany(
        {
          where: { provider, repoID, sha: { in: uniqCandidates } },
        },
        // { fields: ['sha'] },
      );
      const available = new Set(covForCandidates.map((c) => c.sha));
      headSha =
        mr?.sha && available.has(mr.sha)
          ? mr.sha
          : mr?.merge_commit_sha && available.has(mr.merge_commit_sha)
            ? mr.merge_commit_sha
            : mr?.diff_refs?.head_sha && available.has(mr.diff_refs.head_sha)
              ? mr.diff_refs.head_sha
              : undefined;
    }
    if (!headSha)
      headSha = mr?.sha || mr?.merge_commit_sha || mr?.diff_refs?.head_sha;
    if (!headSha) return {};

    // MR 提交列表
    const commitsResp = await axios.get(
      `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullID}/commits`,
      { headers },
    );
    if (commitsResp.status < 200 || commitsResp.status >= 300) return {};
    const commits: Array<{ id: string }> = commitsResp.data as Array<{
      id: string;
    }>;
    if (!Array.isArray(commits) || commits.length === 0) return {};

    const allMap = {};

    const commitsRes = await Promise.all(
      commits.map((commit) =>
        this.coverageMapForCommitService.invoke({
          provider: provider,
          repoID: repoID,
          sha: commit.id,
          buildTarget: buildTarget,
          // buildID: q.buildID,
          reportProvider: reportProvider,
          reportID: reportID,
          filePath: filePath,
          // compareTarget: q.compareTarget, // TODO 废弃，用multiple-commits代替
          onlyChanged: onlyChanged,
        }),
      ),
    );

    commitsRes.forEach((item, index) => {
      allMap[commits[index].id] = item;
    });

    // 这里有引用传递，要当心
    const zuizhong = aggregateForCommits(allMap, headSha);

    return {
      // ...allMap
      ...zuizhong,
    };
  }
}
