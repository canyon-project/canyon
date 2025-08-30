import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CoverageEntity } from '../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity';
import { ChModule } from '../ch/ch.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { CoverageController } from './coverage.controller';
import { CoverageGitService } from './coverage.git.service';
import { CoverageMapService } from './coverage.map.service';
import { CoverageMapStoreService } from './coverage.map-store.service';
import { CoverageOverviewService } from './coverage.overview.service';
import { CoverageOverviewResolver } from './coverage.resolver';
import { CoverageSummaryService } from './coverage.summary.service';

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
    CoverageOverviewResolver,
  ],
})
export class CoverageModule {}
