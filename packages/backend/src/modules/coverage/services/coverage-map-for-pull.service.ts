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
// import { CodeService } from '../../code/service/code.service';
// import { SystemConfigService } from '../../system-config/system-config.service';
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
    // private readonly syscfg: SystemConfigService,
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
  async pull(p) {
    console.log(p);
    return {};
  }
}
