import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CoverageEntity } from '../../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../../entities/coverage-map-relation.entity';
import { RepoEntity } from '../../../entities/repo.entity';
import { testExclude } from '../../../helpers/test-exclude';
// import { transformFlatBranchHitsToArrays } from '../../../helpers/utils';
import { ChService } from '../../ch/ch.service';
import { ConfigService } from '../../config/config.service';
// import { CodeService } from '../../code/service/code.service';
// import { ConfigService } from '../../system-config/system-config.service';
// import {
//   mergeFunctionHitsByBlock,
//   mergeStatementHitsByBlock,
//   trimInstrumentCwd,
//   tupleToMap,
// } from '../coverage.utils';
import { CoverageMapStoreService } from './coverage.map-store.service';

@Injectable()
export class CoverageMapForPullService {
  constructor(
    private readonly ch: ChService,
    private readonly cfg: ConfigService,
    private readonly mapStore: CoverageMapStoreService,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(RepoEntity)
    private readonly repo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageMapRelationEntity)
    private readonly relRepo: EntityRepository<CoverageMapRelationEntity>,
    // private readonly codeService: CodeService,
  ) {}

  async multipleCommits(p) {
    console.log(p);

    return {};
  }
  async pull({ provider, repoID, pullID, filePath, mode }) {
    // console.log(p);
    const token = await this.cfg.get('git_provider[0].private_token');
    const url = await this.cfg.get('git_provider[0].url');

    // 确定基线commit

    // MR 基本信息，获取 headSha
    // const mrResp = await axios.get(
    //   `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}`,
    //   { headers },
    // );

    const a = await fetch(
      `${url}/api/v4/projects/${repoID}/merge_requests/${pullID}/commits`,
      {
        headers: {
          'PRIVATE-TOKEN': token || '',
        },
      },
    ).then((r) => r.json());

    return a;
  }
}
