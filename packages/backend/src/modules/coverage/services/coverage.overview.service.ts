import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
// @ts-expect-error canyon-data 可能缺少类型导出，但运行时可用
import { genSummaryMapByCoverageMap, getSummaryByPath } from 'canyon-data';
import { CoverageEntity } from '../../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../../entities/coverage-map-relation.entity';
import { RepoEntity } from '../../../entities/repo.entity';
import { ChService } from '../../ch/ch.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import { CoverageMapStoreService } from './coverage.map-store.service';
import { CoverageMapForCommitService } from './coverage-map-for-commit.service';

// 内部类型定义，提升可读性
type ProviderID = string;
type ReportID = string;

interface CoverageRow {
  buildProvider: string;
  buildID: string;
  reportProvider?: ProviderID | null;
  reportID?: ReportID | null;
  repoID: string;
}

interface TestCaseInfo {
  caseName: string;
  passedCount: number;
  failedCount: number;
  totalCount: number;
  passRate: string;
  reportProvider: ProviderID;
  reportID: ReportID;
  caseUrl: string;
}

interface CoverageOverviewArgs {
  provider: string;
  repoID: string;
  sha: string;
}

const AUTO_CASE_PROVIDERS = new Set<ProviderID>(['mpaas', 'flytest']);
const MANUAL_CASE_PROVIDERS = new Set<ProviderID>(['person']);

