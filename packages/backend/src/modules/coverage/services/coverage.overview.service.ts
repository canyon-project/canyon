import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
// @ts-expect-error
import { genSummaryMapByCoverageMap, getSummaryByPath } from 'canyon-data';
import { CoverageEntity } from '../../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../../entities/coverage-map-relation.entity';
import { RepoEntity } from '../../../entities/repo.entity';
import { encodeID } from '../../../helpers/coverageID';
import { ChService } from '../../ch/ch.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import { CoverageMapStoreService } from './coverage.map-store.service';
import { CoverageMapForCommitService } from './coverage-map-for-commit.service';

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
  async getOverview({
    provider,
    repoID,
    sha,
    // buildProvider,
    // buildID,
    // reportProvider,
    // reportID,
    // filePath,
  }) {
    const coverageBuildList = await this.orm.em
      .createQueryBuilder(CoverageEntity)
      .select([
        // 'repoID',
        // "provider",
        // 'sha',
        'buildProvider',
        'buildID',
      ])
      .where({
        provider,
        repoID,
        sha,
      })
      .groupBy(['provider', 'repoID', 'sha', 'buildProvider', 'buildID'])
      .execute();

    const resultList: unknown[] = [];

    for (let i = 0; i < coverageBuildList.length; i++) {
      const { buildProvider, buildID } = coverageBuildList[i];

      const r = await this.coverageMapForCommitService.invoke({
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

      const summary = genSummaryMapByCoverageMap(r, []);
      const sum: any = getSummaryByPath('', summary);

      resultList.push(sum);
    }

    // 先查全量，然后都通过map来做概览计算，以后再优化

    return {
      resultList,
    };
  }
}
