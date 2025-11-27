import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { testExclude } from 'src/helpers/test-exclude';
import { aggregateForCommits } from '../helpers/aggregate-for-commits';
import { CoverageMapForCommitService } from './coverage-map-for-commit.service';

@Injectable()
export class CoverageMapForMultipleCommitsService {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly configService: ConfigService,
  ) {}

  private async getGitLabCfg() {
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }

  /**
   * 获取两个 commit 之间的所有 commit SHA 列表（包含 from 和 to）
   * 使用 GitLab API 的 compare 接口
   */
  private async getCommitsBetween({
    repoID,
    fromSha,
    toSha,
  }: {
    repoID: string;
    fromSha: string;
    toSha: string;
  }): Promise<string[]> {
    const { base, token } = await this.getGitLabCfg();
    const pid = encodeURIComponent(repoID);
    // GitLab compare API: /projects/{id}/repository/compare?from={from}&to={to}
    const url = `${base}/api/v4/projects/${pid}/repository/compare?from=${encodeURIComponent(fromSha)}&to=${encodeURIComponent(toSha)}`;
    const resp = await axios.get(url, {
      headers: {
        'PRIVATE-TOKEN': token,
      },
    });

    if (resp.status < 200 || resp.status >= 300) {
      throw new BadRequestException('无法获取 GitLab commit 列表');
    }

    // GitLab 返回的 commits 数组，按时间顺序从旧到新
    const commits = resp.data.commits || [];
    return commits.map((c: { id?: string }) => c.id).filter(Boolean);
  }

  async invoke({
    provider,
    repoID,
    subjectID, // 格式: commit1...commit2，其中 commit1 是 from，commit2 是 to（基线）
    buildTarget,
    reportProvider,
    reportID,
    filePath,
    onlyChanged,
  }: {
    provider: string;
    repoID: string;
    subjectID: string; // commit1...commit2，commit1 是 from，commit2 是基线
    buildTarget?: string;
    reportProvider?: string;
    reportID?: string;
    filePath?: string;
    onlyChanged?: boolean;
  }) {
    // 解析 subjectID: commit1...commit2
    // commit1 是 from，commit2 是 to（基线）
    const parts = subjectID.split('...');
    if (parts.length !== 2) {
      throw new BadRequestException(
        'subjectID 格式错误，应为 commit1...commit2',
      );
    }
    const [fromSha, toSha] = parts;
    if (!fromSha || !toSha) {
      throw new BadRequestException('subjectID 格式错误，from 和 to 不能为空');
    }

    const fromShaTrimmed = fromSha.trim();
    const toShaTrimmed = toSha.trim();

    // 获取从 fromSha 到 toSha 之间的所有 commit
    const commitShas = await this.getCommitsBetween({
      repoID,
      fromSha: fromShaTrimmed,
      toSha: toShaTrimmed,
    });

    if (commitShas.length === 0) {
      throw new BadRequestException('未找到任何 commit');
    }

    // 确保 fromSha 在列表中，如果不在则添加到开头
    if (!commitShas.includes(fromShaTrimmed)) {
      commitShas.unshift(fromShaTrimmed);
    }
    // 确保 toSha（基线）在列表中，如果不在则添加
    if (!commitShas.includes(toShaTrimmed)) {
      commitShas.push(toShaTrimmed);
    }

    // 对每个 commit 获取覆盖率数据
    const coverageByCommit: Record<string, Record<string, any>> = {};
    for (const sha of commitShas) {
      try {
        const coverage = await this.coverageMapForCommitService.invoke({
          provider,
          repoID,
          sha,
          buildTarget: buildTarget || '',
          reportProvider,
          reportID,
          filePath,
          onlyChanged: false, // 获取所有文件，后续再过滤
        });
        console.log(coverage, 'coverage');
        // 转换格式以匹配 aggregateForCommits 的期望
        // aggregateForCommits 期望每个文件有 contentHash 字段
        // statementMap 中的每个 entry 应该有 contentHash 字段（从 extractIstanbulData 中获取）
        const transformedCoverage: Record<string, any> = {};
        for (const [filePathKey, fileData] of Object.entries(coverage)) {
          const data = fileData as any;
          transformedCoverage[filePathKey] = {
            path: filePathKey,
            statementMap: data.statementMap || {},
            fnMap: data.fnMap || {},
            branchMap: data.branchMap || {},
            s: data.s || {},
            f: data.f || {},
            b: data.b || {}, // b 可能是对象或数组，aggregateForCommits 不处理它
            contentHash: data.contentHash || '',
          };
        }
        coverageByCommit[sha] = transformedCoverage;
      } catch (error) {
        // 如果某个 commit 没有覆盖率数据，跳过
        console.warn(`无法获取 commit ${sha} 的覆盖率数据:`, error);
        coverageByCommit[sha] = {};
      }
    }

    // 使用 aggregateForCommits 进行聚合，以 toSha（commit2）为基线
    if (!coverageByCommit[toShaTrimmed]) {
      throw new BadRequestException(
        `基线 commit ${toShaTrimmed} 没有覆盖率数据`,
      );
    }

    const aggregated = aggregateForCommits(coverageByCommit, toShaTrimmed);

    // 如果指定了 onlyChanged，需要过滤出变更的文件
    // 这里需要获取 diff 信息来确定哪些文件被修改了
    if (onlyChanged) {
      // TODO: 实现 onlyChanged 过滤逻辑
      // 可以通过 getDiffChangedLines 获取变更文件列表
      // 目前先返回所有文件
    }

    // 返回格式与 coverage-map-for-commit.service.ts 保持一致
    // aggregateForCommits 返回的是 CoverageByFile，格式已经正确
    const filtered = testExclude(
      aggregated,
      JSON.stringify({
        exclude: ['dist/**'],
      }),
    );
    return filtered;
  }
}