@Injectable()
export class CoverageOverviewService {
  constructor(
    private readonly ch: ChService,
    private readonly syscfg: SystemConfigService,
    private readonly coverageMapStoreService: CoverageMapStoreService,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(RepoEntity)
    private readonly repo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageMapRelationEntity)
    private readonly relRepo: EntityRepository<CoverageMapRelationEntity>,
    private readonly orm: MikroORM,
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
  ) {}
  // /api/provider/:provider/repo/:repoID/coverage/overview/commits/{commitSHA}
  // /api/provider/:provider/repo/:repoID/coverage/overview/pulls/{pullNumber}?mode=blockMerge
  //   /api/provider/:provider/repo/:repoID/coverage/overview/multiple-commits/{commitRange}?mode=blockMerge
  //
  //   注：commitRange: {commitSHA1}...{commitSHA2}
  //
  // ```json
  // {
  //   "resultList": [
  //     {
  //       "summary": {
  //         "total": 8225,
  //         "covered": 3668,
  //         "percent": 44.6
  //       }
  //     }
  //   ]
  // }
  private async fetchExternalTestCaseInfo(
    base: string,
    reportProvider: string,
    reportID: string,
  ): Promise<TestCaseInfo> {
    const params = new URLSearchParams();
    params.set('report_provider', reportProvider);
    params.set('report_id', reportID);
    const url = `${base}?${params.toString()}`;

    const def: TestCaseInfo = {
      caseName: reportID,
      passedCount: 0,
      failedCount: 0,
      totalCount: 0,
      passRate: '100.00%',
      reportProvider,
      reportID,
      caseUrl: '',
    };
    try {
      const resp = await axios.get(url, { timeout: 10000 });
      if (!resp || resp.status < 200 || resp.status >= 300) return def;
      const body = (resp.data || {}) as Record<string, unknown>;
      const getNum = (...keys: string[]) => {
        for (const k of keys) {
          const v = body?.[k];
          if (typeof v === 'number') return v;
          if (typeof v === 'string') {
            const n = Number(v);
            if (!Number.isNaN(n)) return n;
          }
        }
        return 0;
      };
      const getStr = (...keys: string[]) => {
        for (const k of keys) {
          const v = body?.[k];
          if (typeof v === 'string' && v) return v;
        }
        return '';
      };
      const caseName = getStr('caseName', 'name', 'title') || reportID;
      const passed = getNum('passed', 'pass', 'passedCount');
      const failed = getNum('failed', 'fail', 'failedCount');
      let total = getNum('total', 'totalCount');
      if (!total) total = passed + failed;
      let passRate = getStr('passRate');
      if (!passRate) {
        const r = total > 0 ? (passed / total) * 100 : 100;
        passRate = `${r.toFixed(2)}%`;
      }
      const caseUrl = getStr('caseUrl');
      return {
        caseName,
        passedCount: Number(passed || 0),
        failedCount: Number(failed || 0),
        totalCount: Number(total || 0),
        passRate,
        reportProvider,
        reportID,
        caseUrl: caseUrl || '',
      };
    } catch {
      return def;
    }
  }
  private async getTestCaseBaseURL(): Promise<string> {
    const cfg =
      (await this.syscfg?.get('system_config.test_case_url')) ||
      process.env.TEST_CASE_BASE_URL;
    return cfg || 'http://test-case.com/report';
  }
  private async fetchTestCaseInfoList(
    coverageRows: Array<{
      reportProvider?: string | null;
      reportID?: string | null;
    }>,
  ): Promise<TestCaseInfo[]> {
    const need = (coverageRows || []).filter(
      (row) =>
        row.reportProvider &&
        AUTO_CASE_PROVIDERS.has(String(row.reportProvider)),
    );
    type Pair = { provider: string; id: string };
    const uniquePairs = new Map<string, Pair>();
    for (const c of need) {
      const provider = String(c.reportProvider || '');
      const id = String(c.reportID || '');
      if (!provider || !id) continue;
      const key = `${provider}|${id}`;
      if (!uniquePairs.has(key)) uniquePairs.set(key, { provider, id });
    }

    const base = await this.getTestCaseBaseURL();
    const tasks = Array.from(uniquePairs.values()).map((p) =>
      this.fetchExternalTestCaseInfo(base, p.provider, p.id),
    );
    const results = await Promise.all(tasks.map((t) => t.catch(() => null)));
    return results.filter(Boolean) as TestCaseInfo[];
  }

  private computeSummaryFromMap(map: unknown): any {
    const summary = genSummaryMapByCoverageMap(map, []);
    return getSummaryByPath('', summary) as any;
  }

  async getOverview({ provider, repoID, sha }: CoverageOverviewArgs) {
    const coverageRows: CoverageRow[] = await this.orm.em
      .createQueryBuilder(CoverageEntity)
      .select(['buildProvider', 'buildID', 'reportProvider', 'reportID'])
      .where({
        provider,
        repoID,
        sha,
      })
      .groupBy([
        'provider',
        'repoID',
        'sha',
        'buildProvider',
        'buildID',
        'reportProvider',
        'reportID',
      ])
      .execute();

    // 拉取测试用例信息列表（仅 mpaas/flytest，按 (reportProvider, reportID) 去重并并发请求）
    const testCaseInfoList = await this.fetchTestCaseInfoList(coverageRows);
    const testCaseIndex = new Map<string, TestCaseInfo>();
    for (const t of testCaseInfoList) {
      testCaseIndex.set(`${t.reportProvider}|${t.reportID}`, t);
    }

    const rowsGroupedByBuild = new Map<
      string,
      {
        buildProvider: string;
        buildID: string;
        reportProvider: string;
        reportID: string;
        repoID: string;
      }[]
    >();

    for (const item of coverageRows) {
      const { buildProvider, buildID, reportProvider, reportID, repoID } = item;
      const buildKey = `${buildProvider}::${buildID}`;
      if (!rowsGroupedByBuild.has(buildKey)) {
        rowsGroupedByBuild.set(buildKey, []);
      }
      rowsGroupedByBuild.get(buildKey)!.push({
        buildProvider,
        buildID,
        reportProvider: reportProvider as string,
        reportID: reportID as string,
        repoID,
      });
    }

    const resultList: unknown[] = [];

    for (const [buildKey, rowsOfThisBuild] of rowsGroupedByBuild) {
      const [buildProvider, buildID] = buildKey.split('::');

      const parentMap = await this.coverageMapForCommitService.invoke({
        provider,
        repoID,
        sha,
        buildProvider,
        buildID,
        reportProvider: undefined,
        reportID: undefined,
        filePath: undefined,
        compareTarget: undefined,
        onlyChanged: false,
      });
      const parentSummary = this.computeSummaryFromMap(parentMap);

      // 并发计算该 build 下的各报告概览
      const childRows = rowsOfThisBuild.filter(
        (r) => r.reportProvider && r.reportID,
      );
      const childSummaries = await Promise.all(
        childRows.map(async (row) => {
          const childMap = await this.coverageMapForCommitService.invoke({
            provider,
            repoID,
            sha,
            buildProvider: row.buildProvider,
            buildID: row.buildID,
            reportProvider: row.reportProvider,
            reportID: row.reportID,
            filePath: undefined,
            compareTarget: undefined,
            onlyChanged: false,
          });
          const summary = this.computeSummaryFromMap(childMap);
          return {
            summary,
            reportProvider: row.reportProvider,
            reportID: row.reportID,
          };
        }),
      );

      const autoCaseList = childSummaries
        .filter((c) => AUTO_CASE_PROVIDERS.has(c.reportProvider))
        .map((c) => ({
          ...c,
          testCaseInfo:
            testCaseIndex.get(`${c.reportProvider}|${c.reportID}`) || undefined,
        }));
      const manualCaseList = childSummaries.filter((c) =>
        MANUAL_CASE_PROVIDERS.has(c.reportProvider),
      );

      resultList.push({
        buildID,
        buildProvider,
        summary: parentSummary,
        modeList: [
          {
            mode: 'auto',
            summary: parentSummary,
            caseList: autoCaseList,
          },
          {
            mode: 'manual',
            summary: parentSummary,
            caseList: manualCaseList,
          },
        ],
      });
    }
    return {
      resultList,
    };
  }
}
