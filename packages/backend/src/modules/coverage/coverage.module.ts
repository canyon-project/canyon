import { Module } from '@nestjs/common'
import { CoverageController } from './coverage.controller'
import { CoverageSummaryService } from './coverage.summary.service'
import { CoverageMapService } from './coverage.map.service'
import { CoverageMapStoreService } from './coverage.map-store.service'
import { CoverageGitService } from './coverage.git.service'
import { SystemConfigModule } from '../system-config/system-config.module'
import { ChModule } from '../ch/ch.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { RepoEntity } from '../../entities/repo.entity'
import { CoverageEntity } from '../../entities/coverage.entity'
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity'
import {CoverageOverviewResolver} from "./coverage.resolver";
import {CoverageOverviewService} from "./coverage.overview.service";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [CoverageEntity, CoverageMapRelationEntity],
    }),
    ChModule,
    SystemConfigModule,
  ],
  controllers: [CoverageController],
  providers: [
    CoverageOverviewService,
    CoverageSummaryService,
    CoverageMapService,
    CoverageMapStoreService,
    CoverageGitService,
    CoverageOverviewResolver
  ],
})
export class CoverageModule {}
